# Team Poll — Architectural Decisions Log

This file records every non-obvious architectural decision made on this project. It is the compliance audit trail; reviewers will read it.

Format: one entry per decision, ADR-lite (≈ 5 lines each).

---

## ADR-001 — Coverage gate: behavior-floor, not 80% line/branch

**Date:** 2026-06-26
**Status:** Accepted (framework default)
**Context:** Firm Tier 1+ standard mandates 80% coverage gate on web (jest-axe per component) and CI-level enforcement.
**Decision:** Tier 1 runs behavior-floor coverage — every behavior listed in `_core-requirements.md` Pre-Impl Checklist and the layer testing rules must be tested; coverage percentage is reported but not gated.
**Consequence:** Speed of iteration vs. compliance defensibility on coverage. If compliance asks, point them at the test list, not the percentage.

## ADR-002 — Frontend stack: Vite + Vitest + CSS Modules

**Date:** 2026-06-26
**Status:** Accepted (framework default)
**Context:** Firm Tier 1+ standard is webpack 5 + Jest + SCSS Modules.
**Decision:** Tier 1 uses Vite + Vitest + CSS Modules.
**Consequence:** Faster dev server, simpler config; documented deviation from firm rule files (web-testing.md, web-styling.md).

## ADR-003 — Planning artefacts: 2 docs, not 7

**Date:** 2026-06-26
**Status:** Accepted (framework default)
**Context:** Firm Tier 1+ produces 7 architecture docs as the compliance audit trail.
**Decision:** Tier 1 produces 2 docs — `plan.md` and `decisions.md`. The ADR-style `decisions.md` carries the compliance trail.
**Consequence:** Less ceremony; relies on disciplined ADR authorship during /build.

## ADR-004 — Security scanning baseline

