-- =============================================
-- Author:      Team Poll build
-- Create Date: 2026-06-26
-- Description: Rollback for 20260626_002_CreatePolls — drops dbo.Polls (its
--              indexes and the CK_Polls_Question constraint go with the table).
--              Idempotent: re-running is a no-op.
-- =============================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = N'Polls' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    DROP TABLE dbo.Polls;
END;
GO
