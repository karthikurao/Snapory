namespace SnaporyIngest.Models;

public class GuestFace
{
    public string GuestFaceId { get; set; } = Guid.NewGuid().ToString();
    public string EventId { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Name { get; set; }
    public string SelfieS3Key { get; set; } = string.Empty;
    public string? FaceEncoding { get; set; } // Base64 encoded face vector
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsVerified { get; set; } = false;
    
    public Event? Event { get; set; }
    public ICollection<PhotoFaceMatch> PhotoMatches { get; set; } = new List<PhotoFaceMatch>();
}

public class PhotoFaceMatch
{
    public string MatchId { get; set; } = Guid.NewGuid().ToString();
    public string PhotoId { get; set; } = string.Empty;
    public string GuestFaceId { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public DateTime MatchedAt { get; set; } = DateTime.UtcNow;
    
    public Photo? Photo { get; set; }
    public GuestFace? GuestFace { get; set; }
}
