using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamPoll.Data;

namespace TeamPoll.Controllers;

/// <summary>Liveness/readiness probes. The only anonymous endpoints (api-auth.md).</summary>
[ApiController]
[AllowAnonymous]
[Route("health")]
public sealed class HealthController(TeamPollDbContext db) : ControllerBase
{
    /// <summary>Liveness — the process is up. No dependency checks.</summary>
    [HttpGet("live")]
    public IActionResult Live() => Ok(new { status = "Healthy" });

    /// <summary>Readiness — the process can reach its database.</summary>
    [HttpGet("ready")]
    public async Task<IActionResult> Ready(CancellationToken cancellationToken)
    {
        var canConnect = await db.Database.CanConnectAsync(cancellationToken);
        return canConnect
            ? Ok(new { status = "Healthy" })
            : StatusCode(StatusCodes.Status503ServiceUnavailable, new { status = "Unhealthy" });
    }
}
