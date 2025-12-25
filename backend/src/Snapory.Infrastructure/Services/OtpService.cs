using Microsoft.Extensions.Logging;
using Snapory.Domain.Entities;
using Snapory.Domain.Interfaces;
using Snapory.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Snapory.Infrastructure.Services;

public class OtpService : IOtpService
{
    private readonly SnaporyDbContext _context;
    private readonly ILogger<OtpService> _logger;
    private const int OTP_LENGTH = 6;
    private const int OTP_EXPIRY_MINUTES = 10;
    private const int MAX_ATTEMPTS = 3;

    public OtpService(SnaporyDbContext context, ILogger<OtpService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<string> GenerateOtpAsync(string phoneNumber, string eventId, CancellationToken cancellationToken = default)
    {
        // Generate random OTP
        var random = new Random();
        var otpCode = random.Next(100000, 999999).ToString();

        // Create OTP record
        var otpVerification = new OtpVerification
        {
            PhoneNumber = phoneNumber,
            EventId = eventId,
            OtpCode = otpCode,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(OTP_EXPIRY_MINUTES),
            IsUsed = false,
            AttemptCount = 0
        };

        _context.OtpVerifications.Add(otpVerification);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Generated OTP for phone {PhoneNumber} and event {EventId}", phoneNumber, eventId);
        
        return otpCode;
    }

    public async Task<bool> VerifyOtpAsync(string phoneNumber, string eventId, string otpCode, CancellationToken cancellationToken = default)
    {
        var otpVerification = await _context.OtpVerifications
            .Where(o => o.PhoneNumber == phoneNumber 
                     && o.EventId == eventId 
                     && !o.IsUsed 
                     && o.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (otpVerification == null)
        {
            _logger.LogWarning("No valid OTP found for phone {PhoneNumber} and event {EventId}", phoneNumber, eventId);
            return false;
        }

        // Increment attempt count
        otpVerification.AttemptCount++;

        if (otpVerification.AttemptCount > MAX_ATTEMPTS)
        {
            _logger.LogWarning("Max attempts exceeded for OTP verification. Phone: {PhoneNumber}, Event: {EventId}", phoneNumber, eventId);
            await _context.SaveChangesAsync(cancellationToken);
            return false;
        }

        if (otpVerification.OtpCode != otpCode)
        {
            _logger.LogWarning("Invalid OTP code provided. Phone: {PhoneNumber}, Event: {EventId}", phoneNumber, eventId);
            await _context.SaveChangesAsync(cancellationToken);
            return false;
        }

        // Mark as used
        otpVerification.IsUsed = true;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("OTP verified successfully for phone {PhoneNumber} and event {EventId}", phoneNumber, eventId);
        return true;
    }

    public async Task SendOtpAsync(string phoneNumber, string otpCode, CancellationToken cancellationToken = default)
    {
        // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
        // For MVP, just log the OTP
        await Task.CompletedTask;
        _logger.LogInformation("OTP to send to {PhoneNumber}: {OtpCode}", phoneNumber, otpCode);
        
        // In production, implement actual SMS sending:
        // await _smsService.SendAsync(phoneNumber, $"Your Snapory verification code is: {otpCode}");
    }
}
