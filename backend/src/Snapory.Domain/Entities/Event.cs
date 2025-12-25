namespace Snapory.Domain.Entities;

public class Event
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..12];
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string UploadToken { get; set; } = Guid.NewGuid().ToString("N");
    public string QrCodeData { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string PhotographerId { get; set; } = string.Empty;
    
    // Navigation properties
    public List<Photo> Photos { get; set; } = new();
    public List<Guest> Guests { get; set; } = new();
}
