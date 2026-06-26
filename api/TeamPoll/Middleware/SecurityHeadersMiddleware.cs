namespace TeamPoll.Middleware;

/// <summary>
/// Sets baseline security headers and the default <c>Cache-Control: private, no-store</c>
/// on every response. The strict CSP is relaxed only on <c>/swagger/*</c> paths so the
/// Swashbuckle UI can load its inline assets (api-performance.md, api-coding-standards.md).
/// </summary>
public sealed class SecurityHeadersMiddleware(RequestDelegate next)
{
    private const string ApiCsp = "default-src 'none'; frame-ancestors 'none'";

    private const string SwaggerCsp =
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; "
        + "img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'";

    public async Task InvokeAsync(HttpContext context)
    {
        context.Response.OnStarting(() =>
        {
            var headers = context.Response.Headers;
            var isSwagger = context.Request.Path.StartsWithSegments("/swagger", StringComparison.OrdinalIgnoreCase);

            headers["Content-Security-Policy"] = isSwagger ? SwaggerCsp : ApiCsp;
            headers["X-Content-Type-Options"] = "nosniff";
            headers["Referrer-Policy"] = "no-referrer";
            headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";

            // Default: never cache authenticated, user-scoped responses (api-coding-standards.md).
            // An endpoint may override this explicitly for shared lookup data.
            if (!headers.ContainsKey("Cache-Control"))
            {
                headers["Cache-Control"] = "private, no-store";
            }

            return Task.CompletedTask;
        });

        await next(context);
    }
}
