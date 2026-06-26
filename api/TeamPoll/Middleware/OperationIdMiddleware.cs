using Serilog.Context;

namespace TeamPoll.Middleware;

/// <summary>
/// First middleware in the pipeline. Generates (or echoes) a correlation id,
/// pushes it to the Serilog LogContext as OperationId, and writes it on the
/// response header so failures before auth are still correlated (api-logging.md).
/// </summary>
public sealed class OperationIdMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Operation-Id";

    public async Task InvokeAsync(HttpContext context)
    {
        var operationId = context.Request.Headers.TryGetValue(HeaderName, out var incoming)
                          && !string.IsNullOrWhiteSpace(incoming)
            ? incoming.ToString()
            : Guid.NewGuid().ToString();

        context.Response.OnStarting(() =>
        {
            context.Response.Headers[HeaderName] = operationId;
            return Task.CompletedTask;
        });

        using (LogContext.PushProperty("OperationId", operationId))
        {
            await next(context);
        }
    }
}
