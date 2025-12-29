using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;

namespace SnaporyIngest.Services;

public interface IThumbnailService
{
    Task<Stream?> GenerateThumbnailAsync(Stream imageStream, int maxWidth, int maxHeight);
}

public class ThumbnailService : IThumbnailService
{
    private readonly ILogger<ThumbnailService> _logger;

    public ThumbnailService(ILogger<ThumbnailService> logger)
    {
        _logger = logger;
    }

    public async Task<Stream?> GenerateThumbnailAsync(Stream imageStream, int maxWidth, int maxHeight)
    {
        try
        {
            using var image = await Image.LoadAsync(imageStream);

            // Calculate new dimensions maintaining aspect ratio
            var ratioX = (double)maxWidth / image.Width;
            var ratioY = (double)maxHeight / image.Height;
            var ratio = Math.Min(ratioX, ratioY);

            var newWidth = (int)(image.Width * ratio);
            var newHeight = (int)(image.Height * ratio);

            image.Mutate(x => x.Resize(newWidth, newHeight));

            var outputStream = new MemoryStream();
            await image.SaveAsJpegAsync(outputStream, new JpegEncoder { Quality = 80 });
            outputStream.Position = 0;

            return outputStream;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate thumbnail");
            return null;
        }
    }
}
