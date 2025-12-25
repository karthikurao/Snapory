namespace Snapory.Domain.Entities;

public class Guest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string EventId { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string SelfieStorageKey { get; set; } = string.Empty;
    public string FaceEmbedding { get; set; } = string.Empty; // Serialized face embedding
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsVerified { get; set; }
    
    // Navigation properties
    public Event? Event { get; set; }
}
