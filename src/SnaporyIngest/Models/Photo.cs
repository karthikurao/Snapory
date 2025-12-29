namespace SnaporyIngest.Models;

using System.Text.Json;

public class Photo
{
    private string? _faceEncodings;
    
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
    
    // Compatibility property for simpler status check
    public bool IsProcessed => ProcessingStatus == PhotoProcessingStatus.Completed || ProcessingStatus == PhotoProcessingStatus.NoFacesDetected;
    
    // JSON array of face encodings with validation
    public string? FaceEncodings
    {
        get => _faceEncodings;
        set
        {
            if (value != null && !string.IsNullOrWhiteSpace(value))
            {
                // Validate that it's valid JSON (parse and immediately dispose)
                try
                {
                    using (JsonDocument.Parse(value))
                    {
                        // Validation successful - document is disposed automatically
                    }
                    _faceEncodings = value;
                }
                catch (JsonException)
                {
                    throw new ArgumentException("FaceEncodings must be valid JSON", nameof(value));
                }
            }
            else
            {
                _faceEncodings = value;
            }
        }
    }
    
    public Event? Event { get; set; }
    public ICollection<PhotoFace> Faces { get; set; } = new List<PhotoFace>();
    public ICollection<GuestPhotoMatch> GuestMatches { get; set; } = new List<GuestPhotoMatch>();
    public ICollection<PhotoFaceMatch> FaceMatches { get; set; } = new List<PhotoFaceMatch>();
}

public enum PhotoProcessingStatus
{
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3,
    NoFacesDetected = 4
}
