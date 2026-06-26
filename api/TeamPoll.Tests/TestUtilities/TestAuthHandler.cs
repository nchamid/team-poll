using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace TeamPoll.Tests.TestUtilities;

/// <summary>
/// Test-only authentication. Replaces Microsoft.Identity.Web token validation so tests never
/// touch the real Entra tenant. Reads synthetic identity from request headers: the caller's oid,
/// display name, and a comma-separated role list. No <c>X-Test-Oid</c> header ⇒ unauthenticated
/// (so <c>[Authorize]</c> endpoints return 401).
/// </summary>
public sealed class TestAuthHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "Test";
    public const string OidHeader = "X-Test-Oid";
    public const string NameHeader = "X-Test-Name";
    public const string RolesHeader = "X-Test-Roles";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(OidHeader, out var oid) || string.IsNullOrWhiteSpace(oid))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var claims = new List<Claim>
        {
            new("oid", oid.ToString()),
            new("name", Request.Headers[NameHeader].FirstOrDefault() ?? "Test User"),
        };

        var roles = Request.Headers[RolesHeader].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(roles))
        {
            foreach (var role in roles.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }
        }

        var identity = new ClaimsIdentity(claims, SchemeName);
        var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
