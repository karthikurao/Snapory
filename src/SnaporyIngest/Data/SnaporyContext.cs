using Microsoft.EntityFrameworkCore;
using SnaporyIngest.Models;

namespace SnaporyIngest.Data;

public class SnaporyContext : DbContext
{
    public SnaporyContext(DbContextOptions<SnaporyContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<Photo> Photos { get; set; }
    public DbSet<PhotoFace> PhotoFaces { get; set; }
    public DbSet<GuestSession> GuestSessions { get; set; }
    public DbSet<GuestPhotoMatch> GuestPhotoMatches { get; set; }
    public DbSet<GuestFace> GuestFaces { get; set; }
    public DbSet<PhotoFaceMatch> PhotoFaceMatches { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.UserId);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(256);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.Name).IsRequired().HasMaxLength(200);
        });

        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.EventId);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.UploadToken).IsRequired();
            entity.Property(e => e.GuestAccessCode).IsRequired().HasMaxLength(10);
            entity.HasIndex(e => e.GuestAccessCode).IsUnique();
            
            entity.HasOne(e => e.User)
                .WithMany(u => u.Events)
                .HasForeignKey(e => e.UserId);
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

        modelBuilder.Entity<PhotoFace>(entity =>
        {
            entity.HasKey(f => f.FaceId);
            entity.Property(f => f.PhotoId).IsRequired();
            entity.Property(f => f.FaceEncoding).IsRequired();
            
            entity.HasOne(f => f.Photo)
                .WithMany(p => p.Faces)
                .HasForeignKey(f => f.PhotoId);
        });

        modelBuilder.Entity<GuestSession>(entity =>
        {
            entity.HasKey(s => s.SessionId);
            entity.Property(s => s.EventId).IsRequired();
            
            entity.HasOne(s => s.Event)
                .WithMany(e => e.GuestSessions)
                .HasForeignKey(s => s.EventId);
        });

        modelBuilder.Entity<GuestPhotoMatch>(entity =>
        {
            entity.HasKey(m => m.MatchId);
            entity.Property(m => m.SessionId).IsRequired();
            entity.Property(m => m.PhotoId).IsRequired();
            
            entity.HasOne(m => m.Session)
                .WithMany(s => s.PhotoMatches)
                .HasForeignKey(m => m.SessionId);
                
            entity.HasOne(m => m.Photo)
                .WithMany(p => p.GuestMatches)
                .HasForeignKey(m => m.PhotoId);
        });

        modelBuilder.Entity<GuestFace>(entity =>
        {
            entity.HasKey(g => g.GuestFaceId);
            
            entity.HasOne(g => g.Event)
                .WithMany()
                .HasForeignKey(g => g.EventId);
        });

        modelBuilder.Entity<PhotoFaceMatch>(entity =>
        {
            entity.HasKey(m => m.MatchId);
            
            entity.HasOne(m => m.Photo)
                .WithMany(p => p.FaceMatches)
                .HasForeignKey(m => m.PhotoId);
                
            entity.HasOne(m => m.GuestFace)
                .WithMany(g => g.PhotoMatches)
                .HasForeignKey(m => m.GuestFaceId);
        });
    }
}
