# Team Poll — Database layer

SQL Server / Azure SQL schema for the Team Poll Tier 1 app. Four tables, two
read stored procedures, and tSQLt unit tests. EF Core owns single-table writes
(create poll, cast/change vote, close, soft-delete) per `api-data-access.md`;
the two procedures here back the aggregate read paths (list + per-option
results).

## Layout

```
database/
├── migrations/   # Forward DDL (NNN order) + matching _Rollback.sql each
├── procedures/   # CREATE OR ALTER read procedures (re-runnable)
├── tests/        # tSQLt unit tests (see tests/README.md)
└── README.md     # this file
```

## Apply order

Apply **migrations first (001 → 004, in number order), then the procedures.**
Procedures reference the tables, so the tables must exist first.

### 1. Migrations (`migrations/`, in order)

| # | File | Creates |
|---|------|---------|
| 001 | `20260626_001_CreateUsers.sql`       | `dbo.Users` (Entra-oid lookup, upserted by `EnsureUserMiddleware`) |
| 002 | `20260626_002_CreatePolls.sql`       | `dbo.Polls` (ownership via `CreatedBy` oid; `OwnerDisplayName` cached — ADR-006; `Question` NVARCHAR(280) — ADR-010) |
| 003 | `20260626_003_CreatePollOptions.sql` | `dbo.PollOptions` (2–6 choices/poll, FK → Polls) |
| 004 | `20260626_004_CreateVotes.sql`       | `dbo.Votes` + `UX_Votes_PollId_VoterOid` filtered UNIQUE index — one vote per user per poll (ADR-007) |

Each migration is **idempotent** (`IF NOT EXISTS` guards) and ships a matching
`*_Rollback.sql` that drops the object idempotently. To undo, run the rollbacks
in **reverse** number order (004 → 001) so FK dependencies unwind cleanly.

### 2. Procedures (`procedures/`)

| File | Procedure | Backs |
|------|-----------|-------|
| `usp_GetPolls.sql`             | `dbo.usp_GetPolls`             | `GET /api/polls` — paginated, open-first list with per-poll counts |
| `usp_GetPollOptionResults.sql` | `dbo.usp_GetPollOptionResults` | per-option results on `GET /api/polls/{id}` and the `PUT .../vote` response |

Both use `CREATE OR ALTER`, so they are safe to re-apply on every deploy
(re-applied unconditionally per `database-migrations.md`).

## Deployment policy

- **Production: migrations are applied manually** by developers, dev → staging →
  prod, reviewed before each step. Migrations are **not** run on app startup and
  **not** run in CI/CD for production (`database-migrations.md`,
  `api-data-access.md`).
- **Test tenant only:** a Container App Job applies migrations then procedures
  automatically on deploy — a deliberate override for the test environment that
  does not change the production rule.

## Conventions (enforced)

- Every table: `INT IDENTITY` clustered PK + the six mandatory audit columns
  (`CreatedAt`, `UpdatedAt`, `CreatedBy`, `UpdatedBy`, `IsDeleted`, `DeletedAt`).
- **Soft-delete is the default.** Every read filters `IsDeleted = 0`; the vote
  uniqueness index is filtered on `IsDeleted = 0` so it stays compatible.
- FKs are explicit `ON DELETE NO ACTION ON UPDATE NO ACTION` (we soft-delete; no
  cascades). Every FK has a non-clustered index.
- All objects are `dbo.`-qualified. PascalCase tables/columns; `usp_` procs;
  `IX_`/`UX_`/`PK_`/`FK_`/`DF_`/`CK_` prefixes per `database-coding-standards.md`.

## Procedure result-set shapes (for the API binding)

**`dbo.usp_GetPolls` (`@Page INT, @PageSize INT, @CallerOid UNIQUEIDENTIFIER`)** —
one row per non-deleted poll, ordered `IsClosed ASC, CreatedAt DESC`, paged via
`OFFSET/FETCH`:

| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT | poll id |
| `Question` | NVARCHAR(280) | |
| `IsClosed` | BIT | |
| `OwnerDisplayName` | NVARCHAR(256) | cached owner name |
| `OwnerOid` | UNIQUEIDENTIFIER | `CreatedBy` cast to GUID — API derives isOwner/canManage |
| `OptionCount` | INT | non-deleted options for the poll |
| `TotalVotes` | INT | non-deleted votes for the poll |
| `TotalCount` | INT | `COUNT(*) OVER()` of all non-deleted polls — for paging |

`@CallerOid` is part of the contract but does not filter rows (every Member sees
every poll); isOwner/canManage are computed in the API from `OwnerOid` + role.

**`dbo.usp_GetPollOptionResults` (`@PollId INT`)** — one row per non-deleted
option of the poll, ordered by `DisplayOrder ASC`:

| Column | Type | Notes |
|--------|------|-------|
| `OptionId` | INT | option id (`PollOptions.Id`) |
| `Text` | NVARCHAR(80) | |
| `DisplayOrder` | INT | |
| `VoteCount` | INT | non-deleted votes for that option |

Results-visibility gating (ADR-009) and percentage computation are the API's
responsibility — the proc returns the raw per-option counts only.

## Tests

tSQLt unit tests live in `tests/` and run under SQL Server with tSQLt installed
(CI). See `tests/README.md`. Run the suite with `EXEC tSQLt.RunAll;`.
