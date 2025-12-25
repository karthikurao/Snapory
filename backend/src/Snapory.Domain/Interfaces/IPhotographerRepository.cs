using Snapory.Domain.Entities;

namespace Snapory.Domain.Interfaces;

public interface IPhotographerRepository
{
    Task<Photographer?> GetByIdAsync(string photographerId, CancellationToken cancellationToken = default);
    Task<Photographer?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<Photographer> CreateAsync(Photographer photographer, CancellationToken cancellationToken = default);
    Task UpdateAsync(Photographer photographer, CancellationToken cancellationToken = default);
}
