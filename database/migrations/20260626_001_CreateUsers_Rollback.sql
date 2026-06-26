-- =============================================
-- Author:      Team Poll build
-- Create Date: 2026-06-26
-- Description: Rollback for 20260626_001_CreateUsers — drops dbo.Users (and its
--              UX_Users_Oid index, removed implicitly with the table).
--              Idempotent: re-running is a no-op.
-- =============================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = N'Users' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    DROP TABLE dbo.Users;
END;
GO
