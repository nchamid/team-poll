-- =============================================
-- Author:      Team Poll build
-- Create Date: 2026-06-26
-- Description: tSQLt tests for dbo.usp_GetPolls. Covers open-first ordering,
--              OptionCount / TotalVotes correctness (non-deleted only),
--              soft-deleted poll exclusion, and pagination (correct slice +
--              TotalCount across all non-deleted polls).
--              Run all DB tests with: EXEC tSQLt.RunAll;
-- =============================================

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

IF EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'usp_GetPolls Tests')
    EXEC tSQLt.DropClass @ClassName = N'usp_GetPolls Tests';
GO

EXEC tSQLt.NewTestClass @ClassName = N'usp_GetPolls Tests';
GO

-- -----------------------------------------------------------------------------
-- Ordering: open polls (IsClosed = 0) come before closed (IsClosed = 1),
-- and within each group the newest CreatedAt comes first.
-- A capture table with an IDENTITY column records the emitted row order, so
-- ROW_NUMBER reflects the order the proc returned rows in.
-- -----------------------------------------------------------------------------
CREATE PROCEDURE [usp_GetPolls Tests].[test_OpenPollsOrderedBeforeClosedThenNewestFirst]
AS
BEGIN
    -- Arrange
    EXEC tSQLt.FakeTable @TableName = N'dbo.Polls';
    EXEC tSQLt.FakeTable @TableName = N'dbo.PollOptions';
    EXEC tSQLt.FakeTable @TableName = N'dbo.Votes';

    INSERT INTO dbo.Polls (Id, Question, IsClosed, OwnerDisplayName, CreatedAt, CreatedBy, UpdatedBy, IsDeleted)
    VALUES
        (1, N'Closed older', 1, N'Owner A', '2026-06-01T00:00:00', N'11111111-1111-1111-1111-111111111111', N'11111111-1111-1111-1111-111111111111', 0),
        (2, N'Closed newer', 1, N'Owner A', '2026-06-02T00:00:00', N'11111111-1111-1111-1111-111111111111', N'11111111-1111-1111-1111-111111111111', 0),
        (3, N'Open older',   0, N'Owner A', '2026-06-03T00:00:00', N'11111111-1111-1111-1111-111111111111', N'11111111-1111-1111-1111-111111111111', 0),
        (4, N'Open newer',   0, N'Owner A', '2026-06-04T00:00:00', N'11111111-1111-1111-1111-111111111111', N'11111111-1111-1111-1111-111111111111', 0);

    CREATE TABLE #captured
    (
        RowNum           INT IDENTITY(1,1) NOT NULL,
        Id               INT NOT NULL,
        Question         NVARCHAR(280) NOT NULL,
        IsClosed         BIT NOT NULL,
        OwnerDisplayName NVARCHAR(256) NOT NULL,
        OwnerOid         UNIQUEIDENTIFIER NOT NULL,
        OptionCount      INT NOT NULL,
        TotalVotes       INT NOT NULL,
        TotalCount       INT NOT NULL
    );

    -- Act
    INSERT INTO #captured (Id, Question, IsClosed, OwnerDisplayName, OwnerOid, OptionCount, TotalVotes, TotalCount)
    EXEC dbo.usp_GetPolls @Page = 1, @PageSize = 50, @CallerOid = '99999999-9999-9999-9999-999999999999';

    SELECT RowNum, Id
    INTO #actual
    FROM #captured;

    -- Assert: open newer (4), open older (3), closed newer (2), closed older (1).
    SELECT RowNum, Id
    INTO #expected
    FROM (VALUES (1, 4), (2, 3), (3, 2), (4, 1)) AS expected(RowNum, Id);

    EXEC tSQLt.AssertEqualsTable @Expected = N'#expected', @Actual = N'#actual';
END;
GO

