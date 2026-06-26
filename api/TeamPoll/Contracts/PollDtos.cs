using System.ComponentModel.DataAnnotations;

namespace TeamPoll.Contracts;

/// <summary>A poll as shown in the list. Per-option results are not included here.</summary>
public record PollSummaryDto
{
    public int Id { get; init; }
    public string Question { get; init; } = null!;
    public int OptionCount { get; init; }
    public int TotalVotes { get; init; }
    public bool IsClosed { get; init; }
    public string OwnerDisplayName { get; init; } = null!;

    /// <summary>True when the caller created this poll.</summary>
    public bool IsOwner { get; init; }

    /// <summary>True when the caller may close/delete (owner or Poll.Admin).</summary>
    public bool CanManage { get; init; }
}

/// <summary>Paginated list of polls.</summary>
public record PollListResponse
{
    public PollSummaryDto[] Items { get; init; } = [];
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
}

/// <summary>Request body for creating a poll.</summary>
public record CreatePollRequest
{
    [Required(AllowEmptyStrings = false, ErrorMessage = "Add a question.")]
    [StringLength(280, MinimumLength = 1, ErrorMessage = "The question must be 1–280 characters.")]
    public string Question { get; init; } = null!;

    [Required(ErrorMessage = "Add at least two options.")]
    public string[] Options { get; init; } = [];
}

/// <summary>A single option with its (gated) result figures.</summary>
public record PollOptionResultDto
{
    public int Id { get; init; }
    public string Text { get; init; } = null!;
    public int DisplayOrder { get; init; }

    /// <summary>Null when results are not visible to the caller (ADR-009).</summary>
    public int? VoteCount { get; init; }

    /// <summary>Null when results are not visible to the caller (ADR-009).</summary>
    public int? Percentage { get; init; }
}

/// <summary>Full poll detail: header, the caller's vote, and gated per-option results.</summary>
public record PollDetailDto
{
    public int Id { get; init; }
    public string Question { get; init; } = null!;
    public bool IsClosed { get; init; }
    public string OwnerDisplayName { get; init; } = null!;
    public bool IsOwner { get; init; }
    public bool CanManage { get; init; }
    public int TotalVotes { get; init; }

    /// <summary>The PollOptionId the caller voted for, or null if they haven't voted.</summary>
    public int? MyVote { get; init; }

    /// <summary>True when the caller may see per-option counts (owner/admin/has-voted).</summary>
    public bool ResultsVisible { get; init; }

    public PollOptionResultDto[] Options { get; init; } = [];
}

/// <summary>Request body for casting/changing the caller's vote.</summary>
public record CastVoteRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Select an option.")]
    public int OptionId { get; init; }
}

/// <summary>Response body for a successful poll creation.</summary>
public record CreatePollResponse
{
    public int PollId { get; init; }
}
