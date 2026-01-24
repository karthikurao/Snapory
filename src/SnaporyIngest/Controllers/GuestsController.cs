using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SnaporyIngest.Data;
using SnaporyIngest.Models;
using SnaporyIngest.Services;

namespace SnaporyIngest.Controllers;

[ApiController]
[Route("[controller]")]
public class GuestsController : ControllerBase
{
    private readonly SnaporyContext _context;
    private readonly IS3StorageService _storageService;
    private readonly IAiProcessingService _aiService;
    private readonly ILogger<GuestsController> _logger;

    public GuestsController(
        SnaporyContext context, 
        IS3StorageService storageService,
        IAiProcessingService aiService,
        ILogger<GuestsController> logger)
    {
        _context = context;
        _storageService = storageService;
        _aiService = aiService;
        _logger = logger;
    }

    /// <summary>
    /// Join an event using guest access code
    /// </summary>
    [HttpPost("join/{accessCode}")]
    public async Task<ActionResult<GuestJoinResponse>> JoinEvent(string accessCode)
    {
        var eventEntity = await _context.Events
            .FirstOrDefaultAsync(e => e.GuestAccessCode == accessCode.ToUpper() && e.IsActive);

        if (eventEntity == null)
        {
            return NotFound(new { error = "Event not found or inactive" });
        }

        // Create guest session
        var session = new GuestSession
        {
            EventId = eventEntity.EventId,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        _context.GuestSessions.Add(session);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Guest session created: {SessionId} for event {EventId}", session.SessionId, eventEntity.EventId);

        return Ok(new GuestJoinResponse
        {
            SessionId = session.SessionId,
            EventName = eventEntity.Name,
            EventDate = eventEntity.EventDate,
            Location = eventEntity.Location,
            TotalPhotos = eventEntity.TotalPhotos,
            IsProcessingComplete = eventEntity.IsProcessingComplete
        });
    }

    /// <summary>
    /// Upload selfie for face matching
    /// </summary>
    [HttpPost("{sessionId}/selfie")]
    public async Task<ActionResult<SelfieUploadResponse>> UploadSelfie(
        string sessionId, 
        [FromForm] IFormFile selfie)
    {
        var session = await _context.GuestSessions
            .Include(s => s.Event)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);

        if (session == null)
        {
            return NotFound(new { error = "Session not found" });
        }

        if (session.ExpiresAt < DateTime.UtcNow)
        {
            session.Status = GuestSessionStatus.Expired;
            await _context.SaveChangesAsync();
            return BadRequest(new { error = "Session expired" });
        }

        if (selfie == null || selfie.Length == 0)
        {
            return BadRequest(new { error = "No selfie provided" });
        }

        try
        {
            // Upload selfie to S3
            using var stream = selfie.OpenReadStream();
            var s3Key = await _storageService.UploadSelfieAsync(stream, session.SessionId, selfie.ContentType);
            
            session.SelfieS3Key = s3Key;
            session.Status = GuestSessionStatus.Processing;
            await _context.SaveChangesAsync();

            // Get presigned URL for the selfie
            var selfieUrl = await _storageService.GetPresignedUrlAsync(s3Key, TimeSpan.FromMinutes(5));

            // Process face encoding via AI service
            var encoding = await _aiService.EncodeFaceAsync(selfieUrl);
            if (encoding == null)
            {
                return BadRequest(new { error = "No face detected in selfie. Please try again with a clear photo of your face." });
            }

            session.FaceEncoding = System.Text.Json.JsonSerializer.Serialize(encoding);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Selfie uploaded for session: {SessionId}", session.SessionId);

            return Ok(new SelfieUploadResponse
            {
                SessionId = sessionId,
                Status = "processing",
                Message = "Selfie uploaded successfully. Face matching in progress."
            });
        }
        catch (Exception ex)
        {
            var safeSessionId = sessionId.Replace("\r", string.Empty).Replace("\n", string.Empty);
            _logger.LogError(ex, "Failed to process selfie for session: {SessionId}", safeSessionId);
            return StatusCode(500, new { error = "Failed to process selfie" });
        }
    }

    /// <summary>
    /// Find matching photos for guest
    /// </summary>
    [HttpPost("{sessionId}/find-photos")]
    public async Task<ActionResult<PhotoMatchResponse>> FindMatchingPhotos(string sessionId)
    {
        var safeSessionId = sessionId?.Replace("\r", string.Empty).Replace("\n", string.Empty);

        var session = await _context.GuestSessions
            .Include(s => s.Event)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);

