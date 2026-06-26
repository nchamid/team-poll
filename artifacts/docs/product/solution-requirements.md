# SOLUTION REQUIREMENTS
> **For Claude:** Read this file at the start of every session for this project. Use all sections below as your primary context before taking any action. If a section is marked `[PENDING]`, ask the Analyst to complete it before proceeding.
>
> *This artifact is the Analyst's requirements deliverable for a solution — what should be built, for whom, and why. Distinct from a developer specification (how it should be built), which is owned by Development.*

---

## 1. SOLUTION IDENTITY

| Field | Details |
|---|---|
| **Solution Name** | Team Poll (`team-poll`) |
| **Solution Tier** | `Tier 1` — Analyst-owned, production-grade internal app. Clean Tier 1 gate (see Change Log). |
| **Version** | v1.0 |
| **Status** | `Draft` |
| **Date Created** | 2026-06-25 |
| **Last Updated** | 2026-06-25 |
| **Analyst Owner** | Nagarjuna Chamidisetty |

**Tier rationale:** Named group of internal, authenticated firm users (Tier 1 default peak 100 concurrent); single-tenant Entra ID auth with the `Poll.Admin` app role driving authorization; row visibility is **app-managed** (poll ownership + admin role), never external client-matter; hosted on Azure App Service + Azure SQL; no document-processing pipeline, no Service Bus/workers, no client-facing surface. All four Tier 1 gate conditions hold.

---

## 2. REQUESTOR & STAKEHOLDERS

| Field | Details |
|---|---|
| **Requesting Group / Department** | Internal firm teams that make frequent small group decisions (offsite dates, lunch spots, quick votes). Internal workflow test build. |
| **Primary Contact** | Nagarjuna Chamidisetty (nagarjuna.chamidisetty@gmail.com) |
| **Executive Sponsor** | N/A — internal test app, self-approved. |
| **End Users** | **Member** (any authenticated firm user) — create polls, vote, view results. **Poll owner** (the creator of a poll) — close/delete their own poll. **Admin** (`Poll.Admin` Entra app role) — close/delete any poll. |
| **Approximate User Count** | ~50 internal team members (within the Tier 1 100-concurrent range). |

---

## 3. THE REQUEST

### Problem Being Solved

Teams make lots of small decisions ("which day for the offsite?", "lunch spot?") in chat threads where votes get lost — scattered through replies, double-counted, or never resolved. There is no quick, auditable way to ask a question, collect exactly one vote per person, and see where the group stands.

### Proposed Solution

Team Poll is a signed-in internal web app that gives a team a fast, auditable way to ask a question, collect **one vote per person**, and see **live results**. A member creates a poll (a question plus 2–6 options), shares it with the team, each member casts (and may change) exactly one vote while the poll is open, and everyone can see per-option counts and percentages. Poll owners and admins can close a poll (making it a read-only record) or soft-delete it.

### User Workflow — Today vs. With the Solution

| Step | Today | With the Solution |
|---|---|---|
| 1 | Someone raises a question in a chat thread ("which day for the offsite?") | Member creates a poll in Team Poll — a question (1–280 chars) + 2–6 options (each 1–80 chars) |
| 2 | People reply with votes scattered through the thread | Member shares it; each teammate signs in and casts exactly one vote (changeable while the poll is open) |
| 3 | Votes get lost, double-counted, or buried; hard to tell who has voted | One vote per user is enforced; live results show per-option counts + percentages and total votes |
| 4 | Someone manually tallies and announces a decision — or it never resolves | Owner or admin closes the poll; the closed poll stays viewable as an auditable read-only record |

### Solution Category

- [x] Workflow automation (lightweight group decision-making / polling)
- [x] Internal reporting (live poll results)
- [x] Other: **Team polling / decision tool** (internal, authenticated)

---

## 4. DATA & INPUTS

### Input Sources

All inputs are user-entered through the web UI — there are **no documents, files, or external data feeds**.