-- -----------------------------------------------------------------------------
-- OptionCount and TotalVotes reflect only non-deleted child rows for the poll.
-- -----------------------------------------------------------------------------
CREATE PROCEDURE [usp_GetPolls Tests].[test_OptionCountAndTotalVotesExcludeSoftDeletedChildren]
AS
BEGIN
    -- Arrange
    EXEC tSQLt.FakeTable @TableName = N'dbo.Polls';
    EXEC tSQLt.FakeTable @TableName = N'dbo.PollOptions';
    EXEC tSQLt.FakeTable @TableName = N'dbo.Votes';

    INSERT INTO dbo.Polls (Id, Question, IsClosed, OwnerDisplayName, CreatedAt, CreatedBy, UpdatedBy, IsDeleted)
    VALUES (1, N'Favourite colour?', 0, N'Owner A', '2026-06-01T00:00:00', N'11111111-1111-1111-1111-111111111111', N'11111111-1111-1111-1111-111111111111', 0);

    -- 3 options live, 1 soft-deleted -> OptionCount = 3.
    INSERT INTO dbo.PollOptions (Id, PollId, Text, DisplayOrder, CreatedBy, UpdatedBy, IsDeleted)
    VALUES
        (10, 1, N'Red',   1, N'sys', N'sys', 0),
        (11, 1, N'Green', 2, N'sys', N'sys', 0),
        (12, 1, N'Blue',  3, N'sys', N'sys', 0),
        (13, 1, N'Pink',  4, N'sys', N'sys', 1);

    -- 2 live votes, 1 soft-deleted -> TotalVotes = 2.
    INSERT INTO dbo.Votes (Id, PollId, PollOptionId, VoterOid, CreatedBy, UpdatedBy, IsDeleted)
    VALUES
        (100, 1, 10, '21111111-1111-1111-1111-111111111111', N'sys', N'sys', 0),
        (101, 1, 11, '22222222-2222-2222-2222-222222222222', N'sys', N'sys', 0),
        (102, 1, 12, '23333333-3333-3333-3333-333333333333', N'sys', N'sys', 1);

    CREATE TABLE #captured
    (
        Id               INT NOT NULL,
        Question         NVARCHAR(280) NOT NULL,
        IsClosed         BIT NOT NULL,
        OwnerDisplayName NVARCHAR(256) NOT NULL,
        OwnerOid         UNIQUEIDENTIFIER NOT NULL,
        OptionCount      INT NOT NULL,
        TotalVotes       INT NOT NULL,
        TotalCount       INT NOT NULL
    );

    -- Act
    INSERT INTO #captured (Id, Question, IsClosed, OwnerDisplayName, OwnerOid, OptionCount, TotalVotes, TotalCount)
    EXEC dbo.usp_GetPolls @Page = 1, @PageSize = 50, @CallerOid = '99999999-9999-9999-9999-999999999999';

    SELECT Id, OptionCount, TotalVotes
    INTO #actual
    FROM #captured;

    -- Assert
    SELECT Id, OptionCount, TotalVotes
    INTO #expected
    FROM (VALUES (1, 3, 2)) AS expected(Id, OptionCount, TotalVotes);

    EXEC tSQLt.AssertEqualsTable @Expected = N'#expected', @Actual = N'#actual';
END;
GO

-- -----------------------------------------------------------------------------
-- Soft-deleted polls never appear in the result.
-- -----------------------------------------------------------------------------
CREATE PROCEDURE [usp_GetPolls Tests].[test_SoftDeletedPollsAreExcluded]
AS
BEGIN
    -- Arrange
    EXEC tSQLt.FakeTable @TableName = N'dbo.Polls';
    EXEC tSQLt.FakeTable @TableName = N'dbo.PollOptions';
    EXEC tSQLt.FakeTable @TableName = N'dbo.Votes';

    INSERT INTO dbo.Polls (Id, Question, IsClosed, OwnerDisplayName, CreatedAt, CreatedBy, UpdatedBy, IsDeleted)
    VALUES
        (1, N'Live poll',    0, N'Owner A', '2026-06-02T00:00:00', N'11111111-1111-1111-1111-111111111111', N'11111111-1111-1111-1111-111111111111', 0),
        (2, N'Deleted poll', 0, N'Owner A', '2026-06-01T00:00:00', N'11111111-1111-1111-1111-111111111111', N'11111111-1111-1111-1111-111111111111', 1);

    CREATE TABLE #captured
    (
        Id               INT NOT NULL,
        Question         NVARCHAR(280) NOT NULL,
        IsClosed         BIT NOT NULL,
        OwnerDisplayName NVARCHAR(256) NOT NULL,
        OwnerOid         UNIQUEIDENTIFIER NOT NULL,
        OptionCount      INT NOT NULL,
        TotalVotes       INT NOT NULL,
        TotalCount       INT NOT NULL
    );

    -- Act
    INSERT INTO #captured (Id, Question, IsClosed, OwnerDisplayName, OwnerOid, OptionCount, TotalVotes, TotalCount)
    EXEC dbo.usp_GetPolls @Page = 1, @PageSize = 50, @CallerOid = '99999999-9999-9999-9999-999999999999';

    SELECT Id
    INTO #actual
    FROM #captured;

    -- Assert: only the live poll is returned.
    SELECT Id
    INTO #expected
    FROM (VALUES (1)) AS expected(Id);

    EXEC tSQLt.AssertEqualsTable @Expected = N'#expected', @Actual = N'#actual';
