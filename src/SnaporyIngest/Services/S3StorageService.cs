using Amazon.S3;
using Amazon.S3.Model;

namespace SnaporyIngest.Services;

public class S3StorageService : IS3StorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly IConfiguration _configuration;
    private readonly ILogger<S3StorageService> _logger;
    private readonly string _bucketName;

    public S3StorageService(IAmazonS3 s3Client, IConfiguration configuration, ILogger<S3StorageService> logger)
    {
        _s3Client = s3Client;
        _configuration = configuration;
        _logger = logger;
        _bucketName = _configuration["S3:BucketName"] ?? throw new InvalidOperationException("S3 bucket name not configured");
    }

    public async Task<string> UploadPhotoAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        var s3Key = $"photos/{DateTime.UtcNow:yyyy/MM/dd}/{Guid.NewGuid()}/{fileName}";
        
        var maxRetries = 3;
        var retryCount = 0;
        
        while (retryCount < maxRetries)
        {
            try
            {
                var request = new PutObjectRequest
                {
                    BucketName = _bucketName,
                    Key = s3Key,
                    InputStream = fileStream,
                    ContentType = contentType,
                    AutoCloseStream = false
                };

                var response = await _s3Client.PutObjectAsync(request, cancellationToken);
                
                if (response.HttpStatusCode == System.Net.HttpStatusCode.OK)
                {
                    _logger.LogInformation("Successfully uploaded photo to S3: {S3Key}", s3Key);
                    return s3Key;
                }
                
                throw new Exception($"S3 upload failed with status code: {response.HttpStatusCode}");
            }
            catch (Exception ex)
            {
                retryCount++;
                _logger.LogWarning(ex, "Failed to upload photo to S3 (attempt {RetryCount}/{MaxRetries}): {S3Key}", 
                    retryCount, maxRetries, s3Key);
                
                if (retryCount >= maxRetries)
                {
                    _logger.LogError(ex, "Failed to upload photo to S3 after {MaxRetries} attempts: {S3Key}", 
                        maxRetries, s3Key);
                    throw;
                }
                
                await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, retryCount)), cancellationToken);
                fileStream.Position = 0;
            }
        }
        
        throw new Exception("Unexpected error during S3 upload");
    }

    public async Task<bool> DeletePhotoAsync(string s3Key, CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new DeleteObjectRequest
            {
                BucketName = _bucketName,
                Key = s3Key
            };

            await _s3Client.DeleteObjectAsync(request, cancellationToken);
            _logger.LogInformation("Successfully deleted photo from S3: {S3Key}", s3Key);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete photo from S3: {S3Key}", s3Key);
            return false;
        }
    }
}
