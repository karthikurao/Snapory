namespace Snapory.Application.DTOs;

public class PhotoUploadRequest
{
    public string? EventId { get; set; }
}

public class PhotoUploadResponse
{
    public Guid PhotoId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string StorageUrl { get; set; } = string.Empty;
    public long SizeInBytes { get; set; }
    public DateTime UploadedAt { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class PhotoResponse
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string StorageUrl { get; set; } = string.Empty;
    public long SizeInBytes { get; set; }
    public DateTime UploadedAt { get; set; }
    public string? EventId { get; set; }
    public string Status { get; set; } = string.Empty;
}
