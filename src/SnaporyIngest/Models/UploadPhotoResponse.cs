namespace SnaporyIngest.Models;

public class UploadPhotoResponse
{
    public List<PhotoInfo> Photos { get; set; } = new();
}

public class PhotoInfo
{
    public string PhotoId { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
}
