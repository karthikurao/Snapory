using Amazon.S3;
using Amazon.S3.Model;
using Amazon.Runtime;
using Microsoft.Extensions.Options;
using Snapory.Domain.Interfaces;
using Snapory.Infrastructure.Configuration;

namespace Snapory.Infrastructure.Services;

public class S3StorageService : IStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly S3Settings _settings;
    private readonly ILogger<S3StorageService> _logger;

    public S3StorageService(
        IOptions<S3Settings> settings,
        ILogger<S3StorageService> logger)
    {
        _settings = settings.Value;
        _logger = logger;

        var config = new AmazonS3Config
        {
            ServiceURL = _settings.Endpoint,
            ForcePathStyle = true,
            UseHttp = !_settings.UseSSL
        };

        var credentials = new BasicAWSCredentials(_settings.AccessKey, _settings.SecretKey);
        _s3Client = new AmazonS3Client(credentials, config);
    }

    public async Task<string> UploadPhotoAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var key = $"photos/{DateTime.UtcNow:yyyy/MM/dd}/{Guid.NewGuid()}/{fileName}";

            var request = new PutObjectRequest
            {
                BucketName = _settings.BucketName,
                Key = key,
                InputStream = fileStream,
                ContentType = contentType,
                CannedACL = S3CannedACL.Private
            };

            var response = await _s3Client.PutObjectAsync(request, cancellationToken);

            if (response.HttpStatusCode != System.Net.HttpStatusCode.OK)
            {
                throw new Exception($"Failed to upload file to S3. Status: {response.HttpStatusCode}");
            }

            _logger.LogInformation("File uploaded to S3 with key: {Key}", key);
            return key;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to S3");
            throw;
        }
    }

    public async Task<string> GetPhotoUrlAsync(string storageKey, int expirationMinutes = 60)
    {
        try
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _settings.BucketName,
                Key = storageKey,
                Expires = DateTime.UtcNow.AddMinutes(expirationMinutes)
            };

            var url = await _s3Client.GetPreSignedURLAsync(request);
            return url;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating pre-signed URL for key: {Key}", storageKey);
            throw;
        }
    }

    public async Task<bool> DeletePhotoAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new DeleteObjectRequest
            {
                BucketName = _settings.BucketName,
                Key = storageKey
            };

            var response = await _s3Client.DeleteObjectAsync(request, cancellationToken);
            
            _logger.LogInformation("File deleted from S3: {Key}", storageKey);
            return response.HttpStatusCode == System.Net.HttpStatusCode.NoContent;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from S3: {Key}", storageKey);
            return false;
        }
    }
}
