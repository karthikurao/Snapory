using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using Snapory.Domain.Interfaces;
using Snapory.Infrastructure.Configuration;
using Snapory.Infrastructure.Services;
using Snapory.Infrastructure.Data;
using Snapory.Infrastructure.Repositories;

namespace Snapory.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure settings
        services.Configure<S3Settings>(configuration.GetSection("S3"));
        services.Configure<RedisSettings>(configuration.GetSection("Redis"));
        services.Configure<JwtSettings>(configuration.GetSection("JWT"));
        services.Configure<AiServiceSettings>(configuration.GetSection("AiService"));

        // Register Database
        var connectionString = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=snapory.db";
        services.AddDbContext<SnaporyDbContext>(options =>
            options.UseSqlite(connectionString));

        // Register Redis
        var redisConnectionString = configuration.GetValue<string>("Redis:ConnectionString") ?? "localhost:6379";
        services.AddSingleton<IConnectionMultiplexer>(sp =>
        {
            var configOptions = ConfigurationOptions.Parse(redisConnectionString);
            return ConnectionMultiplexer.Connect(configOptions);
        });

        // Register HttpClient for AI Service
        var aiServiceBaseUrl = configuration.GetValue<string>("AiService:BaseUrl") ?? "http://ai-service:8000";
        services.AddHttpClient("AiService", client =>
        {
            client.BaseAddress = new Uri(aiServiceBaseUrl);
            client.Timeout = TimeSpan.FromMinutes(5);
        });

        // Register repositories
        services.AddScoped<IEventRepository, EventRepository>();
        services.AddScoped<IPhotoRepository, PhotoRepository>();
        services.AddScoped<IGuestRepository, GuestRepository>();
        services.AddScoped<IPhotographerRepository, PhotographerRepository>();

        // Register services
        services.AddScoped<IStorageService, S3StorageService>();
        services.AddScoped<IBackgroundJobService, RedisBackgroundJobService>();
        services.AddScoped<IQrCodeService, QrCodeService>();
        services.AddScoped<IOtpService, OtpService>();
        services.AddScoped<IFaceRecognitionService, FaceRecognitionService>();

        return services;
    }
}

