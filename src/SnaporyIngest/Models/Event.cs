namespace SnaporyIngest.Models;

public class Event
{
    public string EventId { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = string.Empty;  // Owner (photographer)
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EventDate { get; set; }
    public string? Location { get; set; }
    public string UploadToken { get; set; } = Guid.NewGuid().ToString();
    public string GuestAccessCode { get; set; } = GenerateAccessCode();
    public bool IsActive { get; set; } = true;
    public bool IsProcessingComplete { get; set; } = false;
    public int TotalPhotos { get; set; } = 0;
    public int ProcessedPhotos { get; set; } = 0;
    public int TotalFacesDetected { get; set; } = 0;
    
    public User? User { get; set; }
    public ICollection<Photo> Photos { get; set; } = new List<Photo>();
    public ICollection<GuestSession> GuestSessions { get; set; } = new List<GuestSession>();
    
    private static string GenerateAccessCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = new Random();
        return new string(Enumerable.Range(0, 6).Select(_ => chars[random.Next(chars.Length)]).ToArray());
    }
}
