namespace SnaporyIngest.Models;

public class GuestSession
{
    public string SessionId { get; set; } = Guid.NewGuid().ToString();
    public string EventId { get; set; } = string.Empty;
    public string? SelfieS3Key { get; set; }
    public string? FaceEncoding { get; set; }  // JSON array of face encoding
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    public GuestSessionStatus Status { get; set; } = GuestSessionStatus.Pending;
    public int MatchedPhotoCount { get; set; } = 0;
    
    public Event? Event { get; set; }
    public ICollection<GuestPhotoMatch> PhotoMatches { get; set; } = new List<GuestPhotoMatch>();
}

public enum GuestSessionStatus
{
    Pending = 0,      // Just created, waiting for selfie
    Processing = 1,   // Selfie uploaded, matching in progress
    Completed = 2,    // Matching complete
    Expired = 3       // Session expired
}

public class GuestPhotoMatch
{
    public string MatchId { get; set; } = Guid.NewGuid().ToString();
    public string SessionId { get; set; } = string.Empty;
    public string PhotoId { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public DateTime MatchedAt { get; set; } = DateTime.UtcNow;
    public bool IsDownloaded { get; set; } = false;
    
    public GuestSession? Session { get; set; }
    public Photo? Photo { get; set; }
}
