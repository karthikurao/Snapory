using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Snapory.Application.DTOs;
using Snapory.Domain.Entities;
using Snapory.Domain.Interfaces;

namespace Snapory.Application.Services;

public interface IPhotoService
{
    Task<PhotoUploadResponse> UploadPhotoAsync(IFormFile file, string? eventId, CancellationToken cancellationToken = default);
    Task<PhotoResponse?> GetPhotoAsync(Guid photoId, CancellationToken cancellationToken = default);
    Task<IEnumerable<PhotoResponse>> GetEventPhotosAsync(string eventId, CancellationToken cancellationToken = default);
}

public class PhotoService : IPhotoService
{
    private readonly IStorageService _storageService;
    private readonly IBackgroundJobService _backgroundJobService;
    private readonly ILogger<PhotoService> _logger;
    private static readonly Dictionary<Guid, Photo> _photoStore = new(); // In-memory store for MVP

    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif" };
    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

    public PhotoService(
        IStorageService storageService,
        IBackgroundJobService backgroundJobService,
        ILogger<PhotoService> logger)
    {
        _storageService = storageService;
        _backgroundJobService = backgroundJobService;
        _logger = logger;
    }

    public async Task<PhotoUploadResponse> UploadPhotoAsync(IFormFile file, string? eventId, CancellationToken cancellationToken = default)
    {
        // Validate file
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is required", nameof(file));
        }

        if (file.Length > MaxFileSizeBytes)
        {
            throw new ArgumentException($"File size exceeds maximum allowed size of {MaxFileSizeBytes / 1024 / 1024} MB", nameof(file));
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            throw new ArgumentException($"File type {extension} is not allowed", nameof(file));
        }

        try
        {
            // Upload to S3
            var storageKey = await _storageService.UploadPhotoAsync(
                file.OpenReadStream(),
                file.FileName,
                file.ContentType,
                cancellationToken);

            // Get URL
            var storageUrl = await _storageService.GetPhotoUrlAsync(storageKey);

            // Create photo entity
            var photo = new Photo
            {
                Id = Guid.NewGuid(),
                FileName = file.FileName,
                ContentType = file.ContentType,
                SizeInBytes = file.Length,
                StorageKey = storageKey,
                StorageUrl = storageUrl,
                UploadedAt = DateTime.UtcNow,
                EventId = eventId,
                Status = PhotoStatus.Uploaded
            };

            // Store photo metadata (in-memory for MVP)
            _photoStore[photo.Id] = photo;

            // Enqueue background job for AI processing
            await _backgroundJobService.EnqueuePhotoProcessingAsync(photo.Id, storageKey, cancellationToken);

            _logger.LogInformation("Photo {PhotoId} uploaded successfully for event {EventId}", photo.Id, eventId);

            return new PhotoUploadResponse
            {
                PhotoId = photo.Id,
                FileName = photo.FileName,
                StorageUrl = photo.StorageUrl,
                SizeInBytes = photo.SizeInBytes,
                UploadedAt = photo.UploadedAt,
                Status = photo.Status.ToString()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading photo");
            throw;
        }
    }

    public Task<PhotoResponse?> GetPhotoAsync(Guid photoId, CancellationToken cancellationToken = default)
    {
        if (_photoStore.TryGetValue(photoId, out var photo))
        {
            return Task.FromResult<PhotoResponse?>(new PhotoResponse
            {
                Id = photo.Id,
                FileName = photo.FileName,
                StorageUrl = photo.StorageUrl,
                SizeInBytes = photo.SizeInBytes,
                UploadedAt = photo.UploadedAt,
                EventId = photo.EventId,
                Status = photo.Status.ToString()
            });
        }

        return Task.FromResult<PhotoResponse?>(null);
    }

    public Task<IEnumerable<PhotoResponse>> GetEventPhotosAsync(string eventId, CancellationToken cancellationToken = default)
    {
        var photos = _photoStore.Values
            .Where(p => p.EventId == eventId)
            .OrderByDescending(p => p.UploadedAt)
            .Select(p => new PhotoResponse
            {
                Id = p.Id,
                FileName = p.FileName,
                StorageUrl = p.StorageUrl,
                SizeInBytes = p.SizeInBytes,
                UploadedAt = p.UploadedAt,
                EventId = p.EventId,
                Status = p.Status.ToString()
            });

        return Task.FromResult(photos);
    }
}
