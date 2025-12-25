namespace SnaporyIngest.Services;

public interface IS3StorageService
{
    Task<string> UploadPhotoAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default);
    Task<bool> DeletePhotoAsync(string s3Key, CancellationToken cancellationToken = default);
}
