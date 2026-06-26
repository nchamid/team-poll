using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TeamPoll.Contracts;
using TeamPoll.Data;
using TeamPoll.Domain;

namespace TeamPoll.Services;

/// <summary>
/// Poll domain logic. Single-table reads/writes use EF Core; the two aggregating
/// reads use stored procs via parameterised SQL (api-data-access.md). Reads are
/// AsNoTracking. The global soft-delete filter excludes deleted rows everywhere.
/// </summary>
public sealed class PollService(TeamPollDbContext db, ILogger<PollService> logger) : IPollService
{
    public async Task<PollListResponse> GetPollsAsync(
        CallerContext caller, int page, int pageSize, CancellationToken cancellationToken)
    {
        var normalizedPage = page < PollConstants.MinPage ? PollConstants.MinPage : page;
        var normalizedSize = pageSize < 1
            ? PollConstants.DefaultPageSize
            : Math.Min(pageSize, PollConstants.MaxPageSize);

        // Aggregating read → stored proc. Every dynamic value is a SqlParameter.
        // usp_GetPolls takes @CallerOid for contract symmetry; it does not filter rows
        // (the list shows all polls to every Member) — isOwner/canManage are computed below.
        var rows = await db.PollListRows
            .FromSqlRaw(
                "EXEC dbo.usp_GetPolls @Page, @PageSize, @CallerOid",
                new SqlParameter("@Page", normalizedPage),
                new SqlParameter("@PageSize", normalizedSize),
                new SqlParameter("@CallerOid", caller.Oid))
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var totalCount = rows.Count > 0 ? rows[0].TotalCount : 0;

        var items = rows.Select(row =>
        {
            var isOwner = row.OwnerOid == caller.Oid;
            return new PollSummaryDto
            {
                Id = row.Id,
                Question = row.Question,
                OptionCount = row.OptionCount,
                TotalVotes = row.TotalVotes,
                IsClosed = row.IsClosed,
                OwnerDisplayName = row.OwnerDisplayName,
                IsOwner = isOwner,
                CanManage = isOwner || caller.IsAdmin,
            };
        }).ToArray();

        return new PollListResponse
        {
            Items = items,
            Page = normalizedPage,
            PageSize = normalizedSize,
            TotalCount = totalCount,
        };
    }

    public async Task<int> CreatePollAsync(
        CallerContext caller, string question, IReadOnlyList<string> options, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var ownerOid = caller.Oid.ToString();

        var poll = new Poll
        {
            Question = question,
            IsClosed = false,
            OwnerDisplayName = caller.DisplayName,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = ownerOid,
            UpdatedBy = ownerOid,
            IsDeleted = false,
        };

        var displayOrder = 0;
        foreach (var optionText in options)
        {
            poll.Options.Add(new PollOption
            {
                Text = optionText,
                DisplayOrder = displayOrder++,
                CreatedAt = now,
                UpdatedAt = now,
                CreatedBy = ownerOid,
                UpdatedBy = ownerOid,
                IsDeleted = false,
            });
        }

        db.Polls.Add(poll);
        await db.SaveChangesAsync(cancellationToken);

        // IDs and counts only — never the question/option text (api-logging.md).
        logger.LogInformation(
            "Poll created. PollId={PollId} OptionCount={OptionCount}", poll.Id, poll.Options.Count);

        return poll.Id;
    }

    public async Task<ServiceResult<PollDetailDto>> GetPollDetailAsync(
        CallerContext caller, int pollId, CancellationToken cancellationToken)
    {
        // Header via single-table EF read (AsNoTracking). Options included for the
        // labels/order; results figures come from the proc and are gated below.
        var poll = await db.Polls
            .AsNoTracking()
            .Include(candidate => candidate.Options)
            .FirstOrDefaultAsync(candidate => candidate.Id == pollId, cancellationToken);

        if (poll is null)
        {
            return ServiceResult<PollDetailDto>.NotFound("This poll is no longer available.");
        }

        var detail = await BuildDetailAsync(caller, poll, cancellationToken);
        return ServiceResult<PollDetailDto>.Success(detail);
    }

    public async Task<ServiceResult<PollDetailDto>> CastVoteAsync(
        CallerContext caller, int pollId, int optionId, CancellationToken cancellationToken)
    {
        var poll = await db.Polls
            .Include(candidate => candidate.Options)
            .FirstOrDefaultAsync(candidate => candidate.Id == pollId, cancellationToken);

        if (poll is null)
        {
            return ServiceResult<PollDetailDto>.NotFound("This poll is no longer available.");
        }

        if (poll.IsClosed)
        {
            return ServiceResult<PollDetailDto>.Conflict("This poll is closed and no longer accepts votes.");
        }

        // The option must exist and belong to this poll — single check, no second round trip.
        var targetOption = poll.Options.FirstOrDefault(option => option.Id == optionId);
        if (targetOption is null)
        {
            return ServiceResult<PollDetailDto>.Invalid("That option does not belong to this poll.");
        }

        var now = DateTime.UtcNow;
        var voterOid = caller.Oid.ToString();

        // Upsert the caller's single vote (ADR-008): update the existing row's option,
        // or insert a new row. The DB's filtered unique index guarantees at most one.
        var existingVote = await db.Votes
            .FirstOrDefaultAsync(
                vote => vote.PollId == pollId && vote.VoterOid == caller.Oid, cancellationToken);

        if (existingVote is null)
        {
            db.Votes.Add(new Vote
            {
                PollId = pollId,
                PollOptionId = targetOption.Id,
                VoterOid = caller.Oid,
                CreatedAt = now,
                UpdatedAt = now,
                CreatedBy = voterOid,
                UpdatedBy = voterOid,
                IsDeleted = false,
            });
        }
        else
        {
            existingVote.PollOptionId = targetOption.Id;
            existingVote.UpdatedAt = now;
            existingVote.UpdatedBy = voterOid;
        }

        await db.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Vote cast. PollId={PollId}", pollId);

        // Re-read the header without tracking so the returned detail reflects committed state.
        var refreshed = await db.Polls
            .AsNoTracking()
            .Include(candidate => candidate.Options)
            .FirstAsync(candidate => candidate.Id == pollId, cancellationToken);

        var detail = await BuildDetailAsync(caller, refreshed, cancellationToken);
        return ServiceResult<PollDetailDto>.Success(detail);
    }

