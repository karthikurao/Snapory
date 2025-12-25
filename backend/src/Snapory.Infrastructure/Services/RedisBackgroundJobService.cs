using System.Text.Json;
using Microsoft.Extensions.Options;
using StackExchange.Redis;
using Snapory.Domain.Interfaces;
using Snapory.Infrastructure.Configuration;

namespace Snapory.Infrastructure.Services;

public class RedisBackgroundJobService : IBackgroundJobService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<RedisBackgroundJobService> _logger;
    private const string JobQueueKey = "snapory:photo-processing-queue";

    public RedisBackgroundJobService(
        IConnectionMultiplexer redis,
        ILogger<RedisBackgroundJobService> logger)
    {
        _redis = redis;
        _logger = logger;
    }

    public async Task EnqueuePhotoProcessingAsync(Guid photoId, string storageKey, CancellationToken cancellationToken = default)
    {
        try
        {
            var db = _redis.GetDatabase();
            
            var job = new PhotoProcessingJob
            {
                PhotoId = photoId,
                StorageKey = storageKey,
                EnqueuedAt = DateTime.UtcNow
            };

            var jobJson = JsonSerializer.Serialize(job);
            await db.ListRightPushAsync(JobQueueKey, jobJson);

            _logger.LogInformation("Photo processing job enqueued for photo {PhotoId}", photoId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enqueuing photo processing job for photo {PhotoId}", photoId);
            throw;
        }
    }

    public async Task<long> GetQueueLengthAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var db = _redis.GetDatabase();
            return await db.ListLengthAsync(JobQueueKey);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting queue length");
            return 0;
        }
    }

    private class PhotoProcessingJob
    {
        public Guid PhotoId { get; set; }
        public string StorageKey { get; set; } = string.Empty;
        public DateTime EnqueuedAt { get; set; }
    }
}
