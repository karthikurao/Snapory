namespace Snapory.Domain.Entities;

public class PhotoFace
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PhotoId { get; set; }
    public string FaceEmbedding { get; set; } = string.Empty; // Serialized face embedding
    public string BoundingBox { get; set; } = string.Empty; // JSON: {x, y, width, height}
    public Guid? MatchedGuestId { get; set; }
    public float? MatchConfidence { get; set; }
    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Photo? Photo { get; set; }
    public Guest? MatchedGuest { get; set; }
}
