namespace TeamPoll.Services;

/// <summary>Domain limits — every value traces to plan.md / decisions.md, none invented.</summary>
public static class PollConstants
{
    public const int QuestionMinLength = 1;     // plan §2 / ADR-010
    public const int QuestionMaxLength = 280;   // ADR-010 (prototype's 140 overridden)
    public const int OptionMinLength = 1;       // plan §3
    public const int OptionMaxLength = 80;      // plan §3
    public const int MinOptions = 2;            // plan §3
    public const int MaxOptions = 6;            // plan §3

    public const int DefaultPageSize = 50;      // ADR-011
    public const int MaxPageSize = 100;         // ADR-011
    public const int MinPage = 1;

    /// <summary>The only custom app role — grants close/delete on any poll.</summary>
    public const string AdminRole = "Poll.Admin";
}