| Input | Format | Example |
|---|---|---|
| Poll question | Text, 1–280 chars | "Which day for the team offsite?" |
| Poll options | 2–6 text options, each 1–80 chars | "Mon", "Tue", "Wed" |
| Vote selection | One option choice per user per poll | User selects "Wed" |

### Data Schema (for Development & QA)

Captured from the Analyst's data-model sketch (verbal/spec; no sample file — N/A for an app of this shape). Every table also carries the standard 6 audit columns (`CreatedAt`, `UpdatedAt`, `CreatedBy`, `UpdatedBy`, `IsDeleted`, `DeletedAt`) + soft delete + appropriate indexes; migrations idempotent with rollbacks.

**Poll**

| Field Name | Data Type | Required? | Notes |
|---|---|---|---|
| Id | int / PK | Yes | Clustered identity PK |
| Question | NVARCHAR(280) | Yes | 1–280 chars |
| IsClosed | BIT | Yes | Default 0 (open) |
| OwnerOid | NVARCHAR | Yes | Entra `oid` of creator (authenticated user) |
| OwnerDisplayName | NVARCHAR | Yes | Cached display name for list/results rendering |
| *(audit columns)* | — | Yes | `CreatedBy`/`UpdatedBy` = Entra `oid`; soft delete via `IsDeleted`/`DeletedAt` |

**PollOption**

| Field Name | Data Type | Required? | Notes |
|---|---|---|---|
| Id | int / PK | Yes | |
| PollId | int / FK → Poll | Yes | Non-clustered index on FK |
| Text | NVARCHAR(80) | Yes | 1–80 chars |
| DisplayOrder | int | Yes | Ordering within the poll |
| *(audit columns)* | — | Yes | Standard 6 + soft delete |

**Vote**

| Field Name | Data Type | Required? | Notes |
|---|---|---|---|
| Id | int / PK | Yes | |
| PollId | int / FK → Poll | Yes | Non-clustered index on FK |
| PollOptionId | int / FK → PollOption | Yes | Must belong to the same poll (validated at boundary) |
| VoterOid | NVARCHAR | Yes | Entra `oid` of the voter |
| *(unique constraint)* | — | Yes | **UNIQUE (PollId, VoterOid)** — enforces one vote per user per poll; vote change updates the existing row |
| *(audit columns)* | — | Yes | Standard 6 + soft delete |

### Data Sensitivity

- [x] **Internal Only** — Not for external sharing.

No client/matter data, no privileged content, no documents. The only identity data stored is the Entra `oid` (pseudonymous identifier per the logging rules) plus a cached owner display name. No secrets in source.

### Data Handling Notes

- **Never log** question text, option text, or voter identity — log identifiers and counts only (`UserId` = Entra `oid`, `OperationId`).
- One-vote-per-user is enforced at the database level via `UNIQUE (PollId, VoterOid)`, not only in application code.
- Soft-deleted polls are excluded from every list/query by default.

---

## 5. OUTPUTS & SUCCESS CRITERIA

### User Stories

| As a... | I want to... | So that... |
|---|---|---|
| Team member | Create a poll with a question and 2–6 options | I can get a quick decision from my team without a long chat thread |
| Team member | Cast — and change — exactly one vote on an open poll | the result reflects one voice per person and I can correct a mistake |
| Team member | See live results (per-option counts + percentages) after I vote | I know where the group stands |
| Team member | Browse polls with open ones first, then closed | I can quickly find what still needs my vote |
| Poll owner | Close or delete my own poll | I can finalize a decision (read-only record) or retract it |
| Admin (`Poll.Admin`) | Close or delete **any** poll | I can moderate poll content across teams |

### Expected Output

| Output | Format | Destination |
|---|---|---|
| Poll list | Web view — open polls first, then closed; each row: question, option count, total votes, open/closed state, owner name | On screen |
| Vote form | Web form — pick exactly one option (single-select) | On screen |
| Results | Web view — per-option vote count + percentage, total votes | On screen (owner/admin always; member after voting) |

