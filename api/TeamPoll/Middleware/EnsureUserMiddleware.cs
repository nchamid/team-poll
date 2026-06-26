using System.Collections.Concurrent;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using TeamPoll.Data;
using TeamPoll.Domain;

namespace TeamPoll.Middleware;

/// <summary>
/// On the first authenticated request from each Entra <c>oid</c>, idempotently upserts a
/// <c>dbo.Users</c> row (api-auth.md). Best-effort: failures log at Warning and the request
/// continues; the next request retries. A per-replica cache calls the upsert at most once per
/// user per replica. Clients never call a "register" endpoint. Reads claims from the JWT only.
/// </summary>
public sealed class EnsureUserMiddleware(RequestDelegate next, ILogger<EnsureUserMiddleware> logger)
{
    private const string OidClaim = "oid";
    private const string OidSchemaClaim = "http://schemas.microsoft.com/identity/claims/objectidentifier";
    private const string NameClaim = "name";
    private const string UpnClaim = "preferred_username";

    private static readonly ConcurrentDictionary<Guid, byte> SeenUsers = new();

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var oidValue = context.User.FindFirstValue(OidClaim) ?? context.User.FindFirstValue(OidSchemaClaim);
            if (Guid.TryParse(oidValue, out var oid) && !SeenUsers.ContainsKey(oid))
            {
                await UpsertUserAsync(context, oid);
            }
        }

        await next(context);
    }

    private async Task UpsertUserAsync(HttpContext context, Guid oid)
    {
        try
        {
            var db = context.RequestServices.GetRequiredService<TeamPollDbContext>();
            var displayName = context.User.FindFirstValue(NameClaim) ?? "Unknown";
            var email = context.User.FindFirstValue(UpnClaim) ?? string.Empty;
            var now = DateTime.UtcNow;
            var oidString = oid.ToString();

            var existing = await db.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(user => user.Oid == oid, context.RequestAborted);

            if (existing is null)
            {
                db.Users.Add(new User
                {
                    Oid = oid,
                    DisplayName = displayName,
                    Email = email,
                    CreatedAt = now,
                    UpdatedAt = now,
                    CreatedBy = oidString,
                    UpdatedBy = oidString,
                    IsDeleted = false,
                });
            }
            else
            {
                existing.DisplayName = displayName;
                existing.Email = email;
                existing.UpdatedAt = now;
                existing.UpdatedBy = oidString;
            }

            await db.SaveChangesAsync(context.RequestAborted);
            SeenUsers.TryAdd(oid, 0);
        }
        catch (Exception ex)
        {
            // Best-effort — never block the request. UserId (oid) is pseudonymous and loggable;
            // no name/email is logged (api-logging.md / api-pii-handling.md).
            logger.LogWarning(ex, "EnsureUser upsert failed; continuing. UserId={UserId}", oid);
        }
    }
}
