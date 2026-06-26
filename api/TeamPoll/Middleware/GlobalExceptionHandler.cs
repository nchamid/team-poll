using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace TeamPoll.Middleware;

/// <summary>
/// Catches any unhandled exception, logs the full detail at Error (with the OperationId from
/// LogContext), and returns a generic 500 ProblemDetails — never the exception message or stack
/// trace (api-error-handling.md). Registered via <c>AddExceptionHandler</c> + <c>UseExceptionHandler</c>.
/// </summary>
public sealed class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger,
    IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        logger.LogError(exception, "Unhandled exception processing the request.");

        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;

        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "An unexpected error occurred.",
                Detail = "Something went wrong on our end. Try again in a moment.",
            },
        });
    }
}
