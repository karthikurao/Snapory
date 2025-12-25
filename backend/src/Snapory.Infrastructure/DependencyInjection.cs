using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using StackExchange.Redis;
using Snapory.Domain.Interfaces;
using Snapory.Infrastructure.Configuration;
using Snapory.Infrastructure.Services;

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

        // Register Redis
        var redisConnectionString = configuration.GetValue<string>("Redis:ConnectionString") ?? "localhost:6379";
        services.AddSingleton<IConnectionMultiplexer>(sp =>
        {
            var configOptions = ConfigurationOptions.Parse(redisConnectionString);
            return ConnectionMultiplexer.Connect(configOptions);
        });

        // Register services
        services.AddScoped<IStorageService, S3StorageService>();
        services.AddScoped<IBackgroundJobService, RedisBackgroundJobService>();

        return services;
    }
}
