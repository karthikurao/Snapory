using Microsoft.Extensions.DependencyInjection;
using Snapory.Application.Services;

namespace Snapory.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IPhotoService, PhotoService>();
        
        return services;
    }
}
