using Snapory.Application.DTOs;
using Snapory.Domain.Entities;
using Snapory.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using BCrypt.Net;
using System.Security.Claims;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;

namespace Snapory.Application.Services;

public interface IPhotographerService
{
    Task<LoginResponse> RegisterAsync(RegisterPhotographerRequest request, CancellationToken cancellationToken = default);
    Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
}

public class PhotographerService : IPhotographerService
{
    private readonly IPhotographerRepository _photographerRepository;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PhotographerService> _logger;

    public PhotographerService(
        IPhotographerRepository photographerRepository,
        IConfiguration configuration,
        ILogger<PhotographerService> logger)
    {
        _photographerRepository = photographerRepository;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<LoginResponse> RegisterAsync(RegisterPhotographerRequest request, CancellationToken cancellationToken = default)
    {
        // Check if photographer already exists
        var existing = await _photographerRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existing != null)
        {
            throw new InvalidOperationException("Photographer with this email already exists");
        }

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var photographer = new Photographer
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            Name = request.Name,
            PhoneNumber = request.PhoneNumber
        };

        await _photographerRepository.CreateAsync(photographer, cancellationToken);

        _logger.LogInformation("Registered new photographer {PhotographerId}", photographer.Id);

        // Generate JWT token
        var token = GenerateJwtToken(photographer);

        return new LoginResponse
        {
            Token = token,
            PhotographerId = photographer.Id,
            Name = photographer.Name,
            Email = photographer.Email
        };
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var photographer = await _photographerRepository.GetByEmailAsync(request.Email, cancellationToken);
        
        if (photographer == null || !BCrypt.Net.BCrypt.Verify(request.Password, photographer.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Update last login
        photographer.LastLoginAt = DateTime.UtcNow;
        await _photographerRepository.UpdateAsync(photographer, cancellationToken);

        _logger.LogInformation("Photographer {PhotographerId} logged in", photographer.Id);

        // Generate JWT token
        var token = GenerateJwtToken(photographer);

        return new LoginResponse
        {
            Token = token,
            PhotographerId = photographer.Id,
            Name = photographer.Name,
            Email = photographer.Email
        };
    }

    private string GenerateJwtToken(Photographer photographer)
    {
        var secret = _configuration.GetValue<string>("JWT:Secret") ?? "change-this-secret-key-in-production";
        var expirationHours = _configuration.GetValue<int>("JWT:ExpirationHours", 24);

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(secret);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, photographer.Id),
                new Claim(ClaimTypes.Email, photographer.Email),
                new Claim(ClaimTypes.Name, photographer.Name),
                new Claim("role", "photographer")
            }),
            Expires = DateTime.UtcNow.AddHours(expirationHours),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
