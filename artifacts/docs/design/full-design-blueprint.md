# Team Poll — Full Design Blueprint

> Canonical planning document for the whole product. Humans read top to bottom; Claude Code reads the structured sections; the **design-code-handoff** skill updates this file after the prototype is approved. Derived from `artifacts/docs/product/solution-requirements.md`. **No routes, endpoints, data schemas, or UI component lists** — those are Code's decisions.

---

## At a glance

| | |
|---|---|
| **Product** | Team Poll — an internal, signed-in web app for quick one-vote-per-person team polls with live results. |
| **Prototype scope** | **3 screens** prototyped of **5** total (S2 Poll list, S3 Create poll, S4 Poll detail). |
| **Design directions** | 1 (one confident design per screen). |
| **Demo persona** | A team **Member** running "Which day for the offsite?" end-to-end — create → share → vote → see results. |
| **Platforms** | Responsive web, 320px → desktop, light **and** dark. |
| **Auth / access** | Single-tenant Entra ID; signed-in for everything. Access is app-managed — poll **ownership** + the `Poll.Admin` role. Not external client-matter. |
| **Tier** | Tier 1 internal app. |

---

## Core flow (happy path)

1. A Member signs in (Entra) and lands on the **Poll list (S2)** — open polls first, then closed.
2. They click **Create poll** → **Create poll (S3)** and enter a question (1–280 chars) plus 2–6 options (each 1–80 chars).
3. Submit → returns to the **Poll list (S2)** with the new poll at the top of the open section.
4. They open a poll → **Poll detail (S4)**, select exactly one option, and vote (they can change it while the poll is open).
5. After voting, **S4** flips to **results** — each option's count + percentage and the total. A Member who hasn't voted doesn't see the per-option breakdown yet; the owner and admins always do.
6. The poll's **owner** (or an **admin**) can **Close** it (becomes a read-only record) or **Delete** it (soft-delete, behind a confirm) from S4.

---

## What's in the prototype — and why

| ID | Screen | Why it's prototyped | Value | Uncertainty | Source |
|---|---|---|---|---|---|
| **S2** | Poll list (home) | The core surface and the start of every demo. Open-first ordering and the at-a-glance row (question, option count, total votes, state, owner) are the product's spine. | 5 | 3 | requirement |
| **S3** | Create poll | Central creation action. The dynamic 2–6 option add/remove editor and length validation are the one genuinely novel bit of UX worth seeing before build. | 5 | 4 | requirement |
| **S4** | Poll detail — vote + results | The heart of the product: cast/change a single vote, then the same screen shows live results. Hosts the closed read-only state and the owner/admin Close & Delete actions. | 5 | 4 | requirement |

---

## What's deferred

Built directly by Claude Code, not prototyped (full detail in **Deferred screen details** below):

- **S1 — Sign in (Entra/MSAL):** auth boilerplate; the prototype runs signed-in with seeded data.
- **S5 — Error / permission states (403 / 404 / 500):** standard MWS patterns; the 403-not-404 ownership rule is server-enforced, not a screen to prototype.

---

## Skill settings used

- **screen_budget:** 6 (3 used) · **directions:** 1 · **variant_exploration:** off

---

## Open questions for sign-off

1. **Results are aggregate only** — counts and percentages per option, never a per-voter breakdown ("who voted for what"). This matches the privacy rule (no voter identity surfaced). Confirm no "who voted" view is wanted in v1. *(Assumed: yes, aggregate-only.)*
2. **Total-votes visible pre-vote.** The list row and poll header show the *total* vote count to everyone, while the per-option **results** stay gated until a Member votes (owner/admin exempt). Confirm showing the bare total before voting is acceptable. *(Assumed: yes.)*
3. **Phase 2 confirmed out of v1** — votes badge / closing date / option reorder are post-v1 (a separate ship-test session) and are neither prototyped nor built now. *(Confirmed in requirements.)*

---

## Full screen map

