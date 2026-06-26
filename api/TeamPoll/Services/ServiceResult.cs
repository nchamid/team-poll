namespace TeamPoll.Services;

/// <summary>
/// The outcome of a service operation. Maps deterministically to an HTTP status
/// at the controller boundary — expected outcomes are returned, not thrown
/// (api-coding-standards.md: no exceptions for control flow).
/// </summary>
public enum ServiceOutcome
{
    Success = 0,

    /// <summary>Resource missing or soft-deleted → 404.</summary>
    NotFound,

    /// <summary>Caller is authenticated but not permitted (ownership/role) → 403.</summary>
    Forbidden,

    /// <summary>Domain conflict (e.g. voting on a closed poll) → 409.</summary>
    Conflict,

    /// <summary>Input was valid-shaped but violated a domain rule (e.g. option not in poll) → 400.</summary>
    Invalid,
}

/// <summary>A service result carrying an outcome, an optional value, and a UI-safe message.</summary>
public sealed record ServiceResult<T>
{
    public ServiceOutcome Outcome { get; private init; }
    public T? Value { get; private init; }

    /// <summary>Plain-language, non-sensitive message suitable for a ProblemDetails detail.</summary>
    public string? Detail { get; private init; }

    public bool IsSuccess => Outcome == ServiceOutcome.Success;

    public static ServiceResult<T> Success(T value) =>
        new() { Outcome = ServiceOutcome.Success, Value = value };

    public static ServiceResult<T> NotFound(string detail) =>
        new() { Outcome = ServiceOutcome.NotFound, Detail = detail };

    public static ServiceResult<T> Forbidden(string detail) =>
        new() { Outcome = ServiceOutcome.Forbidden, Detail = detail };

    public static ServiceResult<T> Conflict(string detail) =>
        new() { Outcome = ServiceOutcome.Conflict, Detail = detail };

    public static ServiceResult<T> Invalid(string detail) =>
        new() { Outcome = ServiceOutcome.Invalid, Detail = detail };
}
