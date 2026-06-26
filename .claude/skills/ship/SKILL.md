---
name: ship
description: Ship a Tier 1 application into `dev` (the integration branch — what gets demoed). Runs `/review` inline as the gate (no review cache), commits directly on the current session branch, merges into `dev` locally with race-handling, pushes `dev`. The only authorised path to a commit in this workflow. No pull requests, no gh dependency.
version: "0.3"
---

# /ship — Ship a Tier 1 app into `dev`

Takes the work `/plan` and `/build` produced. Runs the tests, the security audit, and the code-quality checks. Fixes mechanical issues automatically; flags anything that needs your decision. Then commits, merges into `dev` (the integration branch — what gets demoed), and pushes `dev`. No pull request, no GitHub round-trip. If the change breaks `dev`, run `/undo` (when available) or revert manually.

`/ship` is the **only** path to a commit in this workflow — direct `git commit` is blocked by a PreToolUse hook. The commit happens inside `/ship`'s gate so the review check and the commit are atomic.

This skill is the Tier 1 equivalent of `/dev-ship` — both implement the same gate-commit-merge-push flow, differing only in command name and in the workspace shape (Tier 1 uses one shared workspace; tier 3 uses per-slice worktrees). The analyst does not see worktrees, branches, merges, or pushes — they see "shipping" and "shipped." Speak in plain English alongside git terms per [rules/dev/git-workflow.md](../../rules/dev/git-workflow.md).

## Workspace — the current session worktree

`/plan` and `/build` already worked in the current session worktree. This skill ships that worktree's branch. Resolve its path and branch:

```bash
WT="$(git rev-parse --show-toplevel)"
SLICE_BR=$(git -C "$WT" branch --show-current)
```

`SLICE_BR` is the current session branch — it holds all the plan + build + review work (uncommitted), ready to commit and merge into `dev`.

## Steps

### 1. Branch guard

- Run `git -C "$WT" branch --show-current`.
- If the current branch is `dev`, `main`, or `master`:
  - **STOP** with a plain-English message: *"You're on the integration branch (the one we ship completed work to). `/ship` only runs when you're working on a Tier 1 application that's been planned and built. Run `/plan` first."*

### 2. (No worktree cleanup)

This flow ships the **current session worktree**, not a disposable build worktree, so there is nothing to sweep here. Do **not** run `cleanup-merged-worktrees.sh` — once this branch is merged it would target the live session worktree you're working in. Proceed.

### 3. Show what will be shipped

- Run `git -C "$WT" status` to show all changed and untracked files.
- Run `git -C "$WT" diff --stat` for a summary of changes.
- If there are no changes to ship, report in plain English and **STOP**.

### 4. Review gate — run `/review` inline

`/ship` will not let an untested change reach `dev`. The review gate runs **every time** — there is no review cache to consult or write.

Invoke `/review` with no arguments. It runs unit tests, walks the universal guardrails + Pre-Impl Checklist + layered code-review walk + layered OWASP A01–A10 audit, auto-remediates mechanical findings, and prompts the analyst for architectural decisions — all inside a bounded 5-iteration loop. It returns a status; it does **not** write a `.last-clean-run.json` file.

After `/review` returns:

- Final status **`CLEAN`** → proceed to step 5.
- Final status **`UNRESOLVED-STUCK`** or **`UNRESOLVED-CAP`** → **STOP**. Plain English: *"There are issues I couldn't fix on my own. Shipping is paused until they're sorted."*
- Analyst interrupted `/review` (e.g. left an architectural decision unanswered) → **STOP**. Plain English: *"Shipping is paused — running `/ship` again will pick up where we left off."*

### 5. Commit on the shared workspace's branch

The review gate at step 4 has already cleared this diff (it ran `/review` inline just now). No additional reviews run here — `/ship` commits directly.

**5a. Stage changes.**

- Run `git -C "$WT" status` once more to confirm what's about to be staged.
- Stage with `git -C "$WT" add -A`, but never include `.env`, credential files, or generated artifacts (PDFs, coverage reports, build output). If `git -C "$WT" status` shows any of those, unstage them with `git -C "$WT" reset HEAD -- <path>` before continuing.
- Run `git -C "$WT" diff --cached --stat` to confirm the staged set matches the review-gated diff.
- If staging produces no changes, proceed to step 6 anyway — there may be earlier commits on the branch to ship.

**5b. Generate the commit message.**

- Analyze the staged diff and write a concise, imperative Conventional-Commits-style message:
  - `feat:` new behaviour, `fix:` bug fix, `refactor:` no behaviour change, `test:` tests only, `docs:` docs only, `chore:` tooling.
  - First line ≤ 72 chars. Optional body explains the *why*, not the *what*.
- Append the Co-Authored-By footer:
  `Co-Authored-By: Claude <noreply@anthropic.com>`

