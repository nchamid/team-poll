namespace TeamPoll.Domain;

/// <summary>
/// One caller's vote on a poll. One vote per user per poll is enforced by the
/// filtered unique index <c>UX_Votes_PollId_VoterOid</c> on (PollId, VoterOid)
/// WHERE IsDeleted = 0 (ADR-007). A vote change updates the existing row's
/// <see cref="PollOptionId"/> — no second row is inserted (ADR-008).
/// </summary>
public class Vote
{
    public int Id { get; set; }
    public int PollId { get; set; }
    public Poll Poll { get; set; } = null!;

    public int PollOptionId { get; set; }
    public PollOption PollOption { get; set; } = null!;

    /// <summary>Entra oid of the voter.</summary>
    public Guid VoterOid { get; set; }

    // --- audit (mandatory 6) ---
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = null!;
    public string UpdatedBy { get; set; } = null!;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
