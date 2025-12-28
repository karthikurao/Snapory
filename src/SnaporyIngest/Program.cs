using Amazon.S3;
using Amazon.Runtime;
using Microsoft.EntityFrameworkCore;
using SnaporyIngest.Data;
using SnaporyIngest.Services;
using SnaporyIngest.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                builder.Configuration["Cors:Origins"]?.Split(',') ?? new[] { "http://localhost:3000", "http://localhost:3001" })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Configure database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=snapory.db";
builder.Services.AddDbContext<SnaporyContext>(options =>
    options.UseSqlite(connectionString));

// Configure S3 client
var s3Config = new AmazonS3Config
{
    ServiceURL = builder.Configuration["S3:ServiceUrl"] ?? "https://s3.gra.io.cloud.ovh.net",
    ForcePathStyle = true
};

var accessKey = builder.Configuration["S3:AccessKey"] ?? "demo";
var secretKey = builder.Configuration["S3:SecretKey"] ?? "demo";
var credentials = new BasicAWSCredentials(accessKey, secretKey);

builder.Services.AddSingleton<IAmazonS3>(new AmazonS3Client(credentials, s3Config));
builder.Services.AddScoped<IS3StorageService, S3StorageService>();

// Register authentication services
builder.Services.AddScoped<IAuthService, AuthService>();

// Register AI processing services
builder.Services.AddHttpClient<IAiProcessingService, AiProcessingService>();

// Register thumbnail service
builder.Services.AddScoped<IThumbnailService, ThumbnailService>();

// Register background processing service
builder.Services.AddHostedService<PhotoProcessingBackgroundService>();

// Configure logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

var app = builder.Build();

// Initialize database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<SnaporyContext>();
    context.Database.EnsureCreated();
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");

// Add JWT authentication middleware
app.UseMiddleware<JwtMiddleware>();

app.UseRouting();
app.MapControllers();

app.Run();
