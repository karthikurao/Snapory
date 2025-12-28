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
        return await UploadToS3Async(fileStream, s3Key, contentType, cancellationToken);
    }

    public async Task<string> UploadSelfieAsync(Stream fileStream, string sessionId, string contentType, CancellationToken cancellationToken = default)
    {
        var extension = contentType.Contains("png") ? "png" : "jpg";
        var s3Key = $"selfies/{sessionId}/selfie.{extension}";
        return await UploadToS3Async(fileStream, s3Key, contentType, cancellationToken);
    }

    public async Task<string> UploadThumbnailAsync(Stream fileStream, string photoId, string contentType, CancellationToken cancellationToken = default)
    {
        var extension = contentType.Contains("png") ? "png" : "jpg";
        var s3Key = $"thumbnails/{DateTime.UtcNow:yyyy/MM}/{photoId}.{extension}";
        return await UploadToS3Async(fileStream, s3Key, contentType, cancellationToken);
    }

    private async Task<string> UploadToS3Async(Stream fileStream, string s3Key, string contentType, CancellationToken cancellationToken)
    {
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
                
                if ((int)response.HttpStatusCode >= 200 && (int)response.HttpStatusCode < 300)
                {
                    _logger.LogInformation("Successfully uploaded to S3: {S3Key}", s3Key);
                    return s3Key;
                }
                
                throw new Exception($"S3 upload failed with status code: {response.HttpStatusCode}");
            }
            catch (Exception ex)
            {
                retryCount++;
                _logger.LogWarning(ex, "Failed to upload to S3 (attempt {RetryCount}/{MaxRetries}): {S3Key}", 
                    retryCount, maxRetries, s3Key);
                
                if (retryCount >= maxRetries)
                {
                    _logger.LogError(ex, "Failed to upload to S3 after {MaxRetries} attempts: {S3Key}", 
                        maxRetries, s3Key);
                    throw;
                }
                
                await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, retryCount)), cancellationToken);
                if (fileStream.CanSeek)
                    fileStream.Position = 0;
            }
        }
        
        throw new Exception("Failed to upload to S3 after exhausting all retries");
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
            _logger.LogInformation("Successfully deleted from S3: {S3Key}", s3Key);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete from S3: {S3Key}", s3Key);
            return false;
        }
    }

    public async Task<string> GetPresignedUrlAsync(string s3Key, TimeSpan expiry, CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = s3Key,
                Expires = DateTime.UtcNow.Add(expiry),
                Verb = HttpVerb.GET
            };

            var url = await Task.Run(() => _s3Client.GetPreSignedURL(request), cancellationToken);
            return url;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate presigned URL for: {S3Key}", s3Key);
            throw;
        }
    }

    public async Task<Stream?> GetPhotoStreamAsync(string s3Key, CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new GetObjectRequest
            {
                BucketName = _bucketName,
                Key = s3Key
            };

            var response = await _s3Client.GetObjectAsync(request, cancellationToken);
            return response.ResponseStream;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get photo stream from S3: {S3Key}", s3Key);
            return null;
        }
    }
}
