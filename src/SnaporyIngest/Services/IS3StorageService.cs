namespace SnaporyIngest.Services;

public interface IS3StorageService
{
    Task<string> UploadPhotoAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default);
    Task<string> UploadSelfieAsync(Stream fileStream, string sessionId, string contentType, CancellationToken cancellationToken = default);
    Task<string> UploadThumbnailAsync(Stream fileStream, string photoId, string contentType, CancellationToken cancellationToken = default);
    Task<bool> DeletePhotoAsync(string s3Key, CancellationToken cancellationToken = default);
    Task<string> GetPresignedUrlAsync(string s3Key, TimeSpan expiry, CancellationToken cancellationToken = default);
    Task<Stream?> GetPhotoStreamAsync(string s3Key, CancellationToken cancellationToken = default);
}
