# McDermott Design System

The shared design system for McDermott's internal AI applications. Every app — there are many, and the count is meant to scale into the hundreds — wears **one identity**: a single symbol + divider + app-name lockup (no per-app logos), a fixed token set for color, type, and spacing, light and dark modes, and a consciously restrained, professional aesthetic.

This project is the runnable form of that system: CSS tokens consumers link, React component primitives, foundation specimen cards for the Design System tab, and full-screen UI-kit recreations of real McDermott AI app surfaces.

> **Posture in one line:** Navy + pale + accent. Saturated colors are *targeted spice, not default tools.* When in doubt, use less — fewer borders, lighter weight, no gradient, no shadow. If a component feels visually loud, it's wrong.

---

## Sources

The entire system derives from an attached, read-only specification codebase — **the single source of truth**. Never re-derive tokens, colors, or spacing from rendered HTML; the values below come from the constitution.

| Source | Role |
|---|---|
| `DesignSystem-main/_core-requirements.md` | The constitution — tokens, critical rules, component specs, anti-patterns |
| `DesignSystem-main/application-lockup.md` | The symbol + divider + name lockup and app-naming convention |
| `DesignSystem-main/app-shell-and-headers.md` | Top-bar minimalism, sidebar + topbar + content frame |
| `DesignSystem-main/navigation-and-ia.md` | Sidebar contents, mobile drawer, what does NOT belong in nav |
| `DesignSystem-main/steppers-and-wizards.md` | Continuous-track stepper spec and the four states |
| `DesignSystem-main/responsive-and-mobile.md` | Mobile-is-editing mandate; the overflow/flex gotchas |
| `DesignSystem-main/extrapolating-the-system.md` | Pre-flight compliance gates for un-spec'd components |
| `DesignSystem-main/mws-design-system-showcase.html` | Reference rendering (light + dark) — a mirror, not a source |

A trimmed copy of the showcase lives at `reference/showcase.html` for visual cross-checking only.

### Products represented

McDermott AI apps are **enterprise legal-tech tools** — descriptive, single-purpose utilities named domain-first (object then function): *Deposition Summarizer*, *Privilege Log Analyzer*, *Review Cost Estimator*. They share the app shell (navy sidebar, calm top bar, 1200px content column) and split into two recurring surface types, both recreated here as UI kits:

- **Calculation / wizard flows** — multi-step builders with an info-stepper carrying running values (the Review Cost Estimator).
- **AI assistant surfaces** — chat with citations, streaming, tool calls, and suggested prompts (the Deposition Summarizer).

---

## Content fundamentals

**Voice attributes:** Precise. Warm. Confident. Never cute. *Editorial in headlines, neutral in UI.*

- **Person & address.** UI speaks plainly and mostly impersonally ("Two scenarios are ready to review"). Address the user as *you* when giving direct guidance ("Confirm the rate card before publishing"). Never first-person "I" from the product.
- **Casing.** Headlines and page titles are **sentence case**, never Title Case ("Estimate the matter", not "Estimate The Matter"). Eyebrows, labels, and button text are **ALL CAPS**. App names in the lockup are **Title Case** (proper nouns). Proper nouns elsewhere are Title Case.
- **Buttons are verb + noun** — "Save changes", "Generate estimate", "Delete matter". Never "OK", "Yes", "No", "Submit".
- **Errors** state *what happened + (if known) why + how to fix*: "Matter ID not found. Check the number and try again." Error copy is shown as navy text on a pale-orange fill — **never red text**, never an isolated "Error".
- **Forbidden tics.** No exclamation marks in errors or warnings. No "Oops!", "Whoops!", "Just", "Simply". No emoji — the voice is professional, not playful. No nervous hedging.
- **AI confidence is linguistic, never numeric** — "may", "likely", not "87% confident". Factual AI claims are **always cited** (inline ¹ markers or a source list).
- **Mark optional, not required.** Forms tag the optional fields; no asterisks.

**The vibe:** a senior associate who is exact, calm, and never wastes your time. Reads like a well-edited memo, not a marketing site and not a chatbot.

---

## Visual foundations

**Color.** A navy base (`#000042`) carries text on light and is the sidebar in both themes. The interactive accent is **semantic and theme-flipping**: `--accent-interactive` is blue in light mode, teal in dark — used for primary buttons, focus rings, selected states, active tabs, links-on-hover, AI accents, single-series charts. Direct `--color-teal` is restricted to exactly two places: the navy sidebar's active state, and categorical chart series. Pale tints (blue/magenta/orange/gold/success) are theme-stable highlight fills and **always pair with navy text**. Saturated secondary/alert colors are spice — small doses, never routine surfaces. No gradients on routine surfaces; flatten to a solid token.

**Type.** System fonts only — **no web fonts**. Two roles: a system **sans** (`-apple-system, …`) for body, UI, and buttons; **Georgia** (`--font-mix` / `--font-serif`) for navigation, display headings, card titles, and editorial text. Display/headings run tight (−2% to −4% tracking, 0.95–1.2 line-height) and large (up to 64px), stepping down responsively. Eyebrows and buttons are 13–14px ALL CAPS with 5–10% tracking. The Georgia-for-headlines + system-sans-for-UI pairing is the core typographic signature.

