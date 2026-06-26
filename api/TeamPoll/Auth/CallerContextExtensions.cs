using System.Security.Claims;
using TeamPoll.Services;

namespace TeamPoll.Auth;

/// <summary>
/// Distils the authenticated <see cref="ClaimsPrincipal"/> into a <see cref="CallerContext"/>
/// at the controller boundary, so service logic never touches claims or <c>HttpContext</c>.
/// Reads the Entra <c>oid</c> (v2 short name or the v1 schema URI), the display name, and the
/// <c>Poll.Admin</c> app role from either the <c>roles</c> claim or <see cref="ClaimTypes.Role"/>.
/// </summary>
public static class CallerContextExtensions
{
    private const string OidClaim = "oid";
    private const string OidSchemaClaim = "http://schemas.microsoft.com/identity/claims/objectidentifier";
    private const string NameClaim = "name";
    private const string RolesClaim = "roles";

    public static CallerContext ToCallerContext(this ClaimsPrincipal user)
    {
        var oidValue = user.FindFirstValue(OidClaim) ?? user.FindFirstValue(OidSchemaClaim);
        if (!Guid.TryParse(oidValue, out var oid))
        {
            // [Authorize] guarantees an authenticated principal and Entra always issues `oid`
            // for user tokens — a missing oid is an exceptional misconfiguration, not a normal path.
            throw new InvalidOperationException("Authenticated caller is missing a valid 'oid' claim.");
        }

        var displayName = user.FindFirstValue(NameClaim)
            ?? user.FindFirstValue(ClaimTypes.Name)
            ?? "Unknown";

        var isAdmin = user.IsInRole(PollConstants.AdminRole)
            || user.Claims.Any(claim =>
                (claim.Type == RolesClaim || claim.Type == ClaimTypes.Role)
                && claim.Value == PollConstants.AdminRole);

        return new CallerContext { Oid = oid, DisplayName = displayName, IsAdmin = isAdmin };
    }
}
