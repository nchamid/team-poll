using System.Text.Json;
using System.Text.Json.Serialization;

namespace TeamPoll.Tests.TestUtilities;

/// <summary>
/// Mirrors the API's serialization options so test assertions on response bodies don't silently
/// coerce values. Web defaults (camelCase) + string-enum handling, matching Program.cs.
/// </summary>
public static class TestJsonOptions
{
    public static readonly JsonSerializerOptions Default = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
    };

    public static async Task<T> ReadAsAsync<T>(this HttpResponseMessage response, CancellationToken cancellationToken = default)
    {
        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var value = await JsonSerializer.DeserializeAsync<T>(stream, Default, cancellationToken);
        return value ?? throw new InvalidOperationException($"Response body could not be deserialized to {typeof(T).Name}.");
    }
}
