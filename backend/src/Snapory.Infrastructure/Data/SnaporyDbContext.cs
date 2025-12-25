using Microsoft.EntityFrameworkCore;
using Snapory.Domain.Entities;

namespace Snapory.Infrastructure.Data;

public class SnaporyDbContext : DbContext
{
    public SnaporyDbContext(DbContextOptions<SnaporyDbContext> options) : base(options)
    {
    }

    public DbSet<Event> Events { get; set; } = null!;
    public DbSet<Photo> Photos { get; set; } = null!;
    public DbSet<PhotoFace> PhotoFaces { get; set; } = null!;
    public DbSet<Guest> Guests { get; set; } = null!;
    public DbSet<Photographer> Photographers { get; set; } = null!;
    public DbSet<OtpVerification> OtpVerifications { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Event configuration
        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.UploadToken).IsRequired().HasMaxLength(50);
            entity.Property(e => e.QrCodeData).IsRequired();
            entity.HasIndex(e => e.PhotographerId);
            
            entity.HasMany(e => e.Photos)
                .WithOne(p => p.Event)
                .HasForeignKey(p => p.EventId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasMany(e => e.Guests)
                .WithOne(g => g.Event)
                .HasForeignKey(g => g.EventId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Photo configuration
        modelBuilder.Entity<Photo>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.FileName).IsRequired().HasMaxLength(500);
            entity.Property(p => p.StorageKey).IsRequired().HasMaxLength(500);
            entity.HasIndex(p => p.EventId);
            entity.HasIndex(p => p.Status);
            
            entity.HasMany(p => p.DetectedFaces)
                .WithOne(f => f.Photo)
                .HasForeignKey(f => f.PhotoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // PhotoFace configuration
        modelBuilder.Entity<PhotoFace>(entity =>
        {
            entity.HasKey(f => f.Id);
            entity.Property(f => f.FaceEmbedding).IsRequired();
            entity.HasIndex(f => f.PhotoId);
            entity.HasIndex(f => f.MatchedGuestId);
        });

        // Guest configuration
        modelBuilder.Entity<Guest>(entity =>
        {
            entity.HasKey(g => g.Id);
            entity.Property(g => g.PhoneNumber).IsRequired().HasMaxLength(20);
            entity.Property(g => g.FaceEmbedding).IsRequired();
            entity.HasIndex(g => new { g.EventId, g.PhoneNumber }).IsUnique();
        });

        // Photographer configuration
        modelBuilder.Entity<Photographer>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Email).IsRequired().HasMaxLength(200);
            entity.Property(p => p.PasswordHash).IsRequired();
            entity.HasIndex(p => p.Email).IsUnique();
            
            entity.HasMany(p => p.Events)
                .WithOne()
                .HasForeignKey(e => e.PhotographerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // OtpVerification configuration
        modelBuilder.Entity<OtpVerification>(entity =>
        {
            entity.HasKey(o => o.Id);
            entity.Property(o => o.PhoneNumber).IsRequired().HasMaxLength(20);
            entity.Property(o => o.OtpCode).IsRequired().HasMaxLength(10);
            entity.HasIndex(o => new { o.PhoneNumber, o.EventId, o.IsUsed });
            entity.HasIndex(o => o.ExpiresAt);
        });
    }
}
