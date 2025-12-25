using Microsoft.EntityFrameworkCore;
using Snapory.Domain.Entities;
using Snapory.Domain.Interfaces;
using Snapory.Infrastructure.Data;

namespace Snapory.Infrastructure.Repositories;

public class PhotographerRepository : IPhotographerRepository
{
    private readonly SnaporyDbContext _context;

    public PhotographerRepository(SnaporyDbContext context)
    {
        _context = context;
    }

    public async Task<Photographer?> GetByIdAsync(string photographerId, CancellationToken cancellationToken = default)
    {
        return await _context.Photographers.FindAsync(new object[] { photographerId }, cancellationToken);
    }

    public async Task<Photographer?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Photographers
            .FirstOrDefaultAsync(p => p.Email == email, cancellationToken);
    }

    public async Task<Photographer> CreateAsync(Photographer photographer, CancellationToken cancellationToken = default)
    {
        _context.Photographers.Add(photographer);
        await _context.SaveChangesAsync(cancellationToken);
        return photographer;
    }

    public async Task UpdateAsync(Photographer photographer, CancellationToken cancellationToken = default)
    {
        _context.Photographers.Update(photographer);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
