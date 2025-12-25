namespace Snapory.Domain.Interfaces;

public interface IBackgroundJobService
{
    Task EnqueuePhotoProcessingAsync(Guid photoId, string storageKey, CancellationToken cancellationToken = default);
    Task<long> GetQueueLengthAsync(CancellationToken cancellationToken = default);
}
