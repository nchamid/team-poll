-- =============================================
-- Author:      Team Poll build
-- Create Date: 2026-06-26
-- Description: Creates dbo.PollOptions — the 2-6 choices per poll. Count
--              (2-6) and text length (1-80) are enforced at the API boundary;
--              the column length caps text at 80. FK to dbo.Polls with no
--              cascade (soft-delete only). Idempotent.
-- =============================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = N'PollOptions' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.PollOptions
    (
        Id           INT IDENTITY(1,1) NOT NULL,
        PollId       INT               NOT NULL,
        Text         NVARCHAR(80)      NOT NULL,
        DisplayOrder INT               NOT NULL,
        -- audit (mandatory 6)
        CreatedAt   DATETIME2 NOT NULL CONSTRAINT DF_PollOptions_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt   DATETIME2 NOT NULL CONSTRAINT DF_PollOptions_UpdatedAt DEFAULT SYSUTCDATETIME(),
        CreatedBy   NVARCHAR(256) NOT NULL,
        UpdatedBy   NVARCHAR(256) NOT NULL,
        IsDeleted   BIT NOT NULL CONSTRAINT DF_PollOptions_IsDeleted DEFAULT 0,
        DeletedAt   DATETIME2 NULL,
        CONSTRAINT PK_PollOptions PRIMARY KEY CLUSTERED (Id),
        CONSTRAINT FK_PollOptions_Polls FOREIGN KEY (PollId)
            REFERENCES dbo.Polls (Id)
            ON DELETE NO ACTION ON UPDATE NO ACTION
    );
END;
GO

-- FK index (required for every FK).
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_PollOptions_PollId' AND object_id = OBJECT_ID(N'dbo.PollOptions'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_PollOptions_PollId ON dbo.PollOptions (PollId);
END;
GO
