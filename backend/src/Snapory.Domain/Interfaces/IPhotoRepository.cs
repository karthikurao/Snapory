using Snapory.Domain.Entities;

namespace Snapory.Domain.Interfaces;

public interface IPhotoRepository
{
    Task<Photo?> GetByIdAsync(Guid photoId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Photo>> GetByEventIdAsync(string eventId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Photo>> GetByGuestAsync(Guid guestId, CancellationToken cancellationToken = default);
    Task<Photo> CreateAsync(Photo photo, CancellationToken cancellationToken = default);
    Task UpdateAsync(Photo photo, CancellationToken cancellationToken = default);
}
