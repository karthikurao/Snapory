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
    public PhotoProcessingStatus ProcessingStatus { get; set; } = PhotoProcessingStatus.Pending;
    public int FaceCount { get; set; } = 0;
    public string? ProcessingError { get; set; }
    public DateTime? ProcessedAt { get; set; }
    
    public Event? Event { get; set; }
    public ICollection<PhotoFace> Faces { get; set; } = new List<PhotoFace>();
    public ICollection<GuestPhotoMatch> GuestMatches { get; set; } = new List<GuestPhotoMatch>();
}

public enum PhotoProcessingStatus
{
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3,
    NoFacesDetected = 4
}