### Testable Acceptance Criteria

| User Story (persona) | Criterion | How it will be tested |
|---|---|---|
| Member (create) | A poll with 2–6 options is accepted; fewer than 2 or more than 6 is rejected with a clear message (400 + ProblemDetails) | Submit polls with 1, 2, 6, 7 options; assert accept/reject + message |
| Member (create) | Question length 1–280 and each option length 1–80 are enforced at the boundary | Boundary tests at 0/1/280/281 and 0/1/80/81 chars |
| Member (vote) | A user can vote once, then change their vote; per-option and total counts update correctly | Vote A → assert; change to B → assert counts shifted |
| Member (vote) | `UNIQUE (PollId, VoterOid)` holds — a second user voting does not overwrite the first | Two users vote different options; assert both counted |
| Member (vote) | Voting on a closed poll is rejected | Close poll, attempt vote; assert rejection (ProblemDetails) |
| Member (results) | Members see per-option results only **after** they have voted; owner/admin always see results | Unvoted member → results hidden; after vote → shown |
| Owner/Admin (close/delete) | A non-owner, non-admin cannot close or delete another user's poll → **403, not 404** | Member calls close/delete on another's poll; assert 403 |
| Owner/Admin (delete) | Soft-deleted polls disappear from every list | Delete poll; assert absent from all lists; detail → not found |
| Privacy | No question/option text or voter identity appears in logs (IDs/counts only) | Inspect emitted logs across create/vote/close/delete |

### Use Cases

**Use Case 1: Create and run a poll**
- **Trigger:** A member wants a quick group decision.
- **Main flow:** (1) Member opens Team Poll → (2) creates a poll with a question + 2–6 options → (3) shares it; teammates sign in → (4) each casts exactly one vote → (5) live results update with counts/percentages.
- **Alternative flow:** A voter changes their mind — re-selects another option while the poll is open; the previous vote is replaced (still one vote per user); counts adjust.
- **Exception:** Member submits fewer than 2 / more than 6 options, or an over-length question/option → boundary validation rejects with a clear message; the poll is not created.

**Use Case 2: Vote on a poll**
- **Trigger:** A member opens a shared, open poll.
- **Main flow:** (1) Member views the poll → (2) selects exactly one option → (3) submits → (4) sees results (counts + percentages, total).
- **Alternative flow:** Member has already voted → their prior choice is pre-selected; choosing another and submitting changes the vote rather than adding one.
- **Exception:** The poll is closed → voting is disabled / submission rejected with "this poll is closed"; the member can still view results.

**Use Case 3: Close or delete a poll (owner / admin)**
- **Trigger:** An owner or admin wants to finalize or remove a poll.
- **Main flow:** (1) Owner/admin opens the poll → (2) chooses Close or Delete → (3) Close makes it read-only but still viewable; Delete soft-deletes it (hidden from all lists).
- **Alternative flow:** An admin acts on a poll they do not own → permitted via the `Poll.Admin` role.
- **Exception:** A member (non-owner, non-admin) attempts to close/delete → **403 Forbidden**; the poll is unchanged.

### Constraints treated as additional acceptance criteria

- Read paths (list, vote, results) render quickly under the Tier 1 100-concurrent-user target; no long-running work in any request.
- Results refresh on load / via TanStack Query refetch — **no real-time push** is required or expected.

### What "Good Output" Looks Like

A clean MWS-styled list with open polls first then closed — each row showing the question, option count, total votes, open/closed state, and owner name. A single-select vote form with labelled controls. A results view showing each option's count and percentage plus the total. Accessible (labelled form controls; axe-clean create-poll and vote forms), built from MWS design tokens only.

---

## 6. CONSTRAINTS & BOUNDARIES

