-- =============================================
-- Author:      Team Poll build
-- Create Date: 2026-06-26
-- Description: tSQLt tests for dbo.usp_GetPollOptionResults. Covers per-option
--              vote counts (non-deleted only), soft-deleted vote exclusion,
--              soft-deleted option exclusion, and DisplayOrder ordering.
--              Run all DB tests with: EXEC tSQLt.RunAll;
-- =============================================

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

IF EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'usp_GetPollOptionResults Tests')
    EXEC tSQLt.DropClass @ClassName = N'usp_GetPollOptionResults Tests';
GO

EXEC tSQLt.NewTestClass @ClassName = N'usp_GetPollOptionResults Tests';
GO

-- -----------------------------------------------------------------------------
-- Per-option VoteCount counts only non-deleted votes for that option, and
-- soft-deleted options are excluded from the result entirely.
-- -----------------------------------------------------------------------------
CREATE PROCEDURE [usp_GetPollOptionResults Tests].[test_VoteCountsExcludeSoftDeletedVotesAndOptions]
AS
BEGIN
    -- Arrange
    EXEC tSQLt.FakeTable @TableName = N'dbo.PollOptions';
    EXEC tSQLt.FakeTable @TableName = N'dbo.Votes';

    -- Poll 1: 3 live options (10,11,12) + 1 soft-deleted option (13).
    INSERT INTO dbo.PollOptions (Id, PollId, Text, DisplayOrder, CreatedBy, UpdatedBy, IsDeleted)
    VALUES
        (10, 1, N'Red',   1, N'sys', N'sys', 0),
        (11, 1, N'Green', 2, N'sys', N'sys', 0),
        (12, 1, N'Blue',  3, N'sys', N'sys', 0),
        (13, 1, N'Pink',  4, N'sys', N'sys', 1);

    -- Votes: Red = 2 live (+1 soft-deleted, ignored), Green = 1 live, Blue = 0.
    INSERT INTO dbo.Votes (Id, PollId, PollOptionId, VoterOid, CreatedBy, UpdatedBy, IsDeleted)
    VALUES
        (100, 1, 10, '21111111-1111-1111-1111-111111111111', N'sys', N'sys', 0),
        (101, 1, 10, '22222222-2222-2222-2222-222222222222', N'sys', N'sys', 0),
        (102, 1, 10, '23333333-3333-3333-3333-333333333333', N'sys', N'sys', 1),
        (103, 1, 11, '24444444-4444-4444-4444-444444444444', N'sys', N'sys', 0);

    CREATE TABLE #captured
    (
        OptionId     INT NOT NULL,
        Text         NVARCHAR(80) NOT NULL,
        DisplayOrder INT NOT NULL,
        VoteCount    INT NOT NULL
    );

    -- Act
    INSERT INTO #captured (OptionId, Text, DisplayOrder, VoteCount)
    EXEC dbo.usp_GetPollOptionResults @PollId = 1;

    SELECT OptionId, VoteCount
    INTO #actual
    FROM #captured;

    -- Assert: only the 3 live options, with correct live vote counts.
    SELECT OptionId, VoteCount
    INTO #expected
    FROM (VALUES (10, 2), (11, 1), (12, 0)) AS expected(OptionId, VoteCount);

    EXEC tSQLt.AssertEqualsTable @Expected = N'#expected', @Actual = N'#actual';
END;
GO

-- -----------------------------------------------------------------------------
-- Options are returned ordered by DisplayOrder ascending.
-- -----------------------------------------------------------------------------
CREATE PROCEDURE [usp_GetPollOptionResults Tests].[test_OptionsOrderedByDisplayOrder]
AS
BEGIN
    -- Arrange: insert options out of DisplayOrder so ORDER BY is exercised.
    EXEC tSQLt.FakeTable @TableName = N'dbo.PollOptions';
    EXEC tSQLt.FakeTable @TableName = N'dbo.Votes';

    INSERT INTO dbo.PollOptions (Id, PollId, Text, DisplayOrder, CreatedBy, UpdatedBy, IsDeleted)
    VALUES
        (30, 1, N'Third',  3, N'sys', N'sys', 0),
        (10, 1, N'First',  1, N'sys', N'sys', 0),
        (20, 1, N'Second', 2, N'sys', N'sys', 0);

    CREATE TABLE #captured
    (
        RowNum       INT IDENTITY(1,1) NOT NULL,
        OptionId     INT NOT NULL,
        Text         NVARCHAR(80) NOT NULL,
        DisplayOrder INT NOT NULL,
        VoteCount    INT NOT NULL
    );

    -- Act
    INSERT INTO #captured (OptionId, Text, DisplayOrder, VoteCount)
    EXEC dbo.usp_GetPollOptionResults @PollId = 1;

    SELECT RowNum, OptionId
    INTO #actual
    FROM #captured;

    -- Assert: emitted order is DisplayOrder 1, 2, 3 -> options 10, 20, 30.
    SELECT RowNum, OptionId
    INTO #expected
    FROM (VALUES (1, 10), (2, 20), (3, 30)) AS expected(RowNum, OptionId);

    EXEC tSQLt.AssertEqualsTable @Expected = N'#expected', @Actual = N'#actual';
END;
GO

-- -----------------------------------------------------------------------------
-- Only options of the requested poll are returned (other polls' options are
-- excluded by the PollId filter).
-- -----------------------------------------------------------------------------
CREATE PROCEDURE [usp_GetPollOptionResults Tests].[test_OnlyRequestedPollOptionsReturned]
AS
BEGIN
    -- Arrange
    EXEC tSQLt.FakeTable @TableName = N'dbo.PollOptions';
    EXEC tSQLt.FakeTable @TableName = N'dbo.Votes';

    INSERT INTO dbo.PollOptions (Id, PollId, Text, DisplayOrder, CreatedBy, UpdatedBy, IsDeleted)
    VALUES
        (10, 1, N'Poll1 OptA', 1, N'sys', N'sys', 0),
        (11, 1, N'Poll1 OptB', 2, N'sys', N'sys', 0),
        (20, 2, N'Poll2 OptA', 1, N'sys', N'sys', 0);

    CREATE TABLE #captured
    (
        OptionId     INT NOT NULL,
        Text         NVARCHAR(80) NOT NULL,
        DisplayOrder INT NOT NULL,
        VoteCount    INT NOT NULL
    );

    -- Act
    INSERT INTO #captured (OptionId, Text, DisplayOrder, VoteCount)
    EXEC dbo.usp_GetPollOptionResults @PollId = 1;

    SELECT OptionId
    INTO #actual
    FROM #captured;

    -- Assert: only poll 1's options.
    SELECT OptionId
    INTO #expected
    FROM (VALUES (10), (11)) AS expected(OptionId);

    EXEC tSQLt.AssertEqualsTable @Expected = N'#expected', @Actual = N'#actual';
END;
GO
