namespace TeamPoll.Services;

/// <summary>
/// The authenticated caller, distilled from JWT claims at the controller boundary.
/// Passed into the service so service logic never touches <c>HttpContext</c>
/// (api-performance.md / api-coding-standards.md).
/// </summary>
public sealed record CallerContext
{
    /// <summary>The caller's Entra oid.</summary>
    public required Guid Oid { get; init; }

    /// <summary>The caller's display name (JWT <c>name</c>), cached as OwnerDisplayName on create.</summary>
    public required string DisplayName { get; init; }

    /// <summary>True when the caller holds the Poll.Admin app role.</summary>
    public required bool IsAdmin { get; init; }
}
