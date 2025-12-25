using Snapory.Application.DTOs;
using Snapory.Domain.Entities;
using Snapory.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace Snapory.Application.Services;

public interface IEventService
{
    Task<CreateEventResponse> CreateEventAsync(CreateEventRequest request, string photographerId, CancellationToken cancellationToken = default);
    Task<EventResponse> GetEventAsync(string eventId, CancellationToken cancellationToken = default);
    Task<EventDetailsResponse> GetEventDetailsAsync(string eventId, CancellationToken cancellationToken = default);
    Task<IEnumerable<EventResponse>> GetPhotographerEventsAsync(string photographerId, CancellationToken cancellationToken = default);
    Task DeleteEventAsync(string eventId, string photographerId, CancellationToken cancellationToken = default);
}

public class EventService : IEventService
{
    private readonly IEventRepository _eventRepository;
    private readonly IQrCodeService _qrCodeService;
    private readonly ILogger<EventService> _logger;

    public EventService(
        IEventRepository eventRepository,
        IQrCodeService qrCodeService,
        ILogger<EventService> logger)
    {
        _eventRepository = eventRepository;
        _qrCodeService = qrCodeService;
        _logger = logger;
    }

    public async Task<CreateEventResponse> CreateEventAsync(CreateEventRequest request, string photographerId, CancellationToken cancellationToken = default)
    {
        var eventEntity = new Event
        {
            Name = request.Name,
            Description = request.Description,
            PhotographerId = photographerId
        };

        // Generate event URL and QR code
        var eventUrl = _qrCodeService.GenerateEventUrl(eventEntity.Id);
        eventEntity.QrCodeData = await _qrCodeService.GenerateQrCodeAsync(eventEntity.Id, eventUrl, cancellationToken);

        await _eventRepository.CreateAsync(eventEntity, cancellationToken);

        _logger.LogInformation("Created event {EventId} for photographer {PhotographerId}", eventEntity.Id, photographerId);

        return new CreateEventResponse
        {
            EventId = eventEntity.Id,
            Name = eventEntity.Name,
            UploadToken = eventEntity.UploadToken,
            QrCodeData = eventEntity.QrCodeData,
            EventUrl = eventUrl,
            CreatedAt = eventEntity.CreatedAt
        };
    }

    public async Task<EventResponse> GetEventAsync(string eventId, CancellationToken cancellationToken = default)
    {
        var eventEntity = await _eventRepository.GetByIdAsync(eventId, cancellationToken);
        
        if (eventEntity == null)
        {
            throw new KeyNotFoundException($"Event {eventId} not found");
        }

        return new EventResponse
        {
            Id = eventEntity.Id,
            Name = eventEntity.Name,
            Description = eventEntity.Description,
            QrCodeData = eventEntity.QrCodeData,
            EventUrl = _qrCodeService.GenerateEventUrl(eventEntity.Id),
            CreatedAt = eventEntity.CreatedAt,
            PhotoCount = eventEntity.Photos?.Count ?? 0,
            GuestCount = eventEntity.Guests?.Count ?? 0
        };
    }

    public async Task<EventDetailsResponse> GetEventDetailsAsync(string eventId, CancellationToken cancellationToken = default)
    {
        var eventEntity = await _eventRepository.GetByIdWithPhotosAsync(eventId, cancellationToken);
        
        if (eventEntity == null)
        {
            throw new KeyNotFoundException($"Event {eventId} not found");
        }

        return new EventDetailsResponse
        {
            Id = eventEntity.Id,
            Name = eventEntity.Name,
            Description = eventEntity.Description,
            QrCodeData = eventEntity.QrCodeData,
            EventUrl = _qrCodeService.GenerateEventUrl(eventEntity.Id),
            CreatedAt = eventEntity.CreatedAt,
            PhotoCount = eventEntity.Photos?.Count ?? 0,
            GuestCount = eventEntity.Guests?.Count ?? 0,
            Photos = eventEntity.Photos?.Select(p => new PhotoResponse
            {
                Id = p.Id,
                FileName = p.FileName,
                StorageUrl = p.StorageUrl,
                SizeInBytes = p.SizeInBytes,
                UploadedAt = p.UploadedAt,
                EventId = p.EventId,
                Status = p.Status.ToString()
            }).ToList() ?? new(),
            Guests = eventEntity.Guests?.Select(g => new GuestResponse
            {
                Id = g.Id,
                PhoneNumber = g.PhoneNumber,
                Name = g.Name,
                IsVerified = g.IsVerified,
                CreatedAt = g.CreatedAt
            }).ToList() ?? new()
        };
    }

    public async Task<IEnumerable<EventResponse>> GetPhotographerEventsAsync(string photographerId, CancellationToken cancellationToken = default)
    {
        var events = await _eventRepository.GetByPhotographerIdAsync(photographerId, cancellationToken);
        
        return events.Select(e => new EventResponse
        {
            Id = e.Id,
            Name = e.Name,
            Description = e.Description,
            QrCodeData = e.QrCodeData,
            EventUrl = _qrCodeService.GenerateEventUrl(e.Id),
            CreatedAt = e.CreatedAt,
            PhotoCount = e.Photos?.Count ?? 0,
            GuestCount = e.Guests?.Count ?? 0
        });
    }

    public async Task DeleteEventAsync(string eventId, string photographerId, CancellationToken cancellationToken = default)
    {
        var eventEntity = await _eventRepository.GetByIdAsync(eventId, cancellationToken);
        
        if (eventEntity == null)
        {
            throw new KeyNotFoundException($"Event {eventId} not found");
        }

        if (eventEntity.PhotographerId != photographerId)
        {
            throw new UnauthorizedAccessException("You don't have permission to delete this event");
        }

        await _eventRepository.DeleteAsync(eventId, cancellationToken);
        _logger.LogInformation("Deleted event {EventId}", eventId);
    }
}
