using System.Net;
using System.Net.Http.Json;
using TeamPoll.Tests.TestUtilities;
using Xunit;

namespace TeamPoll.Tests.Validation;

/// <summary>
/// Controller-boundary validation and auth tests. These paths short-circuit (401 / 400) before any
/// database call, so they need no SQL Server and always run — even when Docker is unavailable.
/// </summary>
public sealed class PollValidationTests(TeamPollWebAppFactory factory) : IClassFixture<TeamPollWebAppFactory>
{
    private static readonly Guid Member = Guid.Parse("11111111-1111-1111-1111-111111111111");

    [Fact]
    public async Task GetPolls_without_a_token_returns_401()
    {
        // Arrange
        var sut = factory.Anonymous();

        // Act
        var response = await sut.GetAsync("/api/polls");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreatePoll_without_a_token_returns_401()
    {
        // Arrange
        var sut = factory.Anonymous();

        // Act
        var response = await sut.PostAsJsonAsync("/api/polls", new { question = "Lunch?", options = new[] { "A", "B" } });

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreatePoll_with_fewer_than_two_options_returns_400()
    {
        // Arrange
        var sut = factory.AsUser(Member);

        // Act
        var response = await sut.PostAsJsonAsync("/api/polls", new { question = "Lunch?", options = new[] { "Only one" } });

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreatePoll_with_more_than_six_options_returns_400()
    {
        // Arrange
        var sut = factory.AsUser(Member);
        var sevenOptions = new[] { "A", "B", "C", "D", "E", "F", "G" };

        // Act
        var response = await sut.PostAsJsonAsync("/api/polls", new { question = "Pick one", options = sevenOptions });

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreatePoll_with_a_question_over_280_chars_returns_400()
    {
        // Arrange
        var sut = factory.AsUser(Member);
        var tooLong = new string('a', 281);

        // Act
        var response = await sut.PostAsJsonAsync("/api/polls", new { question = tooLong, options = new[] { "A", "B" } });

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreatePoll_with_an_option_over_80_chars_returns_400()
    {
        // Arrange
        var sut = factory.AsUser(Member);
        var longOption = new string('x', 81);

        // Act
        var response = await sut.PostAsJsonAsync("/api/polls", new { question = "Pick", options = new[] { "A", longOption } });

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreatePoll_with_a_blank_question_returns_400()
    {
        // Arrange
        var sut = factory.AsUser(Member);

        // Act
        var response = await sut.PostAsJsonAsync("/api/polls", new { question = "   ", options = new[] { "A", "B" } });

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CastVote_with_no_option_selected_returns_400()
    {
        // Arrange
        var sut = factory.AsUser(Member);

        // Act — optionId 0 fails the Range annotation before the action runs (no DB call).
        var response = await sut.PutAsJsonAsync("/api/polls/1/vote", new { optionId = 0 });

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
