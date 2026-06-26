-- =============================================
-- Author:      Team Poll build
-- Create Date: 2026-06-26
-- Description: Returns one row per non-deleted poll for the paginated list
--              (GET /api/polls). Ordered open-first (IsClosed ASC) then newest
--              first (CreatedAt DESC). Each row carries the option count and
--              total vote count (non-deleted only), plus TotalCount —
--              COUNT(*) OVER() across all non-deleted polls — for paging.
--              OwnerOid is CreatedBy (Entra oid) cast to UNIQUEIDENTIFIER
--              (ADR-006). The API computes isOwner/canManage from OwnerOid +
--              the caller's role; @CallerOid is accepted for that contract and
--              is intentionally not used to filter rows (the list shows all
--              polls to every Member).
-- =============================================
CREATE OR ALTER PROCEDURE dbo.usp_GetPolls
    @Page       INT,
    @PageSize   INT,
    @CallerOid  UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- Copy parameters to locals (guards against parameter sniffing).
    DECLARE @localPage      INT = @Page;
    DECLARE @localPageSize  INT = @PageSize;
    DECLARE @localCallerOid UNIQUEIDENTIFIER = @CallerOid;

    SELECT
        poll.Id,
        poll.Question,
        poll.IsClosed,
        poll.OwnerDisplayName,
        CAST(poll.CreatedBy AS UNIQUEIDENTIFIER) AS OwnerOid,
        (
            SELECT COUNT(1)
            FROM dbo.PollOptions AS optionRow
            WHERE optionRow.PollId = poll.Id
              AND optionRow.IsDeleted = 0
        ) AS OptionCount,
        (
            SELECT COUNT(1)
            FROM dbo.Votes AS voteRow
            WHERE voteRow.PollId = poll.Id
              AND voteRow.IsDeleted = 0
        ) AS TotalVotes,
        COUNT(1) OVER () AS TotalCount
    FROM dbo.Polls AS poll
    WHERE poll.IsDeleted = 0
    ORDER BY poll.IsClosed ASC, poll.CreatedAt DESC
    OFFSET (@localPage - 1) * @localPageSize ROWS
    FETCH NEXT @localPageSize ROWS ONLY;
END;
GO
