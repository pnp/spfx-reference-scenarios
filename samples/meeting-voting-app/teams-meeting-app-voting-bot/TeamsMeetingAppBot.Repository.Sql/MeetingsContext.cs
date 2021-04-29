using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TeamsMeetingAppBot.Repository.Model;

namespace TeamsMeetingAppBot.Repository.Sql
{
    /// <summary>
    /// Entity Framework Core 5 context object for storing meetings
    /// </summary>
    public class MeetingsContext : DbContext
    {
        public DbSet<Meeting> Meetings { get; set; }

        public DbSet<MeetingParticipant> MeetingParticipants { get; set; }

        public MeetingsContext(DbContextOptions<MeetingsContext> options) : base(options) { }

        //public MeetingsContext() { }

        //protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        //{
        //    optionsBuilder.UseSqlServer("Server=.\\SQLExpress;Database=Meetings;Trusted_Connection=True;MultipleActiveResultSets=true");
        //}

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Define the primary keys for entities
            modelBuilder.Entity<Meeting>().HasKey(tm => tm.MeetingId);
            modelBuilder.Entity<MeetingParticipant>().HasKey(p => p.ParticipantId);
            modelBuilder.Entity<MeetingParticipant>().Property(p => p.ParticipantId).HasDefaultValueSql("newid()");

            // Configure concurrency checks
            modelBuilder.Entity<Meeting>().Property(tm => tm.Timestamp).IsRowVersion();
            modelBuilder.Entity<MeetingParticipant>().Property(p => p.Timestamp).IsRowVersion();

            // Configure relationships
            modelBuilder.Entity<Meeting>()
                .HasMany(tm => tm.Participants)
                .WithOne(p => p.Meeting)
                .IsRequired();
        }
    }
}
