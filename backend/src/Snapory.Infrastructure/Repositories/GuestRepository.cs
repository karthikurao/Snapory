using Microsoft.EntityFrameworkCore;
using Snapory.Domain.Entities;
using Snapory.Domain.Interfaces;
using Snapory.Infrastructure.Data;

namespace Snapory.Infrastructure.Repositories;

public class GuestRepository : IGuestRepository
{
    private readonly SnaporyDbContext _context;

    public GuestRepository(SnaporyDbContext context)
    {
        _context = context;
    }

    public async Task<Guest?> GetByIdAsync(Guid guestId, CancellationToken cancellationToken = default)
    {
        return await _context.Guests.FindAsync(new object[] { guestId }, cancellationToken);
    }

    public async Task<Guest?> GetByPhoneAndEventAsync(string phoneNumber, string eventId, CancellationToken cancellationToken = default)
    {
        return await _context.Guests
            .FirstOrDefaultAsync(g => g.PhoneNumber == phoneNumber && g.EventId == eventId, cancellationToken);
    }

    public async Task<IEnumerable<Guest>> GetByEventIdAsync(string eventId, CancellationToken cancellationToken = default)
    {
        return await _context.Guests
            .Where(g => g.EventId == eventId)
            .ToListAsync(cancellationToken);
    }

    public async Task<Guest> CreateAsync(Guest guest, CancellationToken cancellationToken = default)
    {
        _context.Guests.Add(guest);
        await _context.SaveChangesAsync(cancellationToken);
        return guest;
    }

    public async Task UpdateAsync(Guest guest, CancellationToken cancellationToken = default)
    {
        _context.Guests.Update(guest);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
