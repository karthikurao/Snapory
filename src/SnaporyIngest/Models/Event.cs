namespace SnaporyIngest.Models;

public class Event
{
    public string EventId { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string UploadToken { get; set; } = Guid.NewGuid().ToString();
    
    public ICollection<Photo> Photos { get; set; } = new List<Photo>();
}
