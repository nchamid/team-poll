-- =============================================
-- Author:      Team Poll build
-- Create Date: 2026-06-26
-- Description: Returns one row per non-deleted option of a poll, with the
--              non-deleted vote count per option, ordered by DisplayOrder.
--              Backs the per-option results on GET /api/polls/{id} and the
--              PUT .../vote response. Results-visibility gating (ADR-009) and
--              percentage computation are the API's responsibility; this proc
--              returns the raw per-option counts. @PollId is not validated for
--              existence here — a missing/soft-deleted poll simply yields no
--              rows; the API maps that to 404.
-- =============================================
CREATE OR ALTER PROCEDURE dbo.usp_GetPollOptionResults
    @PollId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- Copy parameter to local (guards against parameter sniffing).
    DECLARE @localPollId INT = @PollId;

    SELECT
        optionRow.Id           AS OptionId,
        optionRow.Text,
        optionRow.DisplayOrder,
        (
            SELECT COUNT(1)
            FROM dbo.Votes AS voteRow
            WHERE voteRow.PollOptionId = optionRow.Id
              AND voteRow.IsDeleted = 0
        ) AS VoteCount
    FROM dbo.PollOptions AS optionRow
    WHERE optionRow.PollId = @localPollId
      AND optionRow.IsDeleted = 0
    ORDER BY optionRow.DisplayOrder ASC;
END;
GO
