using Snapory.Domain.Entities;

namespace Snapory.Domain.Interfaces;

public interface IGuestRepository
{
    Task<Guest?> GetByIdAsync(Guid guestId, CancellationToken cancellationToken = default);
    Task<Guest?> GetByPhoneAndEventAsync(string phoneNumber, string eventId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Guest>> GetByEventIdAsync(string eventId, CancellationToken cancellationToken = default);
    Task<Guest> CreateAsync(Guest guest, CancellationToken cancellationToken = default);
    Task UpdateAsync(Guest guest, CancellationToken cancellationToken = default);
}
