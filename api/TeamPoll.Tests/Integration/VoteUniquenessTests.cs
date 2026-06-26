using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TeamPoll.Contracts;
using TeamPoll.Data;
using TeamPoll.Domain;
using TeamPoll.Tests.TestUtilities;
using Xunit;

namespace TeamPoll.Tests.Integration;

/// <summary>
/// Proves the one-vote-per-user rule is enforced at the database by the filtered unique index
/// <c>UX_Votes_PollId_VoterOid</c> — not merely by application logic. Analyst hard requirement.
/// Docker-gated against the real schema.
/// </summary>
[Collection(SqlServerCollection.Name)]
public sealed class VoteUniquenessTests : IAsyncLifetime, IDisposable
{
    private static readonly Guid Alice = Guid.Parse("a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1");
    private static readonly Guid Bob = Guid.Parse("b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2");
    private static readonly Guid Carol = Guid.Parse("c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3");

    private readonly SqlServerFixture _fixture;
    private readonly TeamPollWebAppFactory _factory;

    public VoteUniquenessTests(SqlServerFixture fixture)
    {
        _fixture = fixture;
        _factory = new TeamPollWebAppFactory { ConnectionString = fixture.ConnectionString };
    }

    public async Task InitializeAsync()
    {
        if (_fixture.Available)
        {
            await _fixture.ResetAsync();
        }
    }

    public Task DisposeAsync() => Task.CompletedTask;

    public void Dispose() => _factory.Dispose();

    [SkippableFact]
    public async Task A_second_voter_does_not_overwrite_the_first()
    {
        Skip.IfNot(_fixture.Available, _fixture.SkipReason);

        // Arrange — Alice owns a poll; Bob and Carol are two different voters.
        var alice = _factory.AsUser(Alice, "Alice");
        var bob = _factory.AsUser(Bob, "Bob");
        var carol = _factory.AsUser(Carol, "Carol");
        var pollId = await CreatePollAsync(alice, "Best day?", "Mon", "Tue");
        var options = (await GetDetailAsync(alice, pollId)).Options;
        var optionA = options[0].Id;
        var optionB = options[1].Id;

        // Act — two distinct voters cast different options.
        (await bob.PutAsJsonAsync($"/api/polls/{pollId}/vote", new { optionId = optionA })).EnsureSuccessStatusCode();
        (await carol.PutAsJsonAsync($"/api/polls/{pollId}/vote", new { optionId = optionB })).EnsureSuccessStatusCode();

        // Assert — both votes survive; neither overwrote the other.
        var detail = await GetDetailAsync(alice, pollId);
        Assert.Equal(2, detail.TotalVotes);
        Assert.Equal(1, detail.Options.Single(option => option.Id == optionA).VoteCount);
        Assert.Equal(1, detail.Options.Single(option => option.Id == optionB).VoteCount);
    }

    [SkippableFact]
    public async Task The_same_voter_changing_their_vote_stays_a_single_vote()
    {
        Skip.IfNot(_fixture.Available, _fixture.SkipReason);

        // Arrange
        var alice = _factory.AsUser(Alice, "Alice");
        var bob = _factory.AsUser(Bob, "Bob");
        var pollId = await CreatePollAsync(alice, "Pick", "A", "B");
        var options = (await GetDetailAsync(alice, pollId)).Options;
        var optionA = options[0].Id;
        var optionB = options[1].Id;

        // Act — Bob votes A, then changes to B.
        (await bob.PutAsJsonAsync($"/api/polls/{pollId}/vote", new { optionId = optionA })).EnsureSuccessStatusCode();
        (await bob.PutAsJsonAsync($"/api/polls/{pollId}/vote", new { optionId = optionB })).EnsureSuccessStatusCode();

        // Assert — still one vote, now on B.
        var detail = await GetDetailAsync(alice, pollId);
        Assert.Equal(1, detail.TotalVotes);
        Assert.Equal(0, detail.Options.Single(option => option.Id == optionA).VoteCount);
        Assert.Equal(1, detail.Options.Single(option => option.Id == optionB).VoteCount);
    }

    [SkippableFact]
    public async Task A_direct_duplicate_vote_row_is_rejected_by_the_database_index()
    {
        Skip.IfNot(_fixture.Available, _fixture.SkipReason);

        // Arrange — seed a poll + option and one vote directly via the DbContext.
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<TeamPollDbContext>();
        var now = DateTime.UtcNow;
        var owner = Alice.ToString();

        var poll = new Poll
        {
            Question = "Direct insert",
            OwnerDisplayName = "Alice",
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = owner,
            UpdatedBy = owner,
        };
        poll.Options.Add(new PollOption
        {
            Text = "A",
            DisplayOrder = 0,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = owner,
            UpdatedBy = owner,
        });
        db.Polls.Add(poll);
        await db.SaveChangesAsync();
        var optionId = poll.Options.First().Id;

        db.Votes.Add(NewVote(poll.Id, optionId, Bob, now));
        await db.SaveChangesAsync();

        // Act — a second row with the same (PollId, VoterOid) must be rejected by the unique index.
        db.Votes.Add(NewVote(poll.Id, optionId, Bob, now));

        // Assert — the database, not the app, blocks the duplicate.
        await Assert.ThrowsAnyAsync<DbUpdateException>(() => db.SaveChangesAsync());
    }

    private static Vote NewVote(int pollId, int optionId, Guid voterOid, DateTime now) => new()
    {
        PollId = pollId,
        PollOptionId = optionId,
        VoterOid = voterOid,
        CreatedAt = now,
        UpdatedAt = now,
        CreatedBy = voterOid.ToString(),
        UpdatedBy = voterOid.ToString(),
    };

    private static async Task<int> CreatePollAsync(HttpClient client, string question, params string[] options)
    {
        var response = await client.PostAsJsonAsync("/api/polls", new { question, options });
        response.EnsureSuccessStatusCode();
        var body = await response.ReadAsAsync<CreatePollResponse>();
        return body.PollId;
    }

    private static async Task<PollDetailDto> GetDetailAsync(HttpClient client, int pollId) =>
        await (await client.GetAsync($"/api/polls/{pollId}")).ReadAsAsync<PollDetailDto>();
}
