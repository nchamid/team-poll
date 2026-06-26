using Microsoft.EntityFrameworkCore;
using TeamPoll.Domain;

namespace TeamPoll.Data;

/// <summary>
/// EF Core context for Team Poll. The DB is the source of truth for schema
/// (created by the database/ migrations); this context maps onto it. A global
/// soft-delete query filter excludes IsDeleted rows from every query.
/// </summary>
public class TeamPollDbContext(DbContextOptions<TeamPollDbContext> options) : DbContext(options)
{
    public DbSet<Poll> Polls => Set<Poll>();
    public DbSet<PollOption> PollOptions => Set<PollOption>();
    public DbSet<Vote> Votes => Set<Vote>();
    public DbSet<User> Users => Set<User>();

    // Keyless result types for the two aggregating stored procs (api-data-access.md).
    public DbSet<PollListRow> PollListRows => Set<PollListRow>();
    public DbSet<PollOptionResultRow> PollOptionResultRows => Set<PollOptionResultRow>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Poll>(entity =>
        {
            entity.ToTable("Polls");
            entity.HasKey(poll => poll.Id);
            entity.Property(poll => poll.Question).HasMaxLength(280).IsRequired();
            entity.Property(poll => poll.OwnerDisplayName).HasMaxLength(256).IsRequired();
            entity.Property(poll => poll.CreatedBy).HasMaxLength(256).IsRequired();
            entity.Property(poll => poll.UpdatedBy).HasMaxLength(256).IsRequired();
            entity.HasIndex(poll => poll.CreatedBy).HasDatabaseName("IX_Polls_CreatedBy");
            entity.HasIndex(poll => poll.IsClosed).HasDatabaseName("IX_Polls_IsClosed");
            entity.HasQueryFilter(poll => !poll.IsDeleted);
        });

        modelBuilder.Entity<PollOption>(entity =>
        {
            entity.ToTable("PollOptions");
            entity.HasKey(option => option.Id);
            entity.Property(option => option.Text).HasMaxLength(80).IsRequired();
            entity.Property(option => option.CreatedBy).HasMaxLength(256).IsRequired();
            entity.Property(option => option.UpdatedBy).HasMaxLength(256).IsRequired();
            entity.HasOne(option => option.Poll)
                  .WithMany(poll => poll.Options)
                  .HasForeignKey(option => option.PollId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(option => option.PollId).HasDatabaseName("IX_PollOptions_PollId");
            entity.HasQueryFilter(option => !option.IsDeleted);
        });

        modelBuilder.Entity<Vote>(entity =>
        {
            entity.ToTable("Votes");
            entity.HasKey(vote => vote.Id);
            entity.Property(vote => vote.CreatedBy).HasMaxLength(256).IsRequired();
            entity.Property(vote => vote.UpdatedBy).HasMaxLength(256).IsRequired();
            entity.HasOne(vote => vote.Poll)
                  .WithMany(poll => poll.Votes)
                  .HasForeignKey(vote => vote.PollId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(vote => vote.PollOption)
                  .WithMany(option => option.Votes)
                  .HasForeignKey(vote => vote.PollOptionId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(vote => vote.PollId).HasDatabaseName("IX_Votes_PollId");
            entity.HasIndex(vote => vote.PollOptionId).HasDatabaseName("IX_Votes_PollOptionId");

            // One vote per user per poll. The DB owns this index (UX_Votes_PollId_VoterOid,
            // ADR-007). Declaring it here keeps the model honest and lets a model-created
            // schema (if ever used) carry the same constraint. Filter matches soft-delete.
            entity.HasIndex(vote => new { vote.PollId, vote.VoterOid })
                  .IsUnique()
                  .HasFilter("[IsDeleted] = 0")
                  .HasDatabaseName("UX_Votes_PollId_VoterOid");

            entity.HasQueryFilter(vote => !vote.IsDeleted);
        });

        // Keyless types are never tables — they only carry stored-proc result rows.
        modelBuilder.Entity<PollListRow>().HasNoKey().ToView(null);
        modelBuilder.Entity<PollOptionResultRow>().HasNoKey().ToView(null);

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(user => user.Id);
            entity.Property(user => user.DisplayName).HasMaxLength(256).IsRequired();
            entity.Property(user => user.Email).HasMaxLength(256).IsRequired();
            entity.Property(user => user.CreatedBy).HasMaxLength(256).IsRequired();
            entity.Property(user => user.UpdatedBy).HasMaxLength(256).IsRequired();
            entity.HasIndex(user => user.Oid).IsUnique().HasDatabaseName("UX_Users_Oid");
            entity.HasQueryFilter(user => !user.IsDeleted);
        });
    }
}
