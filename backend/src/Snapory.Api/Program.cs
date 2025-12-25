using Snapory.Application;
using Snapory.Infrastructure;
using Snapory.Infrastructure.Data;
using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Snapory API",
        Version = "v1",
        Description = "Real-time event photo platform API",
        Contact = new OpenApiContact
        {
            Name = "Snapory",
            Url = new Uri("https://github.com/karthikurao/Snapory")
        }
    });
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var origins = builder.Configuration.GetValue<string>("CORS_ORIGINS")?.Split(',')
            ?? new[] { "http://localhost:3000" };
        
        policy.WithOrigins(origins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Add health checks
builder.Services.AddHealthChecks()
    .AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy())
    .AddRedis(
        builder.Configuration.GetValue<string>("Redis:ConnectionString") ?? "localhost:6379",
        name: "redis",
        timeout: TimeSpan.FromSeconds(3));

// Add application layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

// Run database migrations
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<SnaporyDbContext>();
    dbContext.Database.EnsureCreated();
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Snapory API V1");
    });
}

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.MapHealthChecks("/health");

app.Run();