**Spacing & layout.** 4px base scale (`--space-1…9`); every margin/padding is a token, no arbitrary px. Vertical rhythm: `--space-4` between siblings, `--space-6` between sections, `--space-8` between page regions. The app shell is a persistent navy sidebar (260px) + 56px sticky top bar + a `min(100%, 1200px)` content column. Below 1024px the sidebar becomes a left slide-in drawer with a scrim.

**Backgrounds & imagery.** Flat solid surfaces — `--bg-page` behind, `--bg-surface` for cards. No full-bleed photography, no repeating textures, no decorative gradients. Where an image area is needed, a solid pale fill with a single large Georgia letter is the brand-aligned placeholder (never a generic gray box). Imagery, when present, is incidental, not atmospheric.

**Borders, corners, elevation.** Borders are **1px in `--border-light`** — always; heavier rules are wrong (the only thicker stroke is a 4px left-rail accent on alerts/cards). Radius is **2px (`--radius`) or 999px (pills)** — nothing in between. Shadows (`--shadow-sm/-md/-lg`) signal elevation hierarchy (hover lift, dropdown, modal) — **most surfaces have none.** Cards are a surface fill + 1px border + 2px corners, lifting `translateY(-2px)` with `--shadow-md` on hover. No drop shadow on every card; no colored-left-border-only "callout" cards beyond the speced alert/permission pattern.

**Motion.** Durations scale with surface size: 100ms micro, 200ms default, 300ms surfaces, 500ms choreographed. Easings: standard (default), emphasis (entering), exit (leaving). Transitions are quiet fades and short slides — **no bounces, no springy overshoot, no infinite decorative loops** on content. Everything is wrapped in `prefers-reduced-motion: reduce`, which disables decorative loops (skeleton, cursor blink, thinking dots) while keeping state changes near-instant. Never `transition: none`.

**Hover / press / focus.**
- **Hover** on text-bearing clickables (links, nav, content titles, chips, follow-ups) flips **both** the border accent **and** the text color to `--accent-interactive` — border-only is the broken state. Primary buttons hover to navy/white (light) or white/navy (dark); secondary buttons fill navy/teal; destructive only *darkens* the red (never flips).
- **Press / active** steps one shade darker — no movement, no shrink.
- **Focus-visible** is an always-on 2px ring at `--focus-ring` with 2px offset (3px on buttons). `outline: none` without a replacement is forbidden.

**Transparency & blur.** Used sparingly and only with intent: the sidebar active state is a 5% white tint; modal/drawer scrims are a navy/black tint with a 4px backdrop blur. No frosted-glass surfaces elsewhere.

**Restraint test.** If an element has a thick border → make it 1px. A saturated background → make it a pale token or surface. Rounded > 2px → reduce. More than two colors beyond navy/white/text → pull one out.

---

## Iconography

- **Source:** **Phosphor Icons**, *Regular weight only* — 2px monoline stroke, no fill. Filled and duotone variants are forbidden. In production React the source is `@phosphor-icons/react`; in these static cards and kits, Phosphor's web font is linked from CDN (`@phosphor-icons/web`, regular style) and icons are `<i class="ph ph-name">`. This is a faithful weight/style match to the spec, not a substitution.
- **Sizes:** 16 / 20 / 24 / 32 / 48 / 64px — never in between. In-button icons are locked to 16px.
- **Color:** `--icon-default` (navy on light, teal on dark) for default; `--accent-interactive` for interactive icons. Never recolor outside the tokens.
- **Accessibility:** decorative icons paired with a text label get `aria-hidden="true"`; icon-only buttons require an `aria-label`.
- **Emoji & unicode:** never. The system uses no emoji and does not press unicode glyphs into service as icons.
- **The one fixed vector** is the McDermott symbol (M-in-circle), embedded inline with `fill="currentColor"` — see `components/Lockup/`. It is a graphic mark, never the firm name set in type, and is never recolored, cropped, or substituted.

---

## Index / manifest

**Root**
- `styles.css` — the single entry point consumers link (`@import` list only).
- `tokens/` — `colors.css`, `theme.css` (light/dark semantic aliases), `typography.css`, `spacing.css`, `elevation.css`, `motion.css`, `base.css` (reset + lockup utility).
- `foundations/` — 16 Design System tab specimen cards (Colors, Type, Spacing, Brand).
- `reference/showcase.html` — read-only reference rendering.
- `SKILL.md` — Agent-Skills front matter for use in Claude Code.

**Components** (`components/<Name>/` — `.jsx` + `.d.ts` + `.prompt.md` + a `@dsCard` html)
`Button` · `IconButton` · `Lockup` (+ `McDermottSymbol`) · `Input` · `Checkbox` (checkbox + radio) · `Switch` · `Badge` · `Card` · `Alert` · `Tabs` · `Stepper` · `Avatar`.
Consume from the compiled bundle: `const { Button } = window.McDermottDesignSystem_ba7ae4`.

**UI kits** (`ui_kits/<product>/`)
- `review-cost-estimator/` — the multi-step estimator: matter setup → processing → review, info-stepper with running values, generated summary. App shell with navy sidebar + calm top bar.
- `deposition-summarizer/` — the AI assistant surface: empty state with prompt chips, streaming answer with citations, a tool-call row, and feedback.

---

*When extending the system, build by composition from these tokens — never invent a color, spacing value, or radius. Match the reference before inventing a new treatment.*
