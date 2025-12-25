using Microsoft.EntityFrameworkCore;
using Snapory.Domain.Entities;
using Snapory.Domain.Interfaces;
using Snapory.Infrastructure.Data;

namespace Snapory.Infrastructure.Repositories;

public class EventRepository : IEventRepository
{
    private readonly SnaporyDbContext _context;

    public EventRepository(SnaporyDbContext context)
    {
        _context = context;
    }

    public async Task<Event?> GetByIdAsync(string eventId, CancellationToken cancellationToken = default)
    {
        return await _context.Events.FindAsync(new object[] { eventId }, cancellationToken);
    }

    public async Task<Event?> GetByIdWithPhotosAsync(string eventId, CancellationToken cancellationToken = default)
    {
        return await _context.Events
            .Include(e => e.Photos)
            .Include(e => e.Guests)
            .FirstOrDefaultAsync(e => e.Id == eventId, cancellationToken);
    }

    public async Task<IEnumerable<Event>> GetByPhotographerIdAsync(string photographerId, CancellationToken cancellationToken = default)
    {
        return await _context.Events
            .Where(e => e.PhotographerId == photographerId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Event> CreateAsync(Event eventEntity, CancellationToken cancellationToken = default)
    {
        _context.Events.Add(eventEntity);
        await _context.SaveChangesAsync(cancellationToken);
        return eventEntity;
    }

    public async Task UpdateAsync(Event eventEntity, CancellationToken cancellationToken = default)
    {
        _context.Events.Update(eventEntity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(string eventId, CancellationToken cancellationToken = default)
    {
        var eventEntity = await GetByIdAsync(eventId, cancellationToken);
        if (eventEntity != null)
        {
            _context.Events.Remove(eventEntity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
