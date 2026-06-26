using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TeamPoll.Tests.TestUtilities;

/// <summary>
/// Hosts the real API in-process for testing. Supplies placeholder Entra config and a connection
/// string (the SQL container's when set; an unreachable placeholder otherwise — validation/auth
/// tests short-circuit before any DB call). Swaps the auth scheme for <see cref="TestAuthHandler"/>.
/// </summary>
public sealed class TeamPollWebAppFactory : WebApplicationFactory<Program>
{
    /// <summary>The SQL Server connection string. Null for tests that never reach the database.</summary>
    public string? ConnectionString { get; init; }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AzureAd:Instance"] = "https://login.microsoftonline.com/",
                ["AzureAd:TenantId"] = "00000000-0000-0000-0000-000000000000",
                ["AzureAd:ClientId"] = "00000000-0000-0000-0000-000000000000",
                ["AzureAd:Audience"] = "api://00000000-0000-0000-0000-000000000000",
                ["Swagger:Enabled"] = "false",
                ["ConnectionStrings:Db"] = ConnectionString
                    ?? "Server=localhost,11433;Database=master;User Id=sa;Password=Unused_NoConnect1;"
                       + "TrustServerCertificate=True;Encrypt=False;Connect Timeout=1",
            });
        });

        builder.ConfigureTestServices(services =>
        {
            services.AddAuthentication(TestAuthHandler.SchemeName)
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.SchemeName, _ => { });

            services.PostConfigure<AuthenticationOptions>(options =>
            {
                options.DefaultScheme = TestAuthHandler.SchemeName;
                options.DefaultAuthenticateScheme = TestAuthHandler.SchemeName;
                options.DefaultChallengeScheme = TestAuthHandler.SchemeName;
            });
        });
    }
}
