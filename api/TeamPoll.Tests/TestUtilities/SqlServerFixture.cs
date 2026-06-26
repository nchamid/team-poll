using System.Text.RegularExpressions;
using Microsoft.Data.SqlClient;
using Testcontainers.MsSql;
using Xunit;

namespace TeamPoll.Tests.TestUtilities;

/// <summary>
/// Spins up an ephemeral SQL Server container and applies the real <c>database/</c> migrations +
/// procedures, so integration tests run against the actual schema (including the filtered unique
/// index <c>UX_Votes_PollId_VoterOid</c>). If Docker isn't available the fixture records itself
/// unavailable and tests skip rather than fail — local <c>dotnet test</c> stays green; CI (Docker
/// present) runs them fully. The in-memory provider is never used (api-testing-guidelines.md).
/// </summary>
public sealed class SqlServerFixture : IAsyncLifetime
{
    private MsSqlContainer? _container;

    public bool Available { get; private set; }
    public string? ConnectionString { get; private set; }
    public string SkipReason { get; private set; } = "SQL Server container not started.";

    public async Task InitializeAsync()
    {
        try
        {
            _container = new MsSqlBuilder().Build();
            using var startTimeout = new CancellationTokenSource(TimeSpan.FromSeconds(240));
            await _container.StartAsync(startTimeout.Token);

            ConnectionString = _container.GetConnectionString();
            await ApplyDatabaseScriptsAsync();
            Available = true;
        }
        catch (Exception ex)
        {
            Available = false;
            SkipReason = $"Docker/SQL Server not available — integration tests skipped ({ex.GetType().Name}).";
            if (_container is not null)
            {
                try { await _container.DisposeAsync(); } catch { /* best effort */ }
                _container = null;
            }
        }
    }

    public async Task DisposeAsync()
    {
        if (_container is not null)
        {
            await _container.DisposeAsync();
        }
    }

    /// <summary>Clears all rows between tests (FK-safe order) so each test starts from a known state.</summary>
    public async Task ResetAsync()
    {
        if (!Available)
        {
            return;
        }

        await using var connection = new SqlConnection(ConnectionString);
        await connection.OpenAsync();
        await using var command = new SqlCommand(
            "DELETE FROM dbo.Votes; DELETE FROM dbo.PollOptions; DELETE FROM dbo.Polls; DELETE FROM dbo.Users;",
            connection);
        await command.ExecuteNonQueryAsync();
    }

    private async Task ApplyDatabaseScriptsAsync()
    {
        var root = FindRepositoryRoot();
        var migrationFiles = Directory
            .GetFiles(Path.Combine(root, "database", "migrations"), "*.sql")
            .Where(file => !file.EndsWith("_Rollback.sql", StringComparison.OrdinalIgnoreCase))
            .OrderBy(file => file, StringComparer.Ordinal);
        var procedureFiles = Directory
            .GetFiles(Path.Combine(root, "database", "procedures"), "*.sql")
            .OrderBy(file => file, StringComparer.Ordinal);

        await using var connection = new SqlConnection(ConnectionString);
        await connection.OpenAsync();

        foreach (var file in migrationFiles.Concat(procedureFiles))
        {
            var script = await File.ReadAllTextAsync(file);
            foreach (var batch in SplitOnGo(script))
            {
                await using var command = new SqlCommand(batch, connection);
                await command.ExecuteNonQueryAsync();
            }
        }
    }

    // SQL Server batch separator GO is a client construct, not T-SQL — split on it before executing.
    private static IEnumerable<string> SplitOnGo(string script) =>
        Regex.Split(script, @"(?im)^[\t ]*GO[\t ]*;?[\t ]*$")
            .Where(batch => !string.IsNullOrWhiteSpace(batch));

    private static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null)
        {
            if (Directory.Exists(Path.Combine(directory.FullName, "database", "migrations")))
            {
                return directory.FullName;
            }

            directory = directory.Parent;
        }

        throw new InvalidOperationException("Could not locate the repository root (database/migrations).");
    }
}

/// <summary>Shares one SQL Server container across all integration test classes in the collection.</summary>
[CollectionDefinition(Name)]
public sealed class SqlServerCollection : ICollectionFixture<SqlServerFixture>
{
    public const string Name = "sqlserver";
}