**Date:** 2026-06-26
**Status:** Accepted (framework default)
**Context:** Firm Tier 1+ references Gitleaks + Dependabot + SonarQube as expected inputs to /remediation.
**Decision:** Tier 1 ships four scanners in CI by default (see `.github/workflows/ci.yml`): SonarCloud SAST, Gitleaks secret-scan, `dotnet list package --vulnerable --include-transitive`, and a **split `npm audit`** — `npm audit --omit=dev --audit-level=high` runs as a **blocking** gate on shipped dependencies, and a full `npm audit --audit-level=high` runs as a **non-blocking visibility** step covering dev-only tooling. Dev-only Critical/High findings must be documented as an ADR entry in `decisions.md` per `web-dependency-security.md`; they do not fail the build. Dependabot/Renovate is NOT pre-configured — add it per project if auto-PR triage is desired.
**Consequence:** Baseline catches committed secrets, vulnerable direct/transitive deps in the shipped bundle, and SAST patterns — without holding ship on dev-tooling advisories (e.g. a CVE in a test runner's UI server) that don't reach end users. Every accepted dev-only advisory leaves an audit trail via the required ADR. No license-compliance, container, or CodeQL scanning by default; add as needed (e.g., privileged-content apps should add CodeQL).

## ADR-005 — Build process: 2 skills, single-pass build

**Date:** 2026-06-26
**Status:** Accepted (framework default)
**Context:** Firm Tier 1+ uses /build-architecture → /build-scaffold → /build-application, with incremental per-capability delivery.
**Decision:** Tier 1 collapses to /plan → /build. Scaffolding happens on first /build invocation; the same invocation implements the entire application end-to-end. The build pauses only when an architectural decision needs developer input (new dependency, new pattern, new third-party service).
**Consequence:** No separate scaffold-gate review and no intermediate reviews — `/review` is the single build-completion gate that catches structural issues. Suits internal apps at Tier 1's bounded scope; not appropriate for projects large enough to need incremental delivery.

---

## App-specific decisions

## ADR-006 — Poll ownership keyed on the `CreatedBy` audit column + cached display name

**Date:** 2026-06-26
**Status:** Accepted
**Context:** The requirements sketch lists `OwnerOid` + a cached owner display name on `Poll`. The framework already mandates a `CreatedBy` audit column carrying the Entra `oid`, and `api-record-access.md` names `CreatedBy` as the canonical ownership source.
**Decision:** Use `CreatedBy` (Entra `oid`) as the ownership key — no separate `OwnerOid` column — and store `OwnerDisplayName` (NVARCHAR(256)) on `Poll`, cached from the JWT `name` claim at creation, so list/detail render the owner without a join to `dbo.Users`.
**Consequence:** One identity column, not two; ownership checks (`poll.CreatedBy == caller.oid || caller has Poll.Admin`) align with the standard access pattern. `OwnerDisplayName` is a denormalized cache — a later display-name change in Entra won't retro-update old polls (acceptable for this app).

## ADR-007 — One vote per user enforced by a filtered UNIQUE index; change = update

**Date:** 2026-06-26
**Status:** Accepted
**Context:** "One vote per user per poll, changeable while open" is a core rule and an acceptance criterion. App-level checks alone race under concurrency.
**Decision:** Enforce at the database with `UX_Votes_PollId_VoterOid` — a UNIQUE index on `(PollId, VoterOid)` filtered `WHERE IsDeleted = 0`. A vote **change** updates the existing row's `PollOptionId` rather than inserting a second row.
**Consequence:** Concurrency-safe single vote (a duplicate insert fails at the DB, surfaced as a 409); the filtered predicate keeps the constraint compatible with soft-delete. No separate vote-history is kept (out of scope).

## ADR-008 — Vote cast/change modeled as idempotent `PUT /api/polls/{id}/vote`

**Date:** 2026-06-26
**Status:** Accepted
**Context:** Casting a first vote and changing an existing vote are the same domain operation: "set my vote on this poll to option X." One vote per user means there is never more than one vote resource per caller per poll.
**Decision:** Expose a single idempotent `PUT /api/polls/{id}/vote` with `{optionId}` that upserts the caller's vote. No `POST /votes` collection endpoint and no retract/`DELETE` (retract is out of scope).
**Consequence:** Simpler contract that matches the prototype's single "Cast / Update vote" affordance; repeating the same PUT is a no-op-equivalent. Server validates the poll is open (else 409) and the option belongs to the poll (else 400).

## ADR-009 — Results visibility gated server-side

**Date:** 2026-06-26
**Status:** Accepted
**Context:** Members may see per-option results only **after** they vote; poll owners and `Poll.Admin` always see them. Gating only in the UI would leak counts via the API.
**Decision:** `GET /api/polls/{id}` computes `resultsVisible = isOwner || isAdmin || callerHasVoted` and **omits** per-option `voteCount`/`percentage` when false; the aggregate `totalVotes` is still returned (it is shown on the list and header for everyone). The `PUT .../vote` response returns the now-visible results.
**Consequence:** The visibility rule is enforced at the trust boundary, not the client. The bare total-votes count is intentionally visible pre-vote (consistent with the list); confirmed as plan §8 open question 3.

## ADR-010 — Poll question max length is 280 (prototype's 140 overridden)

**Date:** 2026-06-26
**Status:** Accepted
**Context:** The approved prototype capped the poll question at 140 characters; `solution-requirements.md` specifies 1–280 with a testable AC at the 280/281 boundary. Resolved at the design-code-handoff checkpoint in favor of the requirement.
**Decision:** Question validation (DTO data-annotation, EF column `NVARCHAR(280)`, and the web `Input` maxLength) uses **280**. Options remain 1–80, count 2–6.
**Consequence:** The build follows the requirement, not the prototype HTML. Recorded in the blueprint's Reconciliation log; QA tests the 280/281 boundary.

## ADR-011 — Poll list is paginated though expected volume is low

**Date:** 2026-06-26
**Status:** Accepted
**Context:** The list rules call for pagination on any list endpoint, but the prototype shows an ungrouped-by-page Open/Closed card layout and expected poll volume is small (a single team).
**Decision:** `GET /api/polls` accepts `page`/`pageSize` (default 50, max 100) and orders open-first then `CreatedAt` desc; the web consumes a single page and groups Open/Closed client-side. Pagination is a forward-compatible guard against unbounded growth, not a UI feature for v1.
**Consequence:** Honors the list-pagination rule without complicating the grouped UI. If poll volume ever grows, the contract already supports paging; revisit the UI then.

---

## ADR-012 — API integration tests: Testcontainers SQL Server, Docker-gated

**Date:** 2026-06-26
**Status:** Accepted
**Context:** `api-testing-guidelines.md` forbids the EF in-memory provider and requires a real SQL Server (LocalDB by default, Testcontainers in CI). macOS dev boxes have no LocalDB, and Docker may not always be running locally.
**Decision:** Integration tests use **Testcontainers.MsSql**; a collection fixture applies the real `database/migrations` + `procedures` scripts to a fresh container (so tests exercise the actual schema, incl. `UX_Votes_PollId_VoterOid`). The fixture detects Docker availability; when absent, tests **skip** (via `Xunit.SkippableFact`) with a clear reason rather than failing — local `dotnet test` stays green; CI (Docker present) runs them fully.
**Consequence:** New test-only dependencies (`Testcontainers.MsSql`, `Xunit.SkippableFact`). Local runs need Docker to exercise the DB paths; the always-run validation/auth tests cover the controller boundary regardless. Verified locally: 19/19 passed with the container up.

## ADR-013 — PollService validated via integration tests, not isolated unit mocks

**Date:** 2026-06-26
**Status:** Accepted
**Context:** `api-testing-guidelines.md` asks for unit tests per service (happy/permanent-failure/cancellation). `PollService` is a thin EF orchestrator coupled to `DbContext` and two stored procs; the in-memory provider is banned and `api-data-access.md` forbids a repository abstraction — so there is no clean seam to mock.
**Decision:** Cover `PollService` behaviours (create, list+counts, results-gating, vote upsert/change, closed→409, ownership→403-not-404, soft-delete exclusion) through **integration tests** against real SQL Server — a stronger guarantee than mocking EF. Controller-boundary validation/auth (401/400) is covered by always-run tests that need no DB.
**Consequence:** Behaviour-floor met via integration coverage; no mock-only unit class for the service. If a future, genuinely-pure helper is extracted, add isolated unit tests for it then.

## ADR-014 — Web navigation: internal view-state, no router

**Date:** 2026-06-26
**Status:** Accepted
**Context:** The product is a single-section, three-view app (list / create / detail); the approved prototype navigates via internal state, not URLs. A router would add a dependency and chrome.
**Decision:** Navigate with an in-app `useReducer` view-state (`src/store/navigation.tsx`) over list/create/detail, mirroring the prototype. No `react-router`. Deep-linking to a specific poll URL is therefore not supported in v1 (not a stated requirement).
**Consequence:** Fewer dependencies, matches the prototype. If shareable per-poll URLs become a requirement, introduce routing then (a localized change).

## ADR-015 — Web dependency set aligned to React 19

**Date:** 2026-06-26
**Status:** Accepted
**Context:** React 19 peer requirements force a coherent modern toolchain; older MSAL/Vite majors cap at React 18.
**Decision:** Use `@azure/msal-react` 5 + `@azure/msal-browser` 5 (React 19-compatible), Vite 7 + `@vitejs/plugin-react` 5 + Vitest 3, and `undici` 8.5.0 (resolves a high advisory in the dev/test polyfill). `npm audit --omit=dev` is clean (0); the remaining low findings are dev-only (recorded here per `web-dependency-security.md`).
**Consequence:** A current, internally-consistent web stack. `npm audit --omit=dev` (the blocking gate) passes; dev-only low advisories are accepted and audit-trailed here.

---

## App-specific decisions (continued)

(Add further entries here as they arise. Next number: ADR-016.)
