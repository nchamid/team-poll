namespace TeamPoll.Domain;

/// <summary>A single selectable option on a <see cref="Poll"/>. 2–6 options per poll (boundary-validated).</summary>
public class PollOption
{
    public int Id { get; set; }
    public int PollId { get; set; }
    public Poll Poll { get; set; } = null!;

    /// <summary>Option label. 1–80 characters; NVARCHAR(80).</summary>
    public string Text { get; set; } = null!;

    /// <summary>Ordering within the poll.</summary>
    public int DisplayOrder { get; set; }

    public ICollection<Vote> Votes { get; set; } = new List<Vote>();

    // --- audit (mandatory 6) ---
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = null!;
    public string UpdatedBy { get; set; } = null!;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
