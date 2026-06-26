using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamPoll.Auth;
using TeamPoll.Contracts;
using TeamPoll.Services;

namespace TeamPoll.Controllers;

/// <summary>
/// Poll endpoints. Every action requires an authenticated Member; close/delete additionally
/// require owner-or-<c>Poll.Admin</c>, enforced in the service (a violation returns 403, never
/// 404). Controllers stay thin: distil the caller, validate at the boundary, delegate, map the
/// <see cref="ServiceResult{T}"/> outcome to an HTTP status with RFC 7807 ProblemDetails.
/// </summary>
[ApiController]
[Authorize]
[Route("api/polls")]
[Produces("application/json")]
public sealed class PollsController(IPollService pollService) : ControllerBase
{
    /// <summary>Paginated list of polls — open first, then closed.</summary>
    [HttpGet]
    public async Task<ActionResult<PollListResponse>> GetPolls(
        [FromQuery] int page = PollConstants.MinPage,
        [FromQuery] int pageSize = PollConstants.DefaultPageSize,
        CancellationToken cancellationToken = default)
    {
        var result = await pollService.GetPollsAsync(User.ToCallerContext(), page, pageSize, cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates a poll (question + 2–6 options). Returns the new poll id.</summary>
    [HttpPost]
    public async Task<ActionResult<CreatePollResponse>> CreatePoll(
        [FromBody] CreatePollRequest request, CancellationToken cancellationToken)
    {
        var question = (request.Question ?? string.Empty).Trim();
        if (string.IsNullOrEmpty(question))
        {
            ModelState.AddModelError(nameof(request.Question), "Add a question.");
        }
        else if (question.Length > PollConstants.QuestionMaxLength)
        {
            ModelState.AddModelError(
                nameof(request.Question),
                $"The question must be {PollConstants.QuestionMaxLength} characters or fewer.");
        }

        var options = (request.Options ?? [])
            .Select(option => (option ?? string.Empty).Trim())
            .ToList();

        if (options.Count < PollConstants.MinOptions || options.Count > PollConstants.MaxOptions)
        {
            ModelState.AddModelError(
                nameof(request.Options),
                $"Provide between {PollConstants.MinOptions} and {PollConstants.MaxOptions} options.");
        }

        for (var index = 0; index < options.Count; index++)
        {
            var option = options[index];
            if (string.IsNullOrEmpty(option))
            {
                ModelState.AddModelError($"Options[{index}]", "Add a label, or remove this option.");
            }
            else if (option.Length > PollConstants.OptionMaxLength)
            {
                ModelState.AddModelError(
                    $"Options[{index}]",
                    $"Options must be {PollConstants.OptionMaxLength} characters or fewer.");
            }
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var pollId = await pollService.CreatePollAsync(User.ToCallerContext(), question, options, cancellationToken);
        return CreatedAtAction(nameof(GetPoll), new { id = pollId }, new CreatePollResponse { PollId = pollId });
    }

    /// <summary>Full poll detail — header, the caller's vote, and gated per-option results.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<PollDetailDto>> GetPoll(int id, CancellationToken cancellationToken)
    {
        var result = await pollService.GetPollDetailAsync(User.ToCallerContext(), id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : MapFailure(result);
    }

    /// <summary>Casts or changes the caller's single vote on an open poll.</summary>
    [HttpPut("{id:int}/vote")]
    public async Task<ActionResult<PollDetailDto>> CastVote(
        int id, [FromBody] CastVoteRequest request, CancellationToken cancellationToken)
    {
        var result = await pollService.CastVoteAsync(User.ToCallerContext(), id, request.OptionId, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : MapFailure(result);
    }

    /// <summary>Closes a poll (owner or admin). Closed polls are read-only.</summary>
    [HttpPost("{id:int}/close")]
    public async Task<IActionResult> ClosePoll(int id, CancellationToken cancellationToken)
    {
        var result = await pollService.ClosePollAsync(User.ToCallerContext(), id, cancellationToken);
        return result.IsSuccess ? NoContent() : MapFailure(result);
    }

    /// <summary>Soft-deletes a poll (owner or admin). Removed from every list.</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePoll(int id, CancellationToken cancellationToken)
    {
        var result = await pollService.DeletePollAsync(User.ToCallerContext(), id, cancellationToken);
        return result.IsSuccess ? NoContent() : MapFailure(result);
    }

    /// <summary>Maps a non-success service outcome to ProblemDetails with the right status.</summary>
    private ActionResult MapFailure<T>(ServiceResult<T> result) => result.Outcome switch
    {
        ServiceOutcome.NotFound => Problem(detail: result.Detail, statusCode: StatusCodes.Status404NotFound),
        ServiceOutcome.Forbidden => Problem(detail: result.Detail, statusCode: StatusCodes.Status403Forbidden),
        ServiceOutcome.Conflict => Problem(detail: result.Detail, statusCode: StatusCodes.Status409Conflict),
        ServiceOutcome.Invalid => Problem(detail: result.Detail, statusCode: StatusCodes.Status400BadRequest),
        _ => Problem(statusCode: StatusCodes.Status500InternalServerError),
    };
}
