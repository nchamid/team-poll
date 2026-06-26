namespace TeamPoll.Domain;

/// <summary>
/// A poll question with a fixed set of options. Ownership is keyed on the
/// <see cref="CreatedBy"/> audit column (Entra oid); see ADR-006.
/// </summary>
public class Poll
{
    public int Id { get; set; }

    /// <summary>The poll question. 1–280 characters (ADR-010); NVARCHAR(280).</summary>
    public string Question { get; set; } = null!;

    /// <summary>Closed polls are read-only and always show results.</summary>
    public bool IsClosed { get; set; }

    /// <summary>Owner display name cached from the JWT <c>name</c> claim at creation (ADR-006).</summary>
    public string OwnerDisplayName { get; set; } = null!;

    public ICollection<PollOption> Options { get; set; } = new List<PollOption>();
    public ICollection<Vote> Votes { get; set; } = new List<Vote>();

    // --- audit (mandatory 6) ---
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    /// <summary>Entra oid of the poll owner — the canonical ownership key.</summary>
    public string CreatedBy { get; set; } = null!;
    public string UpdatedBy { get; set; } = null!;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
