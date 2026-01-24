using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SnaporyIngest.Data;
using SnaporyIngest.Models;
using SnaporyIngest.Services;
using SnaporyIngest.Middleware;

namespace SnaporyIngest.Controllers;

[ApiController]
[Route("[controller]")]
public class EventsController : ControllerBase
{
    private readonly SnaporyContext _context;
    private readonly IS3StorageService _storageService;
    private readonly ILogger<EventsController> _logger;
    private const long MaxFileSize = 50 * 1024 * 1024; // 50 MB
    private static readonly string[] AllowedContentTypes = { "image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif" };

    public EventsController(SnaporyContext context, IS3StorageService storageService, ILogger<EventsController> logger)
    {
        _context = context;
        _storageService = storageService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new event (requires authentication)
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<CreateEventResponse>> CreateEvent([FromBody] CreateEventRequest request)
    {
        var userId = HttpContext.GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { error = "Event name is required" });
        }

        var newEvent = new Event
        {
            UserId = userId,
            Name = request.Name,
            Description = request.Description,
            EventDate = request.EventDate,
            Location = request.Location
        };

        _context.Events.Add(newEvent);
        await _context.SaveChangesAsync();

        var sanitizedEventName = (newEvent.Name ?? string.Empty)
            .Replace("\r", string.Empty)
            .Replace("\n", string.Empty);
        _logger.LogInformation("Created event: {EventId} - {EventName} by user {UserId}", newEvent.EventId, sanitizedEventName, userId);

