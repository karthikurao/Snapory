using Microsoft.EntityFrameworkCore;
using SnaporyIngest.Data;
using SnaporyIngest.Models;

namespace SnaporyIngest.Services;

public class PhotoProcessingBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PhotoProcessingBackgroundService> _logger;
    private readonly TimeSpan _pollingInterval = TimeSpan.FromSeconds(5);

    public PhotoProcessingBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<PhotoProcessingBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Photo Processing Background Service starting");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessPendingPhotosAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in photo processing background service");
            }

            await Task.Delay(_pollingInterval, stoppingToken);
        }

        _logger.LogInformation("Photo Processing Background Service stopping");
    }

    private async Task ProcessPendingPhotosAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<SnaporyContext>();
        var storageService = scope.ServiceProvider.GetRequiredService<IS3StorageService>();
        var aiService = scope.ServiceProvider.GetRequiredService<IAiProcessingService>();
        var thumbnailService = scope.ServiceProvider.GetRequiredService<IThumbnailService>();

        // Get pending photos (batch of 10)
        var pendingPhotos = await context.Photos
            .Include(p => p.Event)
            .Where(p => p.ProcessingStatus == PhotoProcessingStatus.Pending)
            .OrderBy(p => p.UploadedAt)
            .Take(10)
            .ToListAsync(cancellationToken);

        if (!pendingPhotos.Any())
        {
            return;
        }

        _logger.LogInformation("Processing {Count} pending photos", pendingPhotos.Count);

        foreach (var photo in pendingPhotos)
        {
            if (cancellationToken.IsCancellationRequested) break;

            try
            {
                await ProcessSinglePhotoAsync(photo, context, storageService, aiService, thumbnailService, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process photo: {PhotoId}", photo.PhotoId);
                photo.ProcessingStatus = PhotoProcessingStatus.Failed;
                photo.ProcessingError = ex.Message;
                await context.SaveChangesAsync(cancellationToken);
            }
        }

        // Update event processing status
        var eventIds = pendingPhotos.Select(p => p.EventId).Distinct();
        foreach (var eventId in eventIds)
        {
            await UpdateEventProcessingStatusAsync(context, eventId, cancellationToken);
        }
    }

    private async Task ProcessSinglePhotoAsync(
        Photo photo,
        SnaporyContext context,
        IS3StorageService storageService,
        IAiProcessingService aiService,
        IThumbnailService thumbnailService,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing photo: {PhotoId}", photo.PhotoId);

        // Mark as processing
        photo.ProcessingStatus = PhotoProcessingStatus.Processing;
        await context.SaveChangesAsync(cancellationToken);

        // Generate thumbnail
        try
        {
            var photoStream = await storageService.GetPhotoStreamAsync(photo.S3Key, cancellationToken);
            if (photoStream != null)
            {
                using (photoStream)
                {
                    var thumbnailStream = await thumbnailService.GenerateThumbnailAsync(photoStream, 400, 400);
                    if (thumbnailStream != null)
                    {
                        using (thumbnailStream)
                        {
                            var thumbnailKey = await storageService.UploadThumbnailAsync(
                                thumbnailStream, 
                                photo.PhotoId, 
                                "image/jpeg", 
                                cancellationToken);
                            photo.ThumbnailS3Key = thumbnailKey;
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to generate thumbnail for photo: {PhotoId}", photo.PhotoId);
            // Continue processing even if thumbnail fails
        }

        // Get presigned URL for AI processing
        var photoUrl = await storageService.GetPresignedUrlAsync(photo.S3Key, TimeSpan.FromMinutes(10), cancellationToken);

        // Detect faces
        var faceResult = await aiService.DetectFacesAsync(photoUrl);

        if (faceResult == null || faceResult.FaceCount == 0)
        {
            photo.ProcessingStatus = PhotoProcessingStatus.NoFacesDetected;
            photo.FaceCount = 0;
            photo.ProcessedAt = DateTime.UtcNow;
            await context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("No faces detected in photo: {PhotoId}", photo.PhotoId);
            return;
        }

        // Store face encodings
        photo.FaceCount = faceResult.FaceCount;

        foreach (var face in faceResult.Faces)
        {
            var photoFace = new PhotoFace
            {
                PhotoId = photo.PhotoId,
                FaceIndex = face.Index,
                FaceEncoding = System.Text.Json.JsonSerializer.Serialize(face.Encoding),
                BoundingBoxTop = face.BoundingBox.Top,
                BoundingBoxRight = face.BoundingBox.Right,
                BoundingBoxBottom = face.BoundingBox.Bottom,
                BoundingBoxLeft = face.BoundingBox.Left
            };

            context.PhotoFaces.Add(photoFace);
        }

        photo.ProcessingStatus = PhotoProcessingStatus.Completed;
        photo.ProcessedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Processed photo: {PhotoId} with {FaceCount} faces", photo.PhotoId, photo.FaceCount);
    }

    private async Task UpdateEventProcessingStatusAsync(SnaporyContext context, string eventId, CancellationToken cancellationToken)
    {
        var eventEntity = await context.Events
            .Include(e => e.Photos)
            .FirstOrDefaultAsync(e => e.EventId == eventId, cancellationToken);

        if (eventEntity == null) return;

        eventEntity.TotalPhotos = eventEntity.Photos.Count;
        eventEntity.ProcessedPhotos = eventEntity.Photos.Count(p => 
            p.ProcessingStatus == PhotoProcessingStatus.Completed || 
            p.ProcessingStatus == PhotoProcessingStatus.NoFacesDetected ||
            p.ProcessingStatus == PhotoProcessingStatus.Failed);
        eventEntity.TotalFacesDetected = eventEntity.Photos.Sum(p => p.FaceCount);
        eventEntity.IsProcessingComplete = eventEntity.ProcessedPhotos == eventEntity.TotalPhotos;

        await context.SaveChangesAsync(cancellationToken);
    }
}
