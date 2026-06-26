-- =============================================
-- Author:      Team Poll build
-- Create Date: 2026-06-26
-- Description: Creates dbo.Votes. Enforces one vote per user per poll at the
--              database via the filtered UNIQUE index
--              UX_Votes_PollId_VoterOid (WHERE IsDeleted = 0) per ADR-007 —
--              concurrency-safe and soft-delete compatible. A vote CHANGE
--              updates the existing row's PollOptionId (no second row). FKs to
--              dbo.Polls and dbo.PollOptions with no cascade. Idempotent.
-- =============================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = N'Votes' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.Votes
    (
        Id           INT IDENTITY(1,1) NOT NULL,
        PollId       INT               NOT NULL,
        PollOptionId INT               NOT NULL,
        VoterOid     UNIQUEIDENTIFIER  NOT NULL,
        -- audit (mandatory 6)
        CreatedAt   DATETIME2 NOT NULL CONSTRAINT DF_Votes_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt   DATETIME2 NOT NULL CONSTRAINT DF_Votes_UpdatedAt DEFAULT SYSUTCDATETIME(),
        CreatedBy   NVARCHAR(256) NOT NULL,
        UpdatedBy   NVARCHAR(256) NOT NULL,
        IsDeleted   BIT NOT NULL CONSTRAINT DF_Votes_IsDeleted DEFAULT 0,
        DeletedAt   DATETIME2 NULL,
        CONSTRAINT PK_Votes PRIMARY KEY CLUSTERED (Id),
        CONSTRAINT FK_Votes_Polls FOREIGN KEY (PollId)
            REFERENCES dbo.Polls (Id)
            ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT FK_Votes_PollOptions FOREIGN KEY (PollOptionId)
            REFERENCES dbo.PollOptions (Id)
            ON DELETE NO ACTION ON UPDATE NO ACTION
    );
END;
GO

-- FK index on PollId (required for every FK).
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Votes_PollId' AND object_id = OBJECT_ID(N'dbo.Votes'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Votes_PollId ON dbo.Votes (PollId);
END;
GO

-- FK index on PollOptionId (required for every FK).
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Votes_PollOptionId' AND object_id = OBJECT_ID(N'dbo.Votes'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Votes_PollOptionId ON dbo.Votes (PollOptionId);
END;
GO

-- One-vote-per-user-per-poll, enforced at the database (ADR-007).
-- Filtered on IsDeleted = 0 so the constraint stays compatible with soft-delete.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Votes_PollId_VoterOid' AND object_id = OBJECT_ID(N'dbo.Votes'))
BEGIN
    CREATE UNIQUE INDEX UX_Votes_PollId_VoterOid ON dbo.Votes(PollId, VoterOid) WHERE IsDeleted = 0;
END;
GO