| ID | Name | Role(s) | Platform | Contains (plain language) | Connects to | Tag | Value | Uncert. | Source |
|---|---|---|---|---|---|---|---|---|---|
| **S1** | Sign in | All | Web | Entra sign-in; redirect to S2 on success | → S2 | Deferred | 2 | 1 | inferred-infrastructure |
| **S2** | Poll list (home) | Member / Owner / Admin | Web | Open polls first, then closed — a responsive **card grid** grouped under Open/Closed section headers with counts. Each card: open/closed badge, question, owner avatar + name, and "N options · N votes" meta. "Create poll" action; first-run empty state. | → S3 (create), → S4 (open a poll) | **Prototype** | 5 | 3 | requirement |
| **S3** | Create poll | Member | Web | Question field (**1–280 chars** — build uses 280; see Reconciliation log); 2–6 option fields with add/remove and an "N of 6 options" counter; inline + on-submit length validation; Create / Cancel. | → S2 (after create) | **Prototype** | 5 | 4 | requirement |
| **S4** | Poll detail — vote + results | Member / Owner / Admin | Web | Question + status badge + owner label + total; single-select vote via custom radio "pick rows" (changeable while open); results state — per-option animated bars with count + %, "Your vote" marker, leading-option emphasis, total — gated for members until they vote (owner/admin always see results); closed read-only state; owner/admin Close + Delete with a naming confirm modal. | → S2 (back / after close/delete) | **Prototype** | 5 | 4 | requirement |
| **S5** | Error / permission states | All | Web | 403 (ownership), 404 (not found / soft-deleted), 500 (generic); recovery action | → S2 | Deferred | 2 | 1 | inferred-infrastructure |

### Prototype navigation graph

```
        ┌──────────────────────────────┐
        │  S2 — Poll list (home)        │◀────────────┐
        └───┬───────────────────┬──────┘             │
            │ "Create poll"      │ open a poll        │ back / after
            ▼                    ▼                    │ close or delete
   ┌─────────────────┐   ┌──────────────────────────┐│
   │ S3 — Create poll│   │ S4 — Poll detail          ││
   │                 │   │  vote → results           ││
   └────────┬────────┘   │  (close / delete: owner/  ││
            │ after      │   admin)                  ││
            │ create     └───────────┬──────────────┘│
            └────────────────────────┼───────────────┘
                                     └──── back to S2
```

---

## Deferred screen details

### Role / access matrix

| Screen | Member | Poll owner | Admin (`Poll.Admin`) |
|---|---|---|---|
| S1 Sign in | ✔ | ✔ | ✔ |
| S2 Poll list | View all non-deleted polls; create | Same + Close/Delete own | Same + Close/Delete any |
| S3 Create poll | ✔ create | ✔ | ✔ |
| S4 Poll detail | Vote; see results after voting | + Close/Delete own poll | + Close/Delete any poll |
| S5 Error states | ✔ | ✔ | ✔ |

### S1 — Sign in (Entra / MSAL)

- **Purpose:** Authenticate the user against single-tenant Entra ID before any app surface loads.
- **Who uses it:** Everyone — Members, owners, admins.
- **Content (plain language):** The standard MWS sign-in surface — McDermott lockup, a sign-in prompt, and the Entra redirect. No bespoke fields. On success, land on S2.
- **Business rules:** All app routes require an authenticated session (MSAL `AuthenticatedTemplate` on the web; Entra on the API). No anonymous/public access anywhere. First authenticated request idempotently provisions the user record server-side — the client never calls a "register" step.
- **Connects to:** → S2 (Poll list) on success.
- **Why deferred:** Auth boilerplate with no novel UX; the prototype runs signed-in with seeded data.

### S5 — Error / permission states (403 / 404 / 500)

- **Purpose:** Tell the user clearly when an action is denied, a poll can't be found, or something failed — with a way back.
- **Who uses it:** Everyone.
- **Content (plain language):**
  - **403** — attempting to close/delete a poll the user doesn't own and isn't an admin for: "You don't have access to this poll," with a path back to the list.
  - **404 / not found** — a poll that doesn't exist or has been soft-deleted: "This poll is no longer available."
  - **500 / generic** — "Something went wrong. Try again in a moment," with retry.
- **Business rules:** Ownership violations return **403, never 404**, and are enforced server-side. Soft-deleted polls are treated as not-found. Error copy follows the MWS error formula (what + why + how to recover); no stack traces or internal detail surfaced.
- **Connects to:** → S2 (return to the list) or a retry.
- **Why deferred:** Standard MWS error/empty/permission patterns; no prototype feedback needed.

---

## Cross-cutting notes

- **Auth everywhere.** Every screen is behind Entra sign-in; the prototype simulates a signed-in Member with seeded polls.
- **Privacy.** Results are always aggregate (counts + percentages). Voter identity is never displayed and never logged.
- **Ownership = 403, not 404.** Non-owner/non-admin mutations are refused with 403, server-side. Surfaced via S5, not a dedicated screen per action.
- **Results visibility.** Owner/admin always see per-option results; a Member sees them only after voting. The bare total-votes count is visible earlier (list + header).
- **One vote per person.** Enforced at the data layer; a Member may change their vote while the poll is open; no votes on a closed poll.
- **No real-time push.** Results refresh on load / via refetch — there is no live socket. The "live results" experience is refetch-driven.
- **Responsive + theming.** Every screen must work 320px → desktop in both light and dark, per the MWS responsive mandate.
- **MWS design system is the source of truth** for components, tokens, typography, and spacing. No invented colors, radii, or spacing.

