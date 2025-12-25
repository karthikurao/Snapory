namespace Snapory.Domain.Entities;

public class Photo
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeInBytes { get; set; }
    public string StorageKey { get; set; } = string.Empty;
    public string StorageUrl { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
    public string? EventId { get; set; }
    public PhotoStatus Status { get; set; }
    public string? ProcessingMetadata { get; set; }
    
    // Navigation properties
    public Event? Event { get; set; }
    public List<PhotoFace> DetectedFaces { get; set; } = new();
}

public enum PhotoStatus
{
    Uploaded = 0,
    Processing = 1,
    Processed = 2,
    Failed = 3
}
