-- =============================================
-- Author:      Team Poll build
-- Create Date: 2026-06-26
-- Description: Rollback for 20260626_004_CreateVotes — drops dbo.Votes (FKs,
--              FK indexes, and UX_Votes_PollId_VoterOid removed with the
--              table). Idempotent: re-running is a no-op.
-- =============================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = N'Votes' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    DROP TABLE dbo.Votes;
END;
GO