### Design decisions to preserve

Distinctive choices the approved prototype made beyond default design-system application. Recorded so they survive the bundle. Source: `artifacts/docs/design/project/Team Poll.dc.html` (single design-canvas file; line refs below).

| # | Decision | Applies to | Prototype source |
|---|---|---|---|
| D1 | **Card-grid list, not a table** — polls render as a responsive card grid (`auto-fill, minmax(300px, 1fr)`) grouped under "Open" / "Closed" section headers with counts. Each card: status badge, large serif question, owner avatar + name, "N options · N votes" meta. | S2 | `Team Poll.dc.html` §list (lines ~99–151) |
| D2 | **Animated result bars** — each option's horizontal bar eases its width 0 → % over ~700ms (`--ease-emphasis`) when a poll opens and after a vote is cast. | S4 | `Team Poll.dc.html` §results (lines ~259–289, `animateBars`) |
| D3 | **"Your vote" marker + leading-option emphasis** — the option the current user picked is tagged with a check-circle "Your vote"; the front-runner option's label + percentage render bold. | S4 | `Team Poll.dc.html` (lines ~262–277, `dResultRows`) |
| D4 | **Custom radio "pick rows"** — voting options are full-width clickable rows (`role="radio"`) with a custom radio circle and accent border/tint on selection, rather than native radios. | S4 | `Team Poll.dc.html` §voting (lines ~235–257, `dPickRows`) |
| D5 | **Naming delete-confirm modal** — destructive-variant confirm that quotes the poll's question ("'…' will be removed for everyone on the team, along with its votes. This can't be undone."), scrim + 4px blur, "Keep poll" / "Delete poll". | S4 | `Team Poll.dc.html` §confirm (lines ~297–309) |
| D6 | **Owner labeling + status badges** — detail header reads "Created by you" vs "Created by <name>"; Open uses the `live` badge variant, Closed uses `archived`. App shell adds a navy sidebar (single "Polls" section), top-bar breadcrumb, light/dark theme toggle, and a mobile drawer. | S2, S4 | `Team Poll.dc.html` §shell/detail (lines ~32–73, ~210–231) |

---

## Reconciliation log

**Reconciled with prototype on 2026-06-26** (via design-code-handoff). Covered all three reconciliations:

- **Prototype vs. blueprint:** The prototype built exactly the three Prototype-tagged screens (S2, S3, S4) with navigation matching the plan. No added screens, no removed Prototype screens, no tag changes. Deferred screens S1 and S5 correctly absent — both **confirmed kept deferred**.
- **Requirements vs. blueprint:** All six in-scope features present and correctly scoped (one-vote-per-user with change, results gating for members vs. owner/admin, close = read-only, delete = soft-delete + confirm). **One drift resolved:** the prototype capped the poll question at 140 chars; resolved **in favor of the requirement (1–280)** — the build uses **280**, where the prototype HTML shows 140. No other scope changes; `solution-requirements.md` unchanged.
- **Tier-gate (Tier 1):** No violations. Internal authenticated users, app-managed access (ownership + `Poll.Admin`), no doc processing / Service Bus / file upload / external surface. Stays cleanly within the Tier 1 gate.
- **Form choice noted:** the poll list became a **card grid** (was described as "rows"); prototype is authoritative for form — recorded as D1 above.

---

## Handoff steps

1. **Save** `HANDOFF-design-brief.md` (the download presented by this skill).
2. **Open Claude Design** (claude.ai/design), enter the product name **Team Poll**, select **High Fidelity**, **select the McDermott design system**, then click **Create**.
3. **Upload** the HANDOFF brief and click **Send**.
4. **Build screen 1** (Poll list), then ask Claude Design to build screen 2 (Create poll), then screen 3 (Poll detail) — in flow order so each reuses the prior screen's patterns.
5. **Once the prototype is approved**, export it from Claude Design using **"Project archive"** (the full export — not HTML-only or a single screen), drop the archive into `artifacts/docs/design/`, and run the **design-code-handoff** skill to reconcile this blueprint against the prototype and finish the handoff to Claude Code.
