using Microsoft.EntityFrameworkCore;
using Snapory.Domain.Entities;
using Snapory.Domain.Interfaces;
using Snapory.Infrastructure.Data;

namespace Snapory.Infrastructure.Repositories;

public class PhotoRepository : IPhotoRepository
{
    private readonly SnaporyDbContext _context;

    public PhotoRepository(SnaporyDbContext context)
    {
        _context = context;
    }

    public async Task<Photo?> GetByIdAsync(Guid photoId, CancellationToken cancellationToken = default)
    {
        return await _context.Photos
            .Include(p => p.DetectedFaces)
            .FirstOrDefaultAsync(p => p.Id == photoId, cancellationToken);
    }

    public async Task<IEnumerable<Photo>> GetByEventIdAsync(string eventId, CancellationToken cancellationToken = default)
    {
        return await _context.Photos
            .Where(p => p.EventId == eventId)
            .OrderByDescending(p => p.UploadedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Photo>> GetByGuestAsync(Guid guestId, CancellationToken cancellationToken = default)
    {
        return await _context.Photos
            .Include(p => p.DetectedFaces)
            .Where(p => p.DetectedFaces.Any(f => f.MatchedGuestId == guestId))
            .OrderByDescending(p => p.UploadedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Photo> CreateAsync(Photo photo, CancellationToken cancellationToken = default)
    {
        _context.Photos.Add(photo);
        await _context.SaveChangesAsync(cancellationToken);
        return photo;
    }

    public async Task UpdateAsync(Photo photo, CancellationToken cancellationToken = default)
    {
        _context.Photos.Update(photo);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