        return CreatedAtAction(nameof(GetEvent), new { eventId = newEvent.EventId }, new CreateEventResponse
        {
            EventId = newEvent.EventId,
            UploadToken = newEvent.UploadToken,
            GuestAccessCode = newEvent.GuestAccessCode,
            CreatedAt = newEvent.CreatedAt
        });
    }

    /// <summary>
    /// Get all events for the authenticated user
    /// </summary>
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<EventSummary>>> GetMyEvents()
    {
        var userId = HttpContext.GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var events = await _context.Events
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new EventSummary
            {
                EventId = e.EventId,
                Name = e.Name,
                Description = e.Description,
                EventDate = e.EventDate,
                Location = e.Location,
                GuestAccessCode = e.GuestAccessCode,
                TotalPhotos = e.TotalPhotos,
                ProcessedPhotos = e.ProcessedPhotos,
                TotalFacesDetected = e.TotalFacesDetected,
                IsProcessingComplete = e.IsProcessingComplete,
                IsActive = e.IsActive,
                CreatedAt = e.CreatedAt
            })
            .ToListAsync();

        return Ok(events);
    }

    /// <summary>
    /// Get a specific event (requires ownership or valid upload token)
    /// </summary>
    [HttpGet("{eventId}")]
    public async Task<ActionResult<EventDetailResponse>> GetEvent(string eventId)
    {
        var eventEntity = await _context.Events
            .Include(e => e.Photos)
            .FirstOrDefaultAsync(e => e.EventId == eventId);

        if (eventEntity == null)
        {
            return NotFound(new { error = "Event not found" });
        }

        // Check authorization - either owner or has valid upload token
        var userId = HttpContext.GetUserId();
        var uploadToken = Request.Headers["X-Upload-Token"].FirstOrDefault();

        if (userId != eventEntity.UserId && uploadToken != eventEntity.UploadToken)
        {
            return Unauthorized(new { error = "You don't have access to this event" });
        }

        var photos = new List<PhotoDetail>();
        foreach (var photo in eventEntity.Photos.OrderByDescending(p => p.UploadedAt))
        {
            var thumbnailUrl = !string.IsNullOrEmpty(photo.ThumbnailS3Key)
                ? await _storageService.GetPresignedUrlAsync(photo.ThumbnailS3Key, TimeSpan.FromHours(1))
                : await _storageService.GetPresignedUrlAsync(photo.S3Key, TimeSpan.FromHours(1));

            photos.Add(new PhotoDetail
            {
                PhotoId = photo.PhotoId,
                FileName = photo.FileName,
                FileSize = photo.FileSize,
                ThumbnailUrl = thumbnailUrl,
                ProcessingStatus = photo.ProcessingStatus.ToString(),
                FaceCount = photo.FaceCount,
                UploadedAt = photo.UploadedAt
            });
        }

        return Ok(new EventDetailResponse
        {
            EventId = eventEntity.EventId,
            Name = eventEntity.Name,
            Description = eventEntity.Description,
            EventDate = eventEntity.EventDate,
            Location = eventEntity.Location,
            GuestAccessCode = eventEntity.GuestAccessCode,
            UploadToken = userId == eventEntity.UserId ? eventEntity.UploadToken : null,
            TotalPhotos = eventEntity.TotalPhotos,
            ProcessedPhotos = eventEntity.ProcessedPhotos,
            TotalFacesDetected = eventEntity.TotalFacesDetected,
            IsProcessingComplete = eventEntity.IsProcessingComplete,
            IsActive = eventEntity.IsActive,
            CreatedAt = eventEntity.CreatedAt,
            Photos = photos
        });
    }

    /// <summary>
    /// Update event settings
    /// </summary>
    [HttpPut("{eventId}")]
    [Authorize]
    public async Task<ActionResult> UpdateEvent(string eventId, [FromBody] UpdateEventRequest request)
    {
        var userId = HttpContext.GetUserId();
        var eventEntity = await _context.Events.FirstOrDefaultAsync(e => e.EventId == eventId && e.UserId == userId);

        if (eventEntity == null)
        {
            return NotFound(new { error = "Event not found" });
        }

        if (!string.IsNullOrEmpty(request.Name))
            eventEntity.Name = request.Name;
        if (request.Description != null)
            eventEntity.Description = request.Description;
        if (request.EventDate.HasValue)
            eventEntity.EventDate = request.EventDate;
        if (request.Location != null)
            eventEntity.Location = request.Location;
        if (request.IsActive.HasValue)
            eventEntity.IsActive = request.IsActive.Value;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Event updated successfully" });
    }

    /// <summary>
    /// Regenerate guest access code
    /// </summary>
    [HttpPost("{eventId}/regenerate-code")]
    [Authorize]
    public async Task<ActionResult> RegenerateAccessCode(string eventId)
    {
        var userId = HttpContext.GetUserId();
        var eventEntity = await _context.Events.FirstOrDefaultAsync(e => e.EventId == eventId && e.UserId == userId);

        if (eventEntity == null)
        {
            return NotFound(new { error = "Event not found" });
        }

        // Generate new code
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = new Random();
        eventEntity.GuestAccessCode = new string(Enumerable.Range(0, 6).Select(_ => chars[random.Next(chars.Length)]).ToArray());

        await _context.SaveChangesAsync();

        return Ok(new { guestAccessCode = eventEntity.GuestAccessCode });
    }

    /// <summary>
    /// Upload photos to an event
    /// </summary>
    [HttpPost("{eventId}/photos")]
    public async Task<ActionResult<UploadPhotoResponse>> UploadPhotos(
        string eventId,
        [FromHeader(Name = "X-Upload-Token")] string uploadToken,
        [FromForm] IFormFileCollection files)
    {
        var eventEntity = await _context.Events.FirstOrDefaultAsync(e => e.EventId == eventId);

        if (eventEntity == null)
        {
            return NotFound(new { error = "Event not found" });
        }

        // Check authorization - either owner or valid upload token
        var userId = HttpContext.GetUserId();
        if (userId != eventEntity.UserId && (string.IsNullOrWhiteSpace(uploadToken) || eventEntity.UploadToken != uploadToken))
        {
            return Unauthorized(new { error = "Invalid upload token" });
        }

        if (files == null || files.Count == 0)
        {
            return BadRequest(new { error = "No files provided" });
        }

        var response = new UploadPhotoResponse();
        var uploadedPhotos = new List<Photo>();

        foreach (var file in files)
        {
            if (file.Length == 0)
            {
                _logger.LogWarning("Skipping empty file: {FileName}", file.FileName);
                continue;
            }

            if (file.Length > MaxFileSize)
            {
                _logger.LogWarning("File too large: {FileName} ({FileSize} bytes)", file.FileName, file.Length);
                return BadRequest(new { error = $"File {file.FileName} exceeds maximum size of {MaxFileSize} bytes" });
            }

            if (!AllowedContentTypes.Contains(file.ContentType.ToLower()))
            {
                _logger.LogWarning("Invalid file type: {FileName} ({ContentType})", file.FileName, file.ContentType);
                return BadRequest(new { error = $"File {file.FileName} has unsupported content type: {file.ContentType}" });
            }

            try
            {
                using var stream = file.OpenReadStream();
                var s3Key = await _storageService.UploadPhotoAsync(stream, file.FileName, file.ContentType);

                var photo = new Photo
                {
                    EventId = eventId,
                    FileName = file.FileName,
                    S3Key = s3Key,
                    FileSize = file.Length,
                    ContentType = file.ContentType,
                    ProcessingStatus = PhotoProcessingStatus.Pending
                };

                uploadedPhotos.Add(photo);
                _context.Photos.Add(photo);

                response.Photos.Add(new PhotoInfo
                {
                    PhotoId = photo.PhotoId,
                    FileName = photo.FileName,
                    FileSize = photo.FileSize,
                    UploadedAt = photo.UploadedAt
                });

                _logger.LogInformation("Uploaded photo: {PhotoId} - {FileName} for event {EventId}",
                    photo.PhotoId, photo.FileName, SanitizeForLogging(eventId));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload photo: {FileName}", file.FileName);
                
                foreach (var uploadedPhoto in uploadedPhotos)
                {
                    await _storageService.DeletePhotoAsync(uploadedPhoto.S3Key);
                }
                
                return StatusCode(500, new { error = $"Failed to upload photo: {file.FileName}", details = ex.Message });
            }
        }

        // Update event photo count
        eventEntity.TotalPhotos = await _context.Photos.CountAsync(p => p.EventId == eventId) + uploadedPhotos.Count;
        eventEntity.IsProcessingComplete = false;

        await _context.SaveChangesAsync();

        return Ok(response);
    }

    private static string? SanitizeForLogging(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return value;
        }

        // Remove all control characters and normalize whitespace to reduce log-forging risk
        var noControlChars = new string(value.Where(ch => !char.IsControl(ch)).ToArray());

        // Optionally collapse consecutive whitespace into a single space to avoid visual confusion
        var sb = new System.Text.StringBuilder(noControlChars.Length);
        bool lastWasWhitespace = false;
        foreach (var ch in noControlChars)
        {
            if (char.IsWhiteSpace(ch))
            {
                if (!lastWasWhitespace)
                {
                    sb.Append(' ');
                    lastWasWhitespace = true;
                }
            }
            else
            {
                sb.Append(ch);
                lastWasWhitespace = false;
            }
        }

        return sb.ToString();
    }

    /// <summary>
    /// Get photo download URL
    /// </summary>
    [HttpGet("{eventId}/photos/{photoId}/download")]
    [Authorize]
    public async Task<ActionResult> DownloadPhoto(string eventId, string photoId)
    {
        var userId = HttpContext.GetUserId();
        var eventEntity = await _context.Events.FirstOrDefaultAsync(e => e.EventId == eventId && e.UserId == userId);

        if (eventEntity == null)
        {
            return NotFound(new { error = "Event not found" });
        }

        var photo = await _context.Photos.FirstOrDefaultAsync(p => p.PhotoId == photoId && p.EventId == eventId);
        if (photo == null)
        {
            return NotFound(new { error = "Photo not found" });
        }

        var downloadUrl = await _storageService.GetPresignedUrlAsync(photo.S3Key, TimeSpan.FromHours(4));
        return Ok(new { downloadUrl, fileName = photo.FileName });
    }

    /// <summary>
    /// Delete a photo
    /// </summary>
    [HttpDelete("{eventId}/photos/{photoId}")]
    [Authorize]
    public async Task<ActionResult> DeletePhoto(string eventId, string photoId)
    {
        var userId = HttpContext.GetUserId();
        var eventEntity = await _context.Events.FirstOrDefaultAsync(e => e.EventId == eventId && e.UserId == userId);

        if (eventEntity == null)
        {
            return NotFound(new { error = "Event not found" });
        }

        var photo = await _context.Photos
            .Include(p => p.Faces)
            .Include(p => p.GuestMatches)
            .FirstOrDefaultAsync(p => p.PhotoId == photoId && p.EventId == eventId);

        if (photo == null)
        {
            return NotFound(new { error = "Photo not found" });
        }

        // Delete from S3
        await _storageService.DeletePhotoAsync(photo.S3Key);
        if (!string.IsNullOrEmpty(photo.ThumbnailS3Key))
        {
            await _storageService.DeletePhotoAsync(photo.ThumbnailS3Key);
        }

        // Delete from database
        _context.PhotoFaces.RemoveRange(photo.Faces);
        _context.GuestPhotoMatches.RemoveRange(photo.GuestMatches);
        _context.Photos.Remove(photo);
        
        eventEntity.TotalPhotos = Math.Max(0, eventEntity.TotalPhotos - 1);
        
        await _context.SaveChangesAsync();

        return Ok(new { message = "Photo deleted successfully" });
    }

    /// <summary>
    /// Get event statistics
    /// </summary>
    [HttpGet("{eventId}/stats")]
    [Authorize]
    public async Task<ActionResult> GetEventStats(string eventId)
    {
        var userId = HttpContext.GetUserId();
        var eventEntity = await _context.Events
            .Include(e => e.Photos)
            .Include(e => e.GuestSessions)
            .FirstOrDefaultAsync(e => e.EventId == eventId && e.UserId == userId);

        if (eventEntity == null)
        {
            return NotFound(new { error = "Event not found" });
        }

        var stats = new
        {
            totalPhotos = eventEntity.TotalPhotos,
            processedPhotos = eventEntity.ProcessedPhotos,
            pendingPhotos = eventEntity.Photos.Count(p => p.ProcessingStatus == PhotoProcessingStatus.Pending),
            failedPhotos = eventEntity.Photos.Count(p => p.ProcessingStatus == PhotoProcessingStatus.Failed),
            totalFaces = eventEntity.TotalFacesDetected,
            totalGuests = eventEntity.GuestSessions.Count,
            matchedGuests = eventEntity.GuestSessions.Count(s => s.MatchedPhotoCount > 0),
            totalDownloads = await _context.GuestPhotoMatches
                .Where(m => m.Session!.EventId == eventId && m.IsDownloaded)
                .CountAsync(),
            isProcessingComplete = eventEntity.IsProcessingComplete
        };

        return Ok(stats);
    }
}

// Additional request/response models
public class UpdateEventRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public DateTime? EventDate { get; set; }
    public string? Location { get; set; }
    public bool? IsActive { get; set; }
}

public class EventSummary
{
    public string EventId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? EventDate { get; set; }
    public string? Location { get; set; }
    public string GuestAccessCode { get; set; } = string.Empty;
    public int TotalPhotos { get; set; }
    public int ProcessedPhotos { get; set; }
    public int TotalFacesDetected { get; set; }
    public bool IsProcessingComplete { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class EventDetailResponse : EventSummary
{
    public string? UploadToken { get; set; }
    public List<PhotoDetail> Photos { get; set; } = new();
}

public class PhotoDetail
{
    public string PhotoId { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string ThumbnailUrl { get; set; } = string.Empty;
    public string ProcessingStatus { get; set; } = string.Empty;
    public int FaceCount { get; set; }
    public DateTime UploadedAt { get; set; }
}
