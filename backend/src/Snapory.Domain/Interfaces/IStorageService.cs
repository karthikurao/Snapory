namespace Snapory.Domain.Interfaces;

public interface IStorageService
{
    Task<string> UploadPhotoAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default);
    Task<string> GetPhotoUrlAsync(string storageKey, int expirationMinutes = 60);
    Task<bool> DeletePhotoAsync(string storageKey, CancellationToken cancellationToken = default);
}