    public async Task<ServiceResult<bool>> ClosePollAsync(
        CallerContext caller, int pollId, CancellationToken cancellationToken)
    {
        var poll = await db.Polls
            .FirstOrDefaultAsync(candidate => candidate.Id == pollId, cancellationToken);

        if (poll is null)
        {
            return ServiceResult<bool>.NotFound("This poll is no longer available.");
        }

        if (!CanManage(caller, poll))
        {
            // Ownership/role violation → 403, never 404 (api-record-access.md).
            return ServiceResult<bool>.Forbidden("You do not have permission to close this poll.");
        }

        if (poll.IsClosed)
        {
            // Idempotent no-op.
            return ServiceResult<bool>.Success(true);
        }

        poll.IsClosed = true;
        poll.UpdatedAt = DateTime.UtcNow;
        poll.UpdatedBy = caller.Oid.ToString();
        await db.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Poll closed. PollId={PollId}", pollId);
        return ServiceResult<bool>.Success(true);
    }

    public async Task<ServiceResult<bool>> DeletePollAsync(
        CallerContext caller, int pollId, CancellationToken cancellationToken)
    {
        var poll = await db.Polls
            .FirstOrDefaultAsync(candidate => candidate.Id == pollId, cancellationToken);

        if (poll is null)
        {
            return ServiceResult<bool>.NotFound("This poll is no longer available.");
        }

        if (!CanManage(caller, poll))
        {
            return ServiceResult<bool>.Forbidden("You do not have permission to delete this poll.");
        }

        var now = DateTime.UtcNow;
        poll.IsDeleted = true;
        poll.DeletedAt = now;
        poll.UpdatedAt = now;
        poll.UpdatedBy = caller.Oid.ToString();
        await db.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Poll deleted. PollId={PollId}", pollId);
        return ServiceResult<bool>.Success(true);
    }

    /// <summary>Builds the gated detail DTO for a poll header already loaded with its options.</summary>
    private async Task<PollDetailDto> BuildDetailAsync(
        CallerContext caller, Poll poll, CancellationToken cancellationToken)
    {
        var isOwner = poll.CreatedBy == caller.Oid.ToString();
        var canManage = isOwner || caller.IsAdmin;

        // The caller's own vote — single-table EF read.
        var myVoteOptionId = await db.Votes
            .AsNoTracking()
            .Where(vote => vote.PollId == poll.Id && vote.VoterOid == caller.Oid)
            .Select(vote => (int?)vote.PollOptionId)
            .FirstOrDefaultAsync(cancellationToken);

        var callerHasVoted = myVoteOptionId.HasValue;

        // Per-option counts via the aggregating proc — always fetched so totalVotes is
        // accurate, but the per-option figures are nulled out when results are gated.
        var resultRows = await db.PollOptionResultRows
            .FromSqlRaw(
                "EXEC dbo.usp_GetPollOptionResults @PollId",
                new SqlParameter("@PollId", poll.Id))
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var countByOption = resultRows.ToDictionary(row => row.OptionId, row => row.VoteCount);
        var totalVotes = resultRows.Sum(row => row.VoteCount);

        var resultsVisible = isOwner || caller.IsAdmin || callerHasVoted;

        var options = poll.Options
            .OrderBy(option => option.DisplayOrder)
            .Select(option =>
            {
                var voteCount = countByOption.TryGetValue(option.Id, out var count) ? count : 0;
                var percentage = totalVotes > 0
                    ? (int)Math.Round(voteCount * 100.0 / totalVotes, MidpointRounding.AwayFromZero)
                    : 0;

                return new PollOptionResultDto
                {
                    Id = option.Id,
                    Text = option.Text,
                    DisplayOrder = option.DisplayOrder,
                    VoteCount = resultsVisible ? voteCount : null,
                    Percentage = resultsVisible ? percentage : null,
                };
            })
            .ToArray();

        return new PollDetailDto
        {
            Id = poll.Id,
            Question = poll.Question,
            IsClosed = poll.IsClosed,
            OwnerDisplayName = poll.OwnerDisplayName,
            IsOwner = isOwner,
            CanManage = canManage,
            TotalVotes = totalVotes,
            MyVote = myVoteOptionId,
            ResultsVisible = resultsVisible,
            Options = options,
        };
    }

    private static bool CanManage(CallerContext caller, Poll poll) =>
        poll.CreatedBy == caller.Oid.ToString() || caller.IsAdmin;
}
