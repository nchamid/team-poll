using Microsoft.AspNetCore.Mvc.Testing;

namespace TeamPoll.Tests.TestUtilities;

/// <summary>Builds clients carrying synthetic identity headers read by <see cref="TestAuthHandler"/>.</summary>
public static class HttpClientTestExtensions
{
    /// <summary>A client authenticated as the given user (with optional app roles).</summary>
    public static HttpClient AsUser(
        this WebApplicationFactory<Program> factory, Guid oid, string name = "Test User", params string[] roles)
    {
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.OidHeader, oid.ToString());
        client.DefaultRequestHeaders.Add(TestAuthHandler.NameHeader, name);
        if (roles.Length > 0)
        {
            client.DefaultRequestHeaders.Add(TestAuthHandler.RolesHeader, string.Join(',', roles));
        }

        return client;
    }

    /// <summary>An unauthenticated client (no identity headers) — used to assert 401.</summary>
    public static HttpClient Anonymous(this WebApplicationFactory<Program> factory) => factory.CreateClient();
}