### What the Solution Should NEVER Do (also QA's inverse acceptance criteria)

- [x] Never allow voting on a **closed** poll.
- [x] Never allow more than **one effective vote** per user per poll (enforced by `UNIQUE (PollId, VoterOid)`).
- [x] Never allow a non-owner / non-admin to close or delete a poll → **403, not 404**.
- [x] Never show a member another's per-option results **before that member has voted** (owner/admin exempt).
- [x] Never log question text, option text, or voter identity (IDs/counts only).
- [x] Never expose soft-deleted polls in any list.
- [x] Never allow anonymous/public access — sign-in is required for everything.

### Technical Constraints

- Tier 1 stack only: **Web** — React 19 + TypeScript + Vite + Vitest + CSS Modules, MWS design tokens (`var(--…)`), semantic HTML, MSAL `AuthenticatedTemplate`. **API** — ASP.NET Core 10 + EF Core + Microsoft.Identity.Web; `[Authorize]` on all endpoints, `[Authorize(Roles="Poll.Admin")]` on admin-only actions; `ProblemDetails` on errors; `Cache-Control: private, no-store`; `CancellationToken` threaded through every async path; validation at the boundary (question/option lengths, 2–6 options, option belongs to the poll being voted on); ownership violation → `Forbid()` (403). **Database** — SQL Server; 6 audit columns + soft delete + FK indexes; idempotent migrations with rollbacks.
- No external integrations, no file storage/attachments, no Service Bus/workers, no real-time push, no scheduling.

### Out of Scope — Tier 1 gate (escalate to AI Solutions Lead if requested)

- No anonymous/public polls — sign-in required for everything.
- No document upload / extraction / search; no file attachments.
- No email / Teams / Slack notifications or external integrations.
- No real-time push — results refresh on load / via TanStack Query refetch.
- No CSV/PDF export, no analytics dashboards, no scheduling.

If any of the above is later requested, **stop and escalate** before building — it may breach the Tier 1 gate.

### Approved Integrations for This Solution

- Entra ID (single-tenant) for authentication and the `Poll.Admin` app role. **No other** integrations.

---

## 7. ROLES & HANDOFFS

| Role | Responsibility for This Solution |
|---|---|
| **AI Solutions Analyst** | Requirements owner; Tier 1 → owns the full build end-to-end in Claude Code (no separate Developer handoff). |
| **UI/UX Designer** | Not separately staffed — UI is built from the MWS design system (tokens + companion rules). |
| **Developer** | N/A for Tier 1 (Analyst builds). |
| **QA** | Behavior-floor tests authored inline alongside the code; acceptance criteria in Section 5 are the contract. |
| **Requestor / Business Owner** | UAT sign-off — Nagarjuna Chamidisetty (self; internal test build). |

---

## 8. APPROVALS REQUIRED

N/A — internal workflow test app, self-approved by the Analyst/requestor. No external approvals required for this build (Internal sensitivity; no client/matter or privileged data; no new integrations beyond Entra auth).

| Approval Type | Required? | Approver | Status |
|---|---|---|---|
| IT / Security Review | No — internal test app | Self | `N/A` |
| Data Privacy Review | No — Internal; minimal pseudonymous identity data only | Self | `N/A` |
| Practice Group Sign-off | No — internal test build | Self | `N/A` |
| Legal / Compliance | No — no client/matter or privileged data | Self | `N/A` |
| Executive Sponsor | No — self-approved | Self | `N/A` |

---

## 9. TIMELINE

No fixed deadline — internal workflow test build.

| Milestone | Target Date | Owner | Status |
|---|---|---|---|
| Requirements finalized | 2026-06-25 | Analyst | Done |
| Solution design approved | No fixed date (internal test) | Analyst | |
| Build complete (v1) | No fixed date (internal test) | Analyst | |
| QA complete | No fixed date (internal test) | Analyst | |
| UAT / Business review | No fixed date (internal test) | Requestor (self) | |
| Deployment | No fixed date (internal test) | Analyst | |