**5c. Commit through the PreToolUse gate.**

Direct `git commit` is blocked by `.claude/hooks/block-git-commit.sh`. `/ship` is the authorised path, so it unlocks the gate for exactly one commit using a one-shot token at `.claude/.commit-allowed`.

The unlock and commit MUST run inside a single `bash -c` invocation with a `trap ... EXIT` so the token is cleaned up even if the commit aborts between steps. `$WT` is exported so the subshell can see it:

```bash
export WT
bash -c '
  trap "rm -f .claude/.commit-allowed" EXIT
  mkdir -p .claude
  touch .claude/.commit-allowed
  git -C "$WT" commit -m "<subject>" -m "<body if any>" -m "Co-Authored-By: Claude <noreply@anthropic.com>"
'
```

Notes:

- The token lives at the project-root `.claude/.commit-allowed` — that's where the hook reads from. The git commit itself runs inside `$WT`, but the gate check happens at the hook's CWD (the primary worktree).
- The hook self-deletes `.claude/.commit-allowed` the moment it reads the file, making the token one-shot at the hook layer as well. The `trap` is defence-in-depth.
- Never `touch .claude/.commit-allowed` outside this atomic block — leaving the file on disk between turns would let a subsequent raw `git commit` slip past the gate.
- The commit lands on the current **session branch** — still local, never pushed. Step 6 handles the merge into `dev` and the push.

### 6. Merge into `dev` and push

All git operations target the **primary worktree** — the one whose branch is `dev`. Resolve its path:

```bash
PRIMARY="$(git worktree list --porcelain | awk '
  /^worktree / { p=$2 }
  /^branch refs\/heads\/dev$/ { print p; exit }
')"
```

If `PRIMARY` is empty, the project is missing the `dev` branch locally. **STOP**. Plain English: *"This project doesn't have a `dev` branch (the integration branch). That's a setup problem, not something you caused — let me know and we'll fix it."*

Run this loop, up to 3 attempts:

```bash
git -C "$PRIMARY" fetch origin dev
git -C "$PRIMARY" checkout dev
git -C "$PRIMARY" reset --hard origin/dev      # local dev == remote dev

# Replay the workspace's commits on top of the fresh dev.
if ! git -C "$WT" rebase origin/dev; then
  git -C "$WT" rebase --abort
  # STOP — see "Rebase conflict" below.
fi

git -C "$PRIMARY" merge --no-ff "$SLICE_BR" -m "ship: $SLICE_BR"

if ! git -C "$PRIMARY" push origin dev; then
  continue   # someone landed between our fetch and push — retry
fi

break        # success
```

`--no-ff` is deliberate: every ship is one merge commit on `dev`, so a future `/undo` can revert it cleanly with `git revert -m 1 HEAD` even when the workspace has several commits.

Failure modes:

- **Rebase conflict** — *"Your change overlaps with something else that landed on `dev` while you were working — I need your help merging the two together (this is called resolving a conflict). Files affected: [list from `git -C "$WT" diff --name-only --diff-filter=U`]."* The abort already ran, so the workspace is back to its pre-rebase state. **STOP**.
- **Push rejected after 3 retries** — *"Something keeps landing on `dev` faster than I can push (this is called a push rejection). Try `/ship` again in a moment."* **STOP**.
- **Any other git failure** — translate to plain English, surface the underlying error to stderr for debugging, and **STOP**.

### 7. (No workspace cleanup)

Do **not** run `cleanup-merged-worktrees.sh`. The branch just merged into `dev` is the **live session worktree** the analyst is still working in — sweeping it would delete the active workspace. There is no disposable build worktree to clean up. Proceed to the report.

### 8. Report success

One short, plain-English sentence:

> *"Shipped — `<app name>` is now on `dev` (the integration branch) and pushed. The full audit trail is in `artifacts/docs/dev/decisions.md`."*

Derive the app name from `$WT/artifacts/docs/dev/plan.md`'s title (the first `# <App Name>` heading), falling back to the slugified branch name if that's not available.

## Prerequisites

- Project has a `dev` branch locally and on `origin`. The CLI scaffold creates this; missing `dev` is a setup bug.
- `/plan` and `/build` have run. `/ship` runs the safety checks automatically before committing.
- `git` is authenticated against `origin` (push access to `dev`).

## Important

- Step 4 is the **review gate**. Step 5 commits. Step 6 merges and pushes. Do not reorder.
- This skill never opens a pull request. Pull requests are not part of the workflow for projects generated by this CLI — `dev` is the integration branch and ships land directly on it.
- No `gh` dependency. The push is a plain `git push origin dev`.
- Never force-push `dev`. The retry loop in step 6 only handles fast-forwardable pushes.
- Speak in plain English alongside git terms per [rules/dev/git-workflow.md](../../rules/dev/git-workflow.md). Never surface a bare git error message to the user.
