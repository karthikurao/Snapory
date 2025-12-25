using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SnaporyIngest.Data;
using SnaporyIngest.Models;
using SnaporyIngest.Services;

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

    [HttpPost]
    public async Task<ActionResult<CreateEventResponse>> CreateEvent([FromBody] CreateEventRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { error = "Event name is required" });
        }

        var newEvent = new Event
        {
            Name = request.Name,
            Description = request.Description
        };

        _context.Events.Add(newEvent);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created event: {EventId} - {EventName}", newEvent.EventId, newEvent.Name);

        return CreatedAtAction(nameof(GetEvent), new { eventId = newEvent.EventId }, new CreateEventResponse
        {
            EventId = newEvent.EventId,
            UploadToken = newEvent.UploadToken,
            CreatedAt = newEvent.CreatedAt
        });
    }

    [HttpGet("{eventId}")]
    public async Task<ActionResult<Event>> GetEvent(string eventId)
    {
        var eventEntity = await _context.Events
            .Include(e => e.Photos)
            .FirstOrDefaultAsync(e => e.EventId == eventId);

        if (eventEntity == null)
        {
            return NotFound(new { error = "Event not found" });
        }

        return Ok(eventEntity);
    }

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

        if (string.IsNullOrWhiteSpace(uploadToken) || eventEntity.UploadToken != uploadToken)
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
                    ContentType = file.ContentType
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
                    photo.PhotoId, photo.FileName, eventId);
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

        await _context.SaveChangesAsync();

        return Ok(response);
    }
}