**Phasing:**
- **v1 (this build):** the six in-scope features — create, list, vote, view results, close, delete — with the auth/validation/privacy/accessibility NFRs above.
- **Phase 2 (post-v1, NOT part of v1):** one small follow-up enhancement to be made in a *separate* session and shipped via `/ship` (used as a new-session ship test). Candidates:
  - **A (recommended — smallest):** show a "🗳 N votes" badge on each poll in the list (API returns the count; web renders it). Minimal multi-layer diff across api + web.
  - **B:** add an optional **closing date**; a poll past its date is treated as closed (no new votes).
  - **C:** owner can **reorder** a poll's options (DisplayOrder).

  Do **not** build Phase 2 as part of v1.

---

## 10. INSTRUCTIONS FOR CLAUDE

*Written directly to Claude. Follow these every time you work on this solution.*

1. Always read this entire file before taking any action.
2. If any required field above is blank or `[PENDING]`, flag it before proceeding (the open items are administrative — Section 2 requestor/user-count, Section 8 approvals, Section 9 dates — and do not block the v1 build).
3. Treat all data in this project as **Internal Only**. The only identity data stored is the Entra `oid` (pseudonymous) plus a cached owner display name.
4. Primary audience for outputs is **authenticated firm employees (Members)**, with privileged close/delete actions for **poll owners** and **`Poll.Admin`** admins.
5. **Authorization:** every endpoint requires Entra auth; admin-only actions use `[Authorize(Roles="Poll.Admin")]`. A non-owner/non-admin mutating a poll returns **403 (`Forbid()`), never 404**.
6. **One vote per user per poll** is enforced by `UNIQUE (PollId, VoterOid)`; a user may change their vote while the poll is open; no voting on a closed poll.
7. **Results visibility:** owner/admin always see results; a Member sees per-option results only after they have voted.
8. **Privacy:** never log question text, option text, or voter identity — IDs and counts only.
9. **API conventions:** `ProblemDetails` on errors; `Cache-Control: private, no-store`; `CancellationToken` on every async path; validate at the boundary (lengths, 2–6 options, option belongs to the poll).
10. **Design:** MWS tokens only (`var(--…)`), semantic HTML, CSS Modules; labelled form controls; axe assertions on the create-poll and vote forms.
11. **Soft delete** hides polls from every list/query by default.
12. **Stay within the Tier 1 gate.** If any Section 6 out-of-scope item is requested (anonymous polls, file upload/processing, notifications/integrations, real-time push, export/analytics/scheduling), **stop and escalate** to the AI Solutions Lead before building.
13. **Phase 2 is out of v1 scope** — do not build it during the v1 pass.

---

## 11. CHANGE LOG

| Date | Changed By | Section(s) Affected | What Changed & Why |
|---|---|---|---|
| 2026-06-25 | Nagarjuna Chamidisetty | All | Initial requirements captured via intake interview. Analyst supplied a complete, build-ready spec (problem, roles, in/out scope, data model, NFRs, acceptance criteria, phasing). |
| 2026-06-25 | Nagarjuna Chamidisetty | §1, §6 | **Tier 1 confirmed — clean gate.** Internal authenticated users; single-tenant Entra ID with `Poll.Admin` app role; row access is app-managed (ownership + admin role), **not** external client-matter; Azure App Service + Azure SQL; no doc processing, no Service Bus, no external surface. No escalation required. |
| 2026-06-25 | Nagarjuna Chamidisetty | §2, §7, §8, §9 | Administrative fields resolved: requestor/primary contact = Nagarjuna Chamidisetty; ~50 internal users (Tier 1 range); no fixed deadline (internal workflow test build); approvals N/A — self-approved internal test app. No remaining `[PENDING]` items. |

---

*Template Version: 1.0 | Maintained by: AI Solutions Analyst*
