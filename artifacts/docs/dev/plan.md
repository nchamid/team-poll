# Team Poll — Tier 1 Plan

**Sensitivity:** Internal Only (the only identity data stored is the Entra `oid` — pseudonymous — plus a cached owner display name; no client/matter, no documents)
**Users:** ~50 internal firm team members; planned against the Tier 1 default peak of 100 concurrent.
**Stack:** React 19 + TS + Vite + Vitest + CSS Modules (web); ASP.NET Core 10 controllers + EF Core + Microsoft.Identity.Web + Serilog (api); SQL Server (db); Azure App Service + Azure SQL hosting.
**Time budget:** ~4–6 focused hours

> **Design handoff present.** `/build` implements every in-scope screen against it — the three **prototyped** screens from the bundle's HTML (`artifacts/docs/design/project/Team Poll.dc.html`), the two **deferred** screens (Sign in, Error/permission states) from `full-design-blueprint.md`; tokens and component styling come from the repo design system (`.claude/rules/design/`), never copied out of the HTML. The reconciled blueprint's **Design decisions to preserve** (D1–D6) and **Reconciliation log** are binding — most importantly, the poll **question max length is 280** (the prototype's 140 is overridden).

## 1. Tier 1 gate confirmation

- [x] **Named group of ≤ ~100 concurrent firm users:** ~50 internal team members making small group decisions; planned against the 100-concurrent default.
- [x] **Single-tenant Entra, app roles for authorization:** every endpoint `[Authorize]` (any authenticated user = **Member**). One custom app role, **`Poll.Admin`** (close/delete any poll). **Poll owner** is ownership-derived, not a role.
- [x] **Row access is app-managed, not external client-matter:** a caller may mutate a poll if they are its creator (`CreatedBy` = caller `oid`) **or** hold `Poll.Admin`. No client/matter or ethical-wall relationship anywhere. (`api-record-access.md` — ownership + role.)
- [x] **Azure App Service + Azure SQL hosting:** standard Tier 1 stack; LocalDB in dev.
- [x] **No doc processing / workers / vector search / external audience:** no file upload at all; no Service Bus; internal authenticated users only.

## 2. Data model

EF Core entities. All six audit columns are mandatory; soft-delete is the default and every read filters `IsDeleted = 0` via a global query filter. `CreatedBy` / `UpdatedBy` carry the Entra `oid`.

### Poll

```csharp
public class Poll
{
    public int Id { get; set; }                              // PK, clustered identity
    public string Question { get; set; } = null!;            // NVARCHAR(280), 1–280 (boundary-validated)
    public bool IsClosed { get; set; }                       // DF 0 (open)
    public string OwnerDisplayName { get; set; } = null!;    // NVARCHAR(256), cached from JWT `name` at creation
    // Ownership key = CreatedBy (Entra oid). See ADR-006.

    public ICollection<PollOption> Options { get; set; } = new List<PollOption>();
    public ICollection<Vote> Votes { get; set; } = new List<Vote>();

    // --- audit (mandatory 6) ---
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = null!;           // Entra oid — the poll owner
    public string UpdatedBy { get; set; } = null!;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
```

- **Indexes:** `IX_Polls_CreatedBy` (ownership filter); `IX_Polls_IsClosed` (open-first ordering). Global soft-delete query filter on `IsDeleted`.
- **Constraints:** `Question NOT NULL`; column length 280 caps the max; 1-char minimum enforced at the API boundary. Optional `CK_Polls_Question` (`LEN(Question) BETWEEN 1 AND 280`) — app validates regardless.

### PollOption

```csharp
public class PollOption
{
    public int Id { get; set; }                              // PK
    public int PollId { get; set; }                          // FK → Poll
    public Poll Poll { get; set; } = null!;
    public string Text { get; set; } = null!;                // NVARCHAR(80), 1–80
    public int DisplayOrder { get; set; }                    // ordering within the poll

    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
    // --- audit (6) ---  CreatedAt/UpdatedAt/CreatedBy/UpdatedBy/IsDeleted/DeletedAt
}
```

- **Indexes:** `IX_PollOptions_PollId` (FK). Global soft-delete filter.
- **Constraints:** `Text NOT NULL`, length 80. Count (2–6 per poll) is enforced at the API boundary, not in-table (ADR-007 covers vote uniqueness; option count is a controller rule).

### Vote

```csharp
public class Vote
{
    public int Id { get; set; }                              // PK
    public int PollId { get; set; }                          // FK → Poll
    public Poll Poll { get; set; } = null!;
    public int PollOptionId { get; set; }                    // FK → PollOption (must belong to PollId — boundary-checked)
    public PollOption PollOption { get; set; } = null!;
    public string VoterOid { get; set; } = null!;            // Entra oid of the voter
    // --- audit (6) ---
}
```

- **Indexes:** `IX_Votes_PollId` (FK); `IX_Votes_PollOptionId` (FK); **`UX_Votes_PollId_VoterOid` UNIQUE filtered `WHERE IsDeleted = 0`** on `(PollId, VoterOid)` — enforces **one vote per user per poll** at the database (ADR-007). A vote **change** updates the existing row's `PollOptionId` (no second row).

### User (infrastructure — `EnsureUserMiddleware`)

```csharp
public class User
{
    public Guid Oid { get; set; }                            // Entra oid — PK
    public string DisplayName { get; set; } = null!;         // from `name` claim
    public string Email { get; set; } = null!;               // from `preferred_username`
    // --- audit (6) ---
}
```

- Idempotently upserted on first authenticated request (`api-auth.md`). Not in the request path of poll operations — `OwnerDisplayName` is cached on `Poll` at creation so the list/detail need no join to `Users`. Never logged.

## 3. API contracts

**Authorization model:** every endpoint is `[Authorize]` (authenticated **Member**). **Close** and **Delete** additionally require **owner-or-`Poll.Admin`**, enforced in the service against `CreatedBy`/role — a violation returns **403, never 404**. Error contract is **RFC 7807 ProblemDetails** throughout; validation failures return `400` with an `errors` dictionary; voting on a closed poll returns `409`; a missing or soft-deleted poll returns `404`. Every response carries `Cache-Control: private, no-store`. Every async path threads `CancellationToken`.

| Method | Path | Auth | Body | Returns | Notes |
| --- | --- | --- | --- | --- | --- |
| GET | /health/live | anon | — | 200 `{status}` | liveness — no DB call |
| GET | /health/ready | anon | — | 200 / 503 | DB ping |
| GET | /api/polls | Member | — | 200 paginated list | `?page&pageSize` (default 50, max 100); open first then closed, each by `CreatedAt` desc; soft-deleted excluded. Item: `id, question, optionCount, totalVotes, isClosed, ownerDisplayName, isOwner, canManage` (ADR-011) |
| POST | /api/polls | Member | `CreatePollRequest {question, options[]}` | 201 `{pollId}` | validates question 1–280 + 2–6 options each 1–80; `CreatedBy` = caller `oid`; `OwnerDisplayName` = caller `name` |
| GET | /api/polls/{id} | Member | — | 200 detail | `id, question, isClosed, ownerDisplayName, isOwner, canManage, totalVotes, myVote (optionId\|null), resultsVisible, options[]`. Per-option `voteCount`/`percentage` included **only when `resultsVisible`** (owner/admin, or member who has voted) — ADR-009. 404 if missing/soft-deleted |
| PUT | /api/polls/{id}/vote | Member | `CastVoteRequest {optionId}` | 200 detail | cast **or** change my vote (idempotent upsert, ADR-008); validates poll **open** and option belongs to poll; closed → 409; option-not-in-poll → 400 |
| POST | /api/polls/{id}/close | owner **or** `Poll.Admin` | — | 200 / 204 | sets `IsClosed`; non-owner/non-admin → 403; already closed → no-op 200 |
| DELETE | /api/polls/{id} | owner **or** `Poll.Admin` | — | 204 | soft-delete (`IsDeleted`/`DeletedAt`); non-owner/non-admin → 403; removed from all lists |

Validation runs at the controller boundary (data annotations + manual checks) before any service call. The vote endpoint verifies in a single query that the referenced option exists **and** belongs to the poll.

## 4. UI sketch

> **Claude Design handoff present** — `/build` implements every in-scope screen against it (prototyped screens from the design's HTML, deferred screens from the blueprint; tokens and styling from the repo design system). Layout and element choices follow the prototype; visual style follows the MWS design system.

**App shell (all signed-in screens)** `[prototyped]` — navy **Sidebar** with the McDermott **Lockup** ("Team Poll"), a single "Polls" nav item (active), and a pinned user block (avatar, name, sign-out); below 1024px it becomes a left **drawer** with scrim opened by a top-bar hamburger. **Top bar** (sticky) with breadcrumb (symbol › Polls › current), light/dark **theme toggle**, and avatar. Main column `max-width 1200px`. Components: `AppShell`, `Sidebar`, `TopBar`, `Lockup`, `ThemeToggle`, mobile `Drawer`. Role: Member.

**S2 — Poll list (home)** `[prototyped]` — the landing screen. Polls render as a responsive **card grid** (D1) grouped under **Open** then **Closed** section headers with counts. Each `PollCard`: status badge (Open=live / Closed=archived), serif question, owner avatar + name, and `N options · N votes` meta; the whole card is the open affordance. A primary **Create poll** action sits in the page header. First-run **empty state** ("No polls yet" + create CTA). Components: `PollListPage`, `PollSectionHeader`, `PollCard`, `EmptyState`, `Button`, `Badge`, `Avatar`. Role: Member.

**S3 — Create poll** `[prototyped]` — single-column form (max ~620px) with a back link. A **question** `Input` (**maxLength 280** — overrides the prototype's 140 per the reconciliation log) with helper text; an **Options** group of 2–6 `OptionRow`s, each an `Input` (maxLength 80) with a remove `IconButton` (shown when >2), an **Add option** button (disabled at 6), and an "N of 6 options" counter; inline + on-submit validation (empty/too-long), with a summary `Alert` on submit error. **Create poll** (primary) + **Cancel**. On success → S2 with the new poll on top. Components: `CreatePollPage`, `OptionRow`, `Input`, `Button`, `IconButton`, `Alert`. Role: Member.

**S4 — Poll detail (vote + results)** `[prototyped]` — card with a back link. **Header:** status badge, serif question, owner label ("Created by you" / "Created by <name>"), and total-votes. **Voting state** (member who hasn't voted): custom radio **PickRow**s (D4) — full-width selectable rows; **Cast vote** / **Update vote** (disabled until a choice) + Cancel. **Results state** (after voting; always for owner/admin; and for closed polls): per-option **animated bars** (D2) with count + percentage, a **"Your vote"** marker on the caller's option and **leading-option emphasis** (D3), the total, and a **Change vote** button while open. **Owner/admin** see **Close** and **Delete**; Delete opens a **confirm modal** that names the poll (D5). Closed polls are read-only. Components: `PollDetailPage`, `PickRow`, `ResultBar`, `Badge`, `Button`, `IconButton`, `ConfirmModal`. Roles: Member (vote/results), owner/`Poll.Admin` (close/delete).

**S1 — Sign in** `[deferred]` (blueprint) — MSAL gates the app: `AuthenticatedTemplate` renders the shell; `UnauthenticatedTemplate` shows a centered MWS lockup + a single **Sign in** button that triggers the Entra redirect. No bespoke fields. The prototype runs signed-in, so this has no HTML — built from the blueprint + `api-client-auth.md`. Role: anon → all.

**S5 — Error & permission states** `[deferred]` (blueprint) — a root **error boundary** (App Insights `trackException`); a route-level **not-found** page (404 / soft-deleted poll → "This poll is no longer available"); a **403** "You don't have access to this poll" surface for ownership violations; transient failures shown as inline alerts/toasts following the MWS error formula (what + why + how), never raw detail. Built from the blueprint + `loading-empty-and-error-states.md` / `notifications-and-feedback.md`. Role: all.

Both deferred screens are **in scope** and built. Nothing from the blueprint is dropped to §7.

## 5. Auth + observability plan

- **Entra app registration:** single-tenant. App roles: **`Poll.Admin`** (the only custom role — close/delete any poll). Any authenticated user is a **Member** by default (no role needed); **Poll owner** is ownership-derived (`CreatedBy`). The role/access matrix in `full-design-blueprint.md` drives the `[Authorize]` model; only close/delete add the owner-or-`Poll.Admin` check.
- **MSAL config (web):** authority `https://login.microsoftonline.com/{tenantId}`, `clientId`, SPA `redirectUri`; token cache in `sessionStorage`; request the API scope `api://<api-app-id>/access_as_user`. Concrete values live in `.env` (dev) / Key Vault + app settings (deployed), never in source (`api-client-auth.md`).
- **User provisioning:** `EnsureUserMiddleware` idempotently upserts `dbo.Users` from `oid`/`name`/`preferred_username` on first authenticated request; clients never call a register endpoint.
- **Logging:** Serilog → Console + Application Insights; `UserId` (`oid`) + `OperationId` structured on every entry; `OperationId` middleware first in the pipeline. **Never log** question text, option text, or voter identity — IDs and counts only.
- **Telemetry events (≤5):** `sign_in`, `poll_created`, `vote_cast`, `poll_closed`, `poll_deleted` — identifiers/counts only, no content.

## 6. Security plan

- **A01 Broken access control** — `[Authorize]` on every endpoint; close/delete re-check owner-or-`Poll.Admin` in the service; results-visibility gated **server-side** (not just UI); ownership violations → **403, not 404**; soft-deleted rows excluded by global filter.
- **A02 Cryptographic failures** — no app-managed secrets beyond the SQL connection + Entra config; secrets in Key Vault via `DefaultAzureCredential`; TLS terminated by App Service; no custom crypto.
- **A03 Injection** — EF Core LINQ only; no `FromSqlRaw`/string-concatenated SQL; inputs bound to typed DTOs.
- **A04 Insecure design** — one-vote-per-user enforced by a UNIQUE index (defense beyond app logic); closed-poll voting rejected server-side; option-belongs-to-poll checked server-side; results gating server-side.
- **A05 Security misconfig** — baseline headers (`CSP default-src 'none'; frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, HSTS); `Cache-Control: private, no-store`; HTTPS redirect; Swagger behind a `Swagger:Enabled` flag (off in prod).
- **A06 Vulnerable components** — SonarCloud SAST + Gitleaks + `dotnet list package --vulnerable` + split `npm audit` in CI.
- **A07 Identification/auth** — Microsoft.Identity.Web validates tokens (no custom JWT parsing); MSAL PKCE on the SPA; `aud` pinned to the API app id.
- **A08 Software/data integrity** — Key Vault + Managed Identity; pinned CI action majors; dependency scanners gate the shipped bundle.
- **A09 Logging/monitoring** — Serilog + App Insights + `OperationId` correlation; content/PII never logged.
- **A10 SSRF** — no outbound user-controlled URLs; the API makes no user-directed external calls.

## 7. Out of scope

- **No anonymous/public polls** — sign-in required for every surface.
- **No document upload / processing / attachments** — no Blob, no extraction/OCR/search.
- **No notifications or external integrations** — no email/Teams/Slack; Entra is the only integration.
- **No real-time push** — results refresh on load / via TanStack Query refetch; no websockets/SSE.
- **No CSV/PDF export, analytics dashboards, or scheduling.**
- **No vote retract** — a member may **change** a vote while the poll is open, but not remove it.
- **Phase 2 (post-v1, not built now):** votes badge / optional closing date / option reorder — reserved for a separate ship-test session.
- **Tier 1 hard limits:** no workers/Service Bus/queues, no vector search/embeddings/RAG, no external audience. If any is later requested, **stop and escalate** to the AI Solutions Lead.

## 8. Open questions

1. **Vote verb** — modeled as idempotent `PUT /api/polls/{id}/vote` (set-my-vote, covers both cast and change). Confirm acceptable vs. `POST .../votes`.
2. **List pagination** — `page`/`pageSize` (default 50, max 100) is provided to honor the list rule, but expected volume is low and the grouped Open/Closed UI consumes a single page. Confirm OK, or prefer an explicit unbounded list.
3. **Pre-vote totals** — the list card and detail header show the *total* vote count to everyone, while per-option **results** stay gated until a member votes (owner/admin exempt). Confirm showing the bare total before voting is intended (matches the blueprint open question #2).
4. **Entra values** — `tenantId`, web `clientId`, API app-id/scope, and the `Poll.Admin` role definition are supplied at build/deploy time (`.env` / Key Vault); none are invented here.
