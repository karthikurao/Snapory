using Microsoft.AspNetCore.Mvc;
using Snapory.Application.DTOs;
using Snapory.Application.Services;

namespace Snapory.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PhotographersController : ControllerBase
{
    private readonly IPhotographerService _photographerService;
    private readonly ILogger<PhotographersController> _logger;

    public PhotographersController(
        IPhotographerService photographerService,
        ILogger<PhotographersController> logger)
    {
        _photographerService = photographerService;
        _logger = logger;
    }

    /// <summary>
    /// Register a new photographer
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LoginResponse>> Register(
        [FromBody] RegisterPhotographerRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _photographerService.RegisterAsync(request, cancellationToken);
            return CreatedAtAction(nameof(Register), result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering photographer");
            return StatusCode(500, new { error = "An error occurred during registration" });
        }
    }

    /// <summary>
    /// Login a photographer
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoginResponse>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _photographerService.LoginAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, new { error = "An error occurred during login" });
        }
    }
}
