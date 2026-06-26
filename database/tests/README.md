# Database tests (tSQLt)

These are [tSQLt](https://tsqlt.org/) unit tests for the Team Poll stored
procedures. They run against **SQL Server with the tSQLt framework installed**
(in CI, and on any developer/test database where tSQLt has been deployed). They
do **not** run on macOS LocalDB-less setups and are not expected to run on a
developer machine without SQL Server.

## What's covered

| Test file                            | Procedure under test            | Scenarios |
|--------------------------------------|---------------------------------|-----------|
| `usp_GetPolls.tests.sql`             | `dbo.usp_GetPolls`              | open-first ordering, OptionCount/TotalVotes (non-deleted only), soft-deleted polls excluded, pagination slice + TotalCount |
| `usp_GetPollOptionResults.tests.sql` | `dbo.usp_GetPollOptionResults` | per-option vote counts (non-deleted only), soft-deleted votes & options excluded, DisplayOrder ordering, poll-scoped filter |

Every test follows Arrange / Act / Assert, fakes its tables with
`tSQLt.FakeTable` (so no real data is touched), and asserts with
`tSQLt.AssertEqualsTable`.

## Prerequisites

1. A SQL Server instance (LocalDB / Testcontainers / Azure SQL test DB).
2. The schema applied — run the migrations in `../migrations/` (001 → 004) in
   order, then the procedures in `../procedures/`. See `../README.md`.
3. tSQLt installed in the target database (`tSQLt.class.sql` from the tSQLt
   distribution, plus the CLR-enabling step it documents).

## Running

Apply the test classes (each file drops and re-creates its class, so they are
safe to re-run):

```sql
:r database/tests/usp_GetPolls.tests.sql
:r database/tests/usp_GetPollOptionResults.tests.sql
```

Then run the whole suite:

```sql
EXEC tSQLt.RunAll;
```

Or a single class:

```sql
EXEC tSQLt.Run '[usp_GetPolls Tests]';
EXEC tSQLt.Run '[usp_GetPollOptionResults Tests]';
```

`tSQLt.RunAll` is the command the CI database-test stage invokes
(`.claude/rules/dev/ci-pipeline.md` → "Unit tests (database) — `tSQLt.RunAll`").
