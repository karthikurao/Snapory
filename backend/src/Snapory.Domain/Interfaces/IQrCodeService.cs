namespace Snapory.Domain.Interfaces;

public interface IQrCodeService
{
    Task<string> GenerateQrCodeAsync(string eventId, string eventUrl, CancellationToken cancellationToken = default);
    string GenerateEventUrl(string eventId);
}
