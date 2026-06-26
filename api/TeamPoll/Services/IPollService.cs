using TeamPoll.Contracts;

namespace TeamPoll.Services;

/// <summary>Poll domain operations. Controllers stay thin and delegate here.</summary>
public interface IPollService
{
    Task<PollListResponse> GetPollsAsync(
        CallerContext caller, int page, int pageSize, CancellationToken cancellationToken);

    Task<int> CreatePollAsync(
        CallerContext caller, string question, IReadOnlyList<string> options, CancellationToken cancellationToken);

    Task<ServiceResult<PollDetailDto>> GetPollDetailAsync(
        CallerContext caller, int pollId, CancellationToken cancellationToken);

    Task<ServiceResult<PollDetailDto>> CastVoteAsync(
        CallerContext caller, int pollId, int optionId, CancellationToken cancellationToken);

    Task<ServiceResult<bool>> ClosePollAsync(
        CallerContext caller, int pollId, CancellationToken cancellationToken);

    Task<ServiceResult<bool>> DeletePollAsync(
        CallerContext caller, int pollId, CancellationToken cancellationToken);
}
