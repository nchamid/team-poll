# Team Poll — Claude Design handoff brief

## How to use this brief

1. Start a **High Fidelity** Claude Design session with the **McDermott design system** onboarded — it is the source of truth for components, tokens, typography, and spacing.
2. **Paste this whole brief once** at the start so Claude Design has the full picture.
3. Then **build one screen per turn, in order.** Build Screen 1, review, then ask for Screen 2, then Screen 3. Building incrementally lets each screen reuse the patterns the previous one established — a cleaner, more consistent prototype than asking for everything at once.

---

## Anchor — what we're building (read first)

**Team Poll** is an internal web tool that lets a firm team settle small decisions — "which day for the offsite?", "where for lunch?" — without losing votes in a chat thread. Any signed-in team member can create a poll (a question plus a few options), everyone casts exactly **one vote** (and can change it while the poll is open), and the team sees **live results**. The person who created a poll, and admins, can close it (turning it into a read-only record) or delete it.

- **Audience:** internal firm employees — non-technical, professional. They want to ask, vote, and see the answer in seconds.
- **Tone:** calm, confident, restrained — McDermott navy + pale + accent. Not playful. No confetti, no loud color.
- **Platforms:** responsive web, **320px → desktop**, **light and dark**.
- **Seeded, no auth:** the prototype runs as if a team member is already signed in, with a handful of seeded sample polls (a mix of open and closed). **Do not build a sign-in screen.**

**Adhere to the onboarded McDermott design system.** Every component, color, type choice, radius, and spacing value comes from it — don't invent visual style; let the system guide each design decision.

**The larger product (context only — do not build).** Team Poll really also includes Entra sign-in, permission/error states (a "you don't have access" 403, a "poll not found" 404), and standard account affordances. These exist *around* the three screens below so the prototype should feel like part of a real, larger app — but **do not build them.** Prototype only the three screens listed here; don't invent admin dashboards, settings, notifications, or sign-in.

**Less is more.** Prefer the minimal set of components that serve each screen's single purpose. No optional metadata, no secondary controls, no decorative widgets. If an element doesn't serve the screen's one job, leave it out.

---

## Prototype screens (build in this order)

1. **Poll list (home)**
2. **Create poll** ★
3. **Poll detail — vote & results** ★

★ = the screens that matter most to get right; spend the most care here.

**Build Screen 1 first, then stop and wait** for review before moving on.

---

### Screen 1 — Poll list (home)

**Purpose:** the member's home base — every poll they can act on, with **open polls first** so what still needs a vote is obvious, and closed polls below as a record. Each poll should read at a glance: its **question**, **how many options** it has, **how many votes** so far, whether it's **open or closed**, and **who created it**. When there are no polls yet, show a calm first-run prompt inviting the member to create the first one.

**Primary action:** **Create poll** (opens Screen 2). Selecting any poll opens it (Screen 3).

**Link onward:** Create poll → Screen 2 · a poll → Screen 3.

---

### Screen 2 — Create poll ★

**Purpose:** let a member compose a poll — a single **question** plus a short list of **options, between two and six**. The thing to nail is the **option editor**: it starts with two option fields, lets the member add options up to six and remove back down to two, and gives clear, gentle validation when the question or an option is empty or too long. Keep it to one clean column — question, then the option list, then the action.

**Primary action:** **Create poll** — on success, return to the list (Screen 1) with the new poll at the top.

**Link onward:** back to Screen 1.

---

### Screen 3 — Poll detail — vote & results ★

**Purpose:** the core of the product, one screen with a clear before/after.

- **Before voting (open poll):** show the question and its options; the member picks **exactly one** and casts their vote. They can **change** their choice while the poll is open.
- **After voting** — and **always for the poll's owner or an admin** — the same screen shows **live results**: each option's **vote count and share of the total**, plus the **total votes**.
- **Closed polls** are read-only but still show the results.
- The **owner** (and **admins**) also see **Close** and **Delete** actions here; **Delete** asks for confirmation before removing the poll.

Make the **vote → results transition** and the **results display** feel satisfying — this is what the whole product is for.

**Primary action:** cast / change vote → reveals results.

**Link onward:** back to Screen 1.

---

## Scope guardrail

Build **exactly these three screens**, in **one design direction** — no variants, no extra screens, no extra flows. Don't add sign-in, settings, admin dashboards, or notifications. Where a screen needs a different **state** — empty poll list, already-voted, closed/read-only poll, confirm-before-delete — show it as a **state of that same screen**, never a new screen.
