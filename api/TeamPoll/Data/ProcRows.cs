namespace TeamPoll.Data;

/// <summary>
/// Row shape returned by <c>dbo.usp_GetPolls</c>. One row per poll on the
/// requested page, plus a window <see cref="TotalCount"/> for pagination.
/// Owner identity (<see cref="OwnerOid"/>) is returned so the API computes
/// isOwner/canManage in C#; it is never the proc's job to know the caller's role.
/// </summary>
public sealed class PollListRow
{
    public int Id { get; set; }
    public string Question { get; set; } = null!;
    public int OptionCount { get; set; }
    public int TotalVotes { get; set; }
    public bool IsClosed { get; set; }
    public string OwnerDisplayName { get; set; } = null!;
    public Guid OwnerOid { get; set; }
    public int TotalCount { get; set; }
}

/// <summary>
/// Row shape returned by <c>dbo.usp_GetPollOptionResults</c> — one per option.
/// The proc projects <c>optionRow.Id AS OptionId</c>; it also returns Text/DisplayOrder,
/// which EF ignores here (the API reads those from the loaded options).
/// </summary>
public sealed class PollOptionResultRow
{
    public int OptionId { get; set; }
    public int VoteCount { get; set; }
}
