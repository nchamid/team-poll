-- =============================================
-- Author:      Team Poll build
-- Create Date: 2026-06-26
-- Description: Creates dbo.Users — the infrastructure table upserted by
--              EnsureUserMiddleware on first authenticated request. Keyed on
--              the Entra oid (pseudonymous). Not in the poll request path;
--              OwnerDisplayName is cached on dbo.Polls so list/detail need no
--              join here. Idempotent: re-running is a no-op.
-- =============================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = N'Users' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.Users
    (
        Id          INT IDENTITY(1,1) NOT NULL,
        Oid         UNIQUEIDENTIFIER  NOT NULL,
        DisplayName NVARCHAR(256)     NOT NULL,
        Email       NVARCHAR(256)     NOT NULL,
        -- audit (mandatory 6)
        CreatedAt   DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt   DATETIME2 NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT SYSUTCDATETIME(),
        CreatedBy   NVARCHAR(256) NOT NULL,
        UpdatedBy   NVARCHAR(256) NOT NULL,
        IsDeleted   BIT NOT NULL CONSTRAINT DF_Users_IsDeleted DEFAULT 0,
        DeletedAt   DATETIME2 NULL,
        CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (Id)
    );
END;
GO

-- Unique lookup key on the Entra oid (EnsureUserMiddleware upserts by oid).
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Users_Oid' AND object_id = OBJECT_ID(N'dbo.Users'))
BEGIN
    CREATE UNIQUE INDEX UX_Users_Oid ON dbo.Users (Oid);
END;
GO
