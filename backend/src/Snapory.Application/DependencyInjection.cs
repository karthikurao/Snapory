using Microsoft.Extensions.DependencyInjection;
using Snapory.Application.Services;

namespace Snapory.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IPhotoService, PhotoService>();
        services.AddScoped<IEventService, EventService>();
        services.AddScoped<IGuestService, GuestService>();
        services.AddScoped<IPhotographerService, PhotographerService>();
        
        return services;
    }
}
