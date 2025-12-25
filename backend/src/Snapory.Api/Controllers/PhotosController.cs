using Microsoft.AspNetCore.Mvc;
using Snapory.Application.DTOs;
using Snapory.Application.Services;

namespace Snapory.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PhotosController : ControllerBase
{
    private readonly IPhotoService _photoService;
    private readonly ILogger<PhotosController> _logger;

    public PhotosController(IPhotoService photoService, ILogger<PhotosController> logger)
    {
        _photoService = photoService;
        _logger = logger;
    }

    /// <summary>
    /// Upload a photo
    /// </summary>
    [HttpPost("upload")]
    [ProducesResponseType(typeof(PhotoUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PhotoUploadResponse>> UploadPhoto(
        [FromForm] IFormFile file,
        [FromForm] string? eventId,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _photoService.UploadPhotoAsync(file, eventId, cancellationToken);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid upload request");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading photo");
            return StatusCode(500, new { error = "An error occurred while uploading the photo" });
        }
    }

    /// <summary>
    /// Get photo by ID
    /// </summary>
    [HttpGet("{photoId}")]
    [ProducesResponseType(typeof(PhotoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PhotoResponse>> GetPhoto(Guid photoId, CancellationToken cancellationToken)
    {
        var photo = await _photoService.GetPhotoAsync(photoId, cancellationToken);
        
        if (photo == null)
        {
            return NotFound(new { error = "Photo not found" });
        }

        return Ok(photo);
    }

    /// <summary>
    /// Get photos for an event
    /// </summary>
    [HttpGet("event/{eventId}")]
    [ProducesResponseType(typeof(IEnumerable<PhotoResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PhotoResponse>>> GetEventPhotos(
        string eventId,
        CancellationToken cancellationToken)
    {
        var photos = await _photoService.GetEventPhotosAsync(eventId, cancellationToken);
        return Ok(photos);
    }
}