END;
GO

-- -----------------------------------------------------------------------------
-- Pagination: page 2 with size 2 returns the correct slice, and TotalCount
-- reflects all non-deleted polls (5), not just the page.
-- -----------------------------------------------------------------------------
CREATE PROCEDURE [usp_GetPolls Tests].[test_PaginationReturnsCorrectSliceAndTotalCount]
AS
BEGIN
    -- Arrange: 5 open polls, distinct CreatedAt so order is deterministic.
    EXEC tSQLt.FakeTable @TableName = N'dbo.Polls';
    EXEC tSQLt.FakeTable @TableName = N'dbo.PollOptions';
    EXEC tSQLt.FakeTable @TableName = N'dbo.Votes';

    INSERT INTO dbo.Polls (Id, Question, IsClosed, OwnerDisplayName, CreatedAt, CreatedBy, UpdatedBy, IsDeleted)
    VALUES
        (1, N'P1', 0, N'Owner A', '2026-06-01T00:00:00', N'11111111-1111-1111-1111-111111111111', N'11111111-1111-1111-1111-111111111111', 0),
        (2, N'P2', 0, N'Owner A', '2026-06-02T00:00:00', N'11111111-1111-1111-1111-111111111111', N'11111111-1111-1111-1111-111111111111', 0),
        (3, N'P3', 0, N'Owner A', '2026-06-03T00:00:00', N'11111111-1111-1111-1111-111111111111', N'11111111-1111-1111-1111-111111111111', 0),
        (4, N'P4', 0, N'Owner A', '2026-06-04T00:00:00', N'11111111-1111-1111-1111-111111111111', N'11111111-1111-1111-1111-111111111111', 0),
        (5, N'P5', 0, N'Owner A', '2026-06-05T00:00:00', N'11111111-1111-1111-1111-111111111111', N'11111111-1111-1111-1111-111111111111', 0);

    CREATE TABLE #captured
    (
        Id               INT NOT NULL,
        Question         NVARCHAR(280) NOT NULL,
        IsClosed         BIT NOT NULL,
        OwnerDisplayName NVARCHAR(256) NOT NULL,
        OwnerOid         UNIQUEIDENTIFIER NOT NULL,
        OptionCount      INT NOT NULL,
        TotalVotes       INT NOT NULL,
        TotalCount       INT NOT NULL
    );

    -- Act: newest-first ordering -> page 1 = {5,4}, page 2 = {3,2}, page 3 = {1}.
    INSERT INTO #captured (Id, Question, IsClosed, OwnerDisplayName, OwnerOid, OptionCount, TotalVotes, TotalCount)
    EXEC dbo.usp_GetPolls @Page = 2, @PageSize = 2, @CallerOid = '99999999-9999-9999-9999-999999999999';

    SELECT Id, TotalCount
    INTO #actual
    FROM #captured;

    -- Assert: page 2 returns polls 3 and 2; TotalCount is 5 on every row.
    SELECT Id, TotalCount
    INTO #expected
    FROM (VALUES (3, 5), (2, 5)) AS expected(Id, TotalCount);

    EXEC tSQLt.AssertEqualsTable @Expected = N'#expected', @Actual = N'#actual';
END;
GO
