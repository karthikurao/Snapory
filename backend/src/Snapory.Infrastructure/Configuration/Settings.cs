namespace Snapory.Infrastructure.Configuration;

public class S3Settings
{
    public string Endpoint { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string BucketName { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public bool UseSSL { get; set; } = true;
}

public class RedisSettings
{
    public string ConnectionString { get; set; } = "localhost:6379";
}

public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public int ExpirationHours { get; set; } = 24;
}

public class AiServiceSettings
{
    public string BaseUrl { get; set; } = "http://localhost:8000";
}
