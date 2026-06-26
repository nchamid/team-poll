namespace TeamPoll.Domain;

/// <summary>
/// Directory user row, idempotently upserted by EnsureUserMiddleware on first
/// authenticated request (api-auth.md). Keyed on the Entra oid (pseudonymous).
/// Not in the poll request path — OwnerDisplayName is cached on <see cref="Poll"/>.
/// Never logged.
/// </summary>
public class User
{
    public int Id { get; set; }

    /// <summary>Entra oid — the unique directory identity.</summary>
    public Guid Oid { get; set; }

    public string DisplayName { get; set; } = null!;
    public string Email { get; set; } = null!;

    // --- audit (mandatory 6) ---
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = null!;
    public string UpdatedBy { get; set; } = null!;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
