namespace SnaporyIngest.Models;

/// <summary>
/// Represents a detected face within a photo, storing its encoding for matching
/// </summary>
public class PhotoFace
{
    public string FaceId { get; set; } = Guid.NewGuid().ToString();
    public string PhotoId { get; set; } = string.Empty;
    public string FaceEncoding { get; set; } = string.Empty;  // JSON array of 128-dimensional face encoding
    public int FaceIndex { get; set; } = 0;  // Index of face in photo (for photos with multiple faces)
    
    // Bounding box coordinates (percentage of image dimensions)
    public double BoundingBoxTop { get; set; }
    public double BoundingBoxRight { get; set; }
    public double BoundingBoxBottom { get; set; }
    public double BoundingBoxLeft { get; set; }
    
    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
    
    public Photo? Photo { get; set; }
}
