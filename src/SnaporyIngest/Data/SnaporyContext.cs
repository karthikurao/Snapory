using Microsoft.EntityFrameworkCore;
using SnaporyIngest.Models;

namespace SnaporyIngest.Data;

public class SnaporyContext : DbContext
{
    public SnaporyContext(DbContextOptions<SnaporyContext> options) : base(options)
    {
    }

    public DbSet<Event> Events { get; set; }
    public DbSet<Photo> Photos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.EventId);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.UploadToken).IsRequired();
        });

        modelBuilder.Entity<Photo>(entity =>
        {
            entity.HasKey(p => p.PhotoId);
            entity.Property(p => p.EventId).IsRequired();
            entity.Property(p => p.FileName).IsRequired().HasMaxLength(500);
            entity.Property(p => p.S3Key).IsRequired().HasMaxLength(500);
            entity.Property(p => p.ContentType).IsRequired().HasMaxLength(100);
            
            entity.HasOne(p => p.Event)
                .WithMany(e => e.Photos)
                .HasForeignKey(p => p.EventId);
        });
    }
}
