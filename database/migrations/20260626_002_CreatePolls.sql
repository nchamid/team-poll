-- =============================================
-- Author:      Team Poll build
-- Create Date: 2026-06-26
-- Description: Creates dbo.Polls. Ownership is keyed on the CreatedBy audit
--              column (Entra oid) per ADR-006 — there is no separate OwnerOid
--              column. OwnerDisplayName is denormalized from the JWT `name`
--              claim at creation so list/detail render without a join to
--              dbo.Users. Question max length is 280 per ADR-010 (the
--              prototype's 140 is overridden). Idempotent.
-- =============================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = N'Polls' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.Polls
    (
        Id               INT IDENTITY(1,1) NOT NULL,
        Question         NVARCHAR(280)     NOT NULL,
        IsClosed         BIT               NOT NULL CONSTRAINT DF_Polls_IsClosed DEFAULT 0,
        OwnerDisplayName NVARCHAR(256)     NOT NULL,
        -- CreatedBy holds the owner's Entra oid — the ownership key (ADR-006).
        -- audit (mandatory 6)
        CreatedAt   DATETIME2 NOT NULL CONSTRAINT DF_Polls_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt   DATETIME2 NOT NULL CONSTRAINT DF_Polls_UpdatedAt DEFAULT SYSUTCDATETIME(),
        CreatedBy   NVARCHAR(256) NOT NULL,
        UpdatedBy   NVARCHAR(256) NOT NULL,
        IsDeleted   BIT NOT NULL CONSTRAINT DF_Polls_IsDeleted DEFAULT 0,
        DeletedAt   DATETIME2 NULL,
        CONSTRAINT PK_Polls PRIMARY KEY CLUSTERED (Id),
        CONSTRAINT CK_Polls_Question CHECK (LEN(Question) BETWEEN 1 AND 280)
    );
END;
GO

-- Ownership filter: list/detail and access checks query by CreatedBy (owner oid).
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Polls_CreatedBy' AND object_id = OBJECT_ID(N'dbo.Polls'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Polls_CreatedBy ON dbo.Polls (CreatedBy);
END;
GO

-- Open-first ordering on the list (ORDER BY IsClosed ASC, CreatedAt DESC).
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Polls_IsClosed' AND object_id = OBJECT_ID(N'dbo.Polls'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Polls_IsClosed ON dbo.Polls (IsClosed);
END;
GO
