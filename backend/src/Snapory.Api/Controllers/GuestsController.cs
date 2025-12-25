using Microsoft.AspNetCore.Mvc;
using Snapory.Application.DTOs;
using Snapory.Application.Services;

namespace Snapory.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GuestsController : ControllerBase
{
    private readonly IGuestService _guestService;
    private readonly ILogger<GuestsController> _logger;

    public GuestsController(IGuestService guestService, ILogger<GuestsController> logger)
    {
        _guestService = guestService;
        _logger = logger;
    }

    /// <summary>
    /// Send OTP to guest phone number
    /// </summary>
    [HttpPost("send-otp")]
    [ProducesResponseType(typeof(SendOtpResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SendOtpResponse>> SendOtp(
        [FromBody] SendOtpRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _guestService.SendOtpAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending OTP");
            return StatusCode(500, new { error = "An error occurred while sending OTP" });
        }
    }

    /// <summary>
    /// Verify OTP and register guest with selfie
    /// </summary>
    [HttpPost("verify-and-register")]
    [ProducesResponseType(typeof(VerifyOtpResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<VerifyOtpResponse>> VerifyAndRegister(
        [FromForm] string phoneNumber,
        [FromForm] string eventId,
        [FromForm] string otpCode,
        [FromForm] IFormFile selfie,
        CancellationToken cancellationToken)
    {
        try
        {
            if (selfie == null || selfie.Length == 0)
            {
                return BadRequest(new { error = "Selfie is required" });
            }

            var request = new VerifyOtpRequest
            {
                PhoneNumber = phoneNumber,
                EventId = eventId,
                OtpCode = otpCode
            };

            using var selfieStream = selfie.OpenReadStream();
            var result = await _guestService.VerifyOtpAndRegisterAsync(request, selfieStream, cancellationToken);
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying OTP and registering guest");
            return StatusCode(500, new { error = "An error occurred during registration" });
        }
    }

    /// <summary>
    /// Get photos for a guest
    /// </summary>
    [HttpGet("{eventId}/photos/{guestId}")]
    [ProducesResponseType(typeof(IEnumerable<PhotoResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IEnumerable<PhotoResponse>>> GetGuestPhotos(
        string eventId,
        Guid guestId,
        CancellationToken cancellationToken)
    {
        try
        {
            var photos = await _guestService.GetGuestPhotosAsync(eventId, guestId, cancellationToken);
            return Ok(photos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting guest photos");
            return StatusCode(500, new { error = "An error occurred while retrieving photos" });
        }
    }
}
