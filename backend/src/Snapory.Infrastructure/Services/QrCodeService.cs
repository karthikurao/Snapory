using QRCoder;
using Snapory.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace Snapory.Infrastructure.Services;

public class QrCodeService : IQrCodeService
{
    private readonly ILogger<QrCodeService> _logger;
    private readonly string _baseUrl;

    public QrCodeService(ILogger<QrCodeService> logger, Microsoft.Extensions.Configuration.IConfiguration configuration)
    {
        _logger = logger;
        _baseUrl = configuration["App:BaseUrl"] ?? "https://snapory.app";
    }

    public async Task<string> GenerateQrCodeAsync(string eventId, string eventUrl, CancellationToken cancellationToken = default)
    {
        await Task.CompletedTask; // Make it async-compatible
        
        try
        {
            using var qrGenerator = new QRCodeGenerator();
            var qrCodeData = qrGenerator.CreateQrCode(eventUrl, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new PngByteQRCode(qrCodeData);
            var qrCodeBytes = qrCode.GetGraphic(20);
            
            // Convert to base64 string for storage/transmission
            var base64QrCode = Convert.ToBase64String(qrCodeBytes);
            _logger.LogInformation("Generated QR code for event {EventId}", eventId);
            
            return $"data:image/png;base64,{base64QrCode}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating QR code for event {EventId}", eventId);
            throw;
        }
    }

    public string GenerateEventUrl(string eventId)
    {
        return $"{_baseUrl}/guest/event/{eventId}";
    }
}
