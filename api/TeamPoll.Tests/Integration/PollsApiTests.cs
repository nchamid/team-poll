using System.Net;
using System.Net.Http.Json;
using TeamPoll.Contracts;
using TeamPoll.Tests.TestUtilities;
using Xunit;

namespace TeamPoll.Tests.Integration;

/// <summary>
/// End-to-end endpoint behaviour against a real SQL Server (the <see cref="SqlServerFixture"/>
/// container with the actual migrations + procs applied). Docker-gated: each test skips cleanly
/// when the container is unavailable.
/// </summary>
[Collection(SqlServerCollection.Name)]
public sealed class PollsApiTests : IAsyncLifetime, IDisposable
{
    private static readonly Guid Alice = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static readonly Guid Bob = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    private static readonly Guid Carol = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");
    private const string AdminRole = "Poll.Admin";

    private readonly SqlServerFixture _fixture;
    private readonly TeamPollWebAppFactory _factory;

    public PollsApiTests(SqlServerFixture fixture)
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
    public async Task Created_poll_appears_in_the_list_with_correct_counts()
    {
        Skip.IfNot(_fixture.Available, _fixture.SkipReason);

        // Arrange
        var alice = _factory.AsUser(Alice, "Alice");

        // Act
        await CreatePollAsync(alice, "Offsite day?", "Mon", "Tue", "Wed");
        var list = await (await alice.GetAsync("/api/polls")).ReadAsAsync<PollListResponse>();

        // Assert
        var poll = Assert.Single(list.Items);
        Assert.Equal("Offsite day?", poll.Question);
        Assert.Equal(3, poll.OptionCount);
        Assert.Equal(0, poll.TotalVotes);
        Assert.False(poll.IsClosed);
        Assert.True(poll.IsOwner);
        Assert.True(poll.CanManage);
    }

    [SkippableFact]
    public async Task Member_sees_results_only_after_voting()
    {
        Skip.IfNot(_fixture.Available, _fixture.SkipReason);

        // Arrange
        var alice = _factory.AsUser(Alice, "Alice");
        var bob = _factory.AsUser(Bob, "Bob");
        var pollId = await CreatePollAsync(alice, "Lunch?", "Tacos", "Pho");
        var optionId = (await GetDetailAsync(bob, pollId)).Options[0].Id;

        // Act — before voting, then after.
        var before = await GetDetailAsync(bob, pollId);
        var afterResponse = await bob.PutAsJsonAsync($"/api/polls/{pollId}/vote", new { optionId });
        var after = await afterResponse.ReadAsAsync<PollDetailDto>();

        // Assert
        Assert.False(before.ResultsVisible);
        Assert.Null(before.Options[0].VoteCount);
        Assert.Equal(HttpStatusCode.OK, afterResponse.StatusCode);
        Assert.True(after.ResultsVisible);
        Assert.Equal(1, after.TotalVotes);
        Assert.Equal(optionId, after.MyVote);
        Assert.Equal(1, after.Options.Single(option => option.Id == optionId).VoteCount);
    }

    [SkippableFact]
    public async Task Owner_sees_results_without_voting()
    {
        Skip.IfNot(_fixture.Available, _fixture.SkipReason);

        // Arrange
        var alice = _factory.AsUser(Alice, "Alice");
        var pollId = await CreatePollAsync(alice, "Standup time?", "9", "10");

        // Act
        var detail = await GetDetailAsync(alice, pollId);

        // Assert
        Assert.True(detail.ResultsVisible);
        Assert.All(detail.Options, option => Assert.NotNull(option.VoteCount));
    }

    [SkippableFact]
    public async Task Non_owner_closing_anothers_poll_is_forbidden_403_not_404()
    {
        Skip.IfNot(_fixture.Available, _fixture.SkipReason);

        // Arrange
        var alice = _factory.AsUser(Alice, "Alice");
        var bob = _factory.AsUser(Bob, "Bob");
        var pollId = await CreatePollAsync(alice, "Room?", "Marble", "Harbor");

        // Act
        var response = await bob.PostAsync($"/api/polls/{pollId}/close", content: null);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [SkippableFact]
    public async Task Admin_can_close_any_poll()
    {
        Skip.IfNot(_fixture.Available, _fixture.SkipReason);

        // Arrange
        var alice = _factory.AsUser(Alice, "Alice");
        var admin = _factory.AsUser(Carol, "Carol", AdminRole);
        var pollId = await CreatePollAsync(alice, "Name?", "Open Doors", "Bridge");

        // Act
        var closeResponse = await admin.PostAsync($"/api/polls/{pollId}/close", content: null);
        var detail = await GetDetailAsync(alice, pollId);

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, closeResponse.StatusCode);
        Assert.True(detail.IsClosed);
    }

    [SkippableFact]
    public async Task Voting_on_a_closed_poll_returns_409()
    {
        Skip.IfNot(_fixture.Available, _fixture.SkipReason);

        // Arrange
        var alice = _factory.AsUser(Alice, "Alice");
        var bob = _factory.AsUser(Bob, "Bob");
        var pollId = await CreatePollAsync(alice, "Closed?", "Yes", "No");
        var optionId = (await GetDetailAsync(alice, pollId)).Options[0].Id;
        await alice.PostAsync($"/api/polls/{pollId}/close", content: null);

        // Act
        var response = await bob.PutAsJsonAsync($"/api/polls/{pollId}/vote", new { optionId });

        // Assert
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [SkippableFact]
    public async Task Soft_deleted_poll_disappears_from_list_and_detail()
    {
        Skip.IfNot(_fixture.Available, _fixture.SkipReason);

        // Arrange
        var alice = _factory.AsUser(Alice, "Alice");
        var pollId = await CreatePollAsync(alice, "Delete me", "A", "B");

        // Act
        var deleteResponse = await alice.DeleteAsync($"/api/polls/{pollId}");
        var detailResponse = await alice.GetAsync($"/api/polls/{pollId}");
        var list = await (await alice.GetAsync("/api/polls")).ReadAsAsync<PollListResponse>();

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, detailResponse.StatusCode);
        Assert.DoesNotContain(list.Items, poll => poll.Id == pollId);
    }

    [SkippableFact]
    public async Task Non_owner_deleting_anothers_poll_is_forbidden_403()
    {
        Skip.IfNot(_fixture.Available, _fixture.SkipReason);

        // Arrange
        var alice = _factory.AsUser(Alice, "Alice");
        var bob = _factory.AsUser(Bob, "Bob");
        var pollId = await CreatePollAsync(alice, "Mine", "A", "B");

        // Act
        var response = await bob.DeleteAsync($"/api/polls/{pollId}");

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

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
