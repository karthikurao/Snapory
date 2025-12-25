using Microsoft.AspNetCore.Mvc;
using Snapory.Application.DTOs;
using Snapory.Application.Services;

namespace Snapory.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly IEventService _eventService;
    private readonly ILogger<EventsController> _logger;

    public EventsController(IEventService eventService, ILogger<EventsController> logger)
    {
        _eventService = eventService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new event
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CreateEventResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateEventResponse>> CreateEvent(
        [FromBody] CreateEventRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            // TODO: Get photographerId from JWT claims
            var photographerId = "temp-photographer-id"; // For MVP, using temp ID
            
            var result = await _eventService.CreateEventAsync(request, photographerId, cancellationToken);
            return CreatedAtAction(nameof(GetEvent), new { eventId = result.EventId }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating event");
            return StatusCode(500, new { error = "An error occurred while creating the event" });
        }
    }

    /// <summary>
    /// Get event details
    /// </summary>
    [HttpGet("{eventId}")]
    [ProducesResponseType(typeof(EventDetailsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EventDetailsResponse>> GetEvent(
        string eventId,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _eventService.GetEventDetailsAsync(eventId, cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Event not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting event {EventId}", eventId);
            return StatusCode(500, new { error = "An error occurred while retrieving the event" });
        }
    }

    /// <summary>
    /// Get events for current photographer
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<EventResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<EventResponse>>> GetPhotographerEvents(
        CancellationToken cancellationToken)
    {
        try
        {
            // TODO: Get photographerId from JWT claims
            var photographerId = "temp-photographer-id"; // For MVP, using temp ID
            
            var result = await _eventService.GetPhotographerEventsAsync(photographerId, cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting photographer events");
            return StatusCode(500, new { error = "An error occurred while retrieving events" });
        }
    }

    /// <summary>
    /// Delete an event
    /// </summary>
    [HttpDelete("{eventId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteEvent(
        string eventId,
        CancellationToken cancellationToken)
    {
        try
        {
            // TODO: Get photographerId from JWT claims
            var photographerId = "temp-photographer-id"; // For MVP, using temp ID
            
            await _eventService.DeleteEventAsync(eventId, photographerId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Event not found" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting event {EventId}", eventId);
            return StatusCode(500, new { error = "An error occurred while deleting the event" });
        }
    }
}