        if (session == null)
        {
            return NotFound(new { error = "Session not found" });
        }

        if (session.Status == GuestSessionStatus.Expired || session.ExpiresAt < DateTime.UtcNow)
        {
            return BadRequest(new { error = "Session expired" });
        }

        if (string.IsNullOrEmpty(session.FaceEncoding))
        {
            return BadRequest(new { error = "Please upload a selfie first" });
        }

        try
        {
            // Get all processed photos with faces from the event
            var photosWithFaces = await _context.Photos
                .Include(p => p.Faces)
                .Where(p => p.EventId == session.EventId && p.ProcessingStatus == PhotoProcessingStatus.Completed)
                .ToListAsync();

            var guestEncoding = System.Text.Json.JsonSerializer.Deserialize<double[]>(session.FaceEncoding);
            if (guestEncoding == null)
            {
                return BadRequest(new { error = "Invalid face encoding" });
            }

            var matches = new List<GuestPhotoMatch>();
            var matchingPhotos = new List<PhotoMatchInfo>();

            foreach (var photo in photosWithFaces)
            {
                foreach (var face in photo.Faces)
                {
                    var photoEncoding = System.Text.Json.JsonSerializer.Deserialize<double[]>(face.FaceEncoding);
                    if (photoEncoding == null) continue;

                    var distance = CalculateFaceDistance(guestEncoding, photoEncoding);
                    var confidence = 1.0 - distance;

                    if (confidence >= 0.6) // 60% confidence threshold
                    {
                        // Check if match already exists
                        var existingMatch = matches.FirstOrDefault(m => m.PhotoId == photo.PhotoId);
                        if (existingMatch == null || existingMatch.Confidence < confidence)
                        {
                            if (existingMatch != null)
                            {
                                matches.Remove(existingMatch);
                            }

                            var match = new GuestPhotoMatch
                            {
                                SessionId = sessionId,
                                PhotoId = photo.PhotoId,
                                Confidence = confidence
                            };
                            matches.Add(match);

                            matchingPhotos.Add(new PhotoMatchInfo
                            {
                                PhotoId = photo.PhotoId,
                                ThumbnailUrl = await _storageService.GetPresignedUrlAsync(photo.ThumbnailS3Key ?? photo.S3Key, TimeSpan.FromHours(1)),
                                FullUrl = await _storageService.GetPresignedUrlAsync(photo.S3Key, TimeSpan.FromHours(1)),
                                Confidence = confidence,
                                UploadedAt = photo.UploadedAt
                            });
                        }
                    }
                }
            }

            // Save matches to database
            if (matches.Any())
            {
                // Remove old matches for this session
                var oldMatches = await _context.GuestPhotoMatches
                    .Where(m => m.SessionId == sessionId)
                    .ToListAsync();
                _context.GuestPhotoMatches.RemoveRange(oldMatches);

                _context.GuestPhotoMatches.AddRange(matches);
                session.MatchedPhotoCount = matches.Count;
                session.Status = GuestSessionStatus.Completed;
                await _context.SaveChangesAsync();
            }

            var safeSessionId = SanitizeForLog(sessionId);
            _logger.LogInformation("Found {Count} matching photos for session: {SessionId}", matches.Count, safeSessionId);

            return Ok(new PhotoMatchResponse
            {
                SessionId = sessionId,
                TotalMatches = matchingPhotos.Count,
                Photos = matchingPhotos.OrderByDescending(p => p.Confidence).ToList()
            });
        }
        catch (Exception ex)
        {
            var safeSessionId = SanitizeForLog(sessionId);
            _logger.LogError(ex, "Failed to find matching photos for session: {SessionId}", safeSessionId);
            return StatusCode(500, new { error = "Failed to find matching photos" });
        }
    }

    /// <summary>
    /// Get matched photos for a session
    /// </summary>
    [HttpGet("{sessionId}/photos")]
    public async Task<ActionResult<PhotoMatchResponse>> GetMatchedPhotos(string sessionId)
    {
        var session = await _context.GuestSessions
            .Include(s => s.PhotoMatches)
                .ThenInclude(m => m.Photo)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);

        if (session == null)
        {
            return NotFound(new { error = "Session not found" });
        }

        var photos = new List<PhotoMatchInfo>();
        foreach (var match in session.PhotoMatches.OrderByDescending(m => m.Confidence))
        {
            if (match.Photo == null) continue;
            
            photos.Add(new PhotoMatchInfo
            {
                PhotoId = match.PhotoId,
                ThumbnailUrl = await _storageService.GetPresignedUrlAsync(match.Photo.ThumbnailS3Key ?? match.Photo.S3Key, TimeSpan.FromHours(1)),
                FullUrl = await _storageService.GetPresignedUrlAsync(match.Photo.S3Key, TimeSpan.FromHours(1)),
                Confidence = match.Confidence,
                UploadedAt = match.Photo.UploadedAt
            });
        }

        return Ok(new PhotoMatchResponse
        {
            SessionId = sessionId,
            TotalMatches = photos.Count,
            Photos = photos
        });
    }

    /// <summary>
    /// Download a photo
    /// </summary>
    [HttpGet("{sessionId}/photos/{photoId}/download")]
    public async Task<ActionResult> DownloadPhoto(string sessionId, string photoId)
    {
        var match = await _context.GuestPhotoMatches
            .Include(m => m.Photo)
            .FirstOrDefaultAsync(m => m.SessionId == sessionId && m.PhotoId == photoId);

        if (match == null)
        {
            return NotFound(new { error = "Photo not found or not matched to your session" });
        }

        if (match.Photo == null)
        {
            return NotFound(new { error = "Photo not found" });
        }

        // Get download URL with longer expiry
        var downloadUrl = await _storageService.GetPresignedUrlAsync(match.Photo.S3Key, TimeSpan.FromHours(4));

        // Mark as downloaded
        match.IsDownloaded = true;
        await _context.SaveChangesAsync();

        return Ok(new { downloadUrl, fileName = match.Photo.FileName });
    }

    /// <summary>
    /// Download all matched photos as a batch
    /// </summary>
    [HttpGet("{sessionId}/download-all")]
    public async Task<ActionResult> DownloadAllPhotos(string sessionId)
    {
        var session = await _context.GuestSessions
            .Include(s => s.PhotoMatches)
                .ThenInclude(m => m.Photo)
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);

        if (session == null)
        {
            return NotFound(new { error = "Session not found" });
        }

        var downloads = new List<object>();
        foreach (var match in session.PhotoMatches)
        {
            if (match.Photo == null) continue;
            
            var url = await _storageService.GetPresignedUrlAsync(match.Photo.S3Key, TimeSpan.FromHours(4));
            downloads.Add(new
            {
                photoId = match.PhotoId,
                fileName = match.Photo.FileName,
                downloadUrl = url
            });

            match.IsDownloaded = true;
        }

        await _context.SaveChangesAsync();

        return Ok(new { totalPhotos = downloads.Count, photos = downloads });
    }

    private static double CalculateFaceDistance(double[] encoding1, double[] encoding2)
    {
        if (encoding1.Length != encoding2.Length)
            return 1.0;

        double sum = 0;
        for (int i = 0; i < encoding1.Length; i++)
        {
            var diff = encoding1[i] - encoding2[i];
            sum += diff * diff;
        }
        return Math.Sqrt(sum);
    }
    private static string SanitizeForLog(string value)
    {
        // Normalize null to empty string
        var input = value ?? string.Empty;

        // Explicitly remove newline characters to prevent log forging
        input = input.Replace("\r", string.Empty)
                     .Replace("\n", string.Empty);

        // Remove any remaining control characters to prevent log forging
        var chars = input.Where(c => !char.IsControl(c)).ToArray();
        return new string(chars);
    }
}

// Response models
public class GuestJoinResponse
{
    public string SessionId { get; set; } = string.Empty;
    public string EventName { get; set; } = string.Empty;
    public DateTime? EventDate { get; set; }
    public string? Location { get; set; }
    public int TotalPhotos { get; set; }
    public bool IsProcessingComplete { get; set; }
}

public class SelfieUploadResponse
{
    public string SessionId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class PhotoMatchResponse
{
    public string SessionId { get; set; } = string.Empty;
    public int TotalMatches { get; set; }
    public List<PhotoMatchInfo> Photos { get; set; } = new();
}

public class PhotoMatchInfo
{
    public string PhotoId { get; set; } = string.Empty;
    public string ThumbnailUrl { get; set; } = string.Empty;
    public string FullUrl { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public DateTime UploadedAt { get; set; }
}
