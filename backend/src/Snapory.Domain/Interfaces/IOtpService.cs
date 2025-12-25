using Snapory.Domain.Entities;

namespace Snapory.Domain.Interfaces;

public interface IOtpService
{
    Task<string> GenerateOtpAsync(string phoneNumber, string eventId, CancellationToken cancellationToken = default);
    Task<bool> VerifyOtpAsync(string phoneNumber, string eventId, string otpCode, CancellationToken cancellationToken = default);
    Task SendOtpAsync(string phoneNumber, string otpCode, CancellationToken cancellationToken = default);
}
