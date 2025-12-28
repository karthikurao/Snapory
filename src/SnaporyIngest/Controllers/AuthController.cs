using Microsoft.AspNetCore.Mvc;
using SnaporyIngest.Middleware;
using SnaporyIngest.Models;
using SnaporyIngest.Services;

namespace SnaporyIngest.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var response = await _authService.RegisterAsync(request);
        if (response == null)
        {
            return Conflict(new { error = "Email already registered" });
        }

        return CreatedAtAction(nameof(GetProfile), new { }, response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var response = await _authService.LoginAsync(request);
        if (response == null)
        {
            return Unauthorized(new { error = "Invalid email or password" });
        }

        return Ok(response);
    }

    [HttpGet("profile")]
    [Authorize]
    public ActionResult<object> GetProfile()
    {
        var user = HttpContext.GetUser<User>();
        if (user == null)
        {
            return Unauthorized();
        }

        return Ok(new
        {
            userId = user.UserId,
            email = user.Email,
            name = user.Name,
            companyName = user.CompanyName,
            createdAt = user.CreatedAt,
            lastLoginAt = user.LastLoginAt
        });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = HttpContext.GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var success = await _authService.ChangePasswordAsync(userId, request);
        if (!success)
        {
            return BadRequest(new { error = "Invalid current password" });
        }

        return Ok(new { message = "Password changed successfully" });
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        await _authService.InitiateForgotPasswordAsync(request.Email);
        
        // Always return success to not reveal if email exists
        return Ok(new { message = "If the email exists, a password reset link has been sent" });
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var success = await _authService.ResetPasswordAsync(request);
        if (!success)
        {
            return BadRequest(new { error = "Invalid or expired reset token" });
        }

        return Ok(new { message = "Password reset successfully" });
    }
}
