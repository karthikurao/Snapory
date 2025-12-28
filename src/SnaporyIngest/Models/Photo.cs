namespace SnaporyIngest.Models;

public class Photo
{
    public string PhotoId { get; set; } = Guid.NewGuid().ToString();
    public string EventId { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string S3Key { get; set; } = string.Empty;
    public string? ThumbnailS3Key { get; set; }
    public long FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public bool IsProcessed { get; set; } = false;
    public int FaceCount { get; set; } = 0;
    public string? FaceEncodings { get; set; } // JSON array of face encodings
    
    public Event? Event { get; set; }
    public ICollection<PhotoFaceMatch> FaceMatches { get; set; } = new List<PhotoFaceMatch>();
}
