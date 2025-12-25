using Snapory.Domain.Entities;

namespace Snapory.Domain.Interfaces;

public interface IEventRepository
{
    Task<Event?> GetByIdAsync(string eventId, CancellationToken cancellationToken = default);
    Task<Event?> GetByIdWithPhotosAsync(string eventId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Event>> GetByPhotographerIdAsync(string photographerId, CancellationToken cancellationToken = default);
    Task<Event> CreateAsync(Event eventEntity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Event eventEntity, CancellationToken cancellationToken = default);
    Task DeleteAsync(string eventId, CancellationToken cancellationToken = default);
}
