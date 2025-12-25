using Amazon.S3;
using Amazon.Runtime;
using Microsoft.EntityFrameworkCore;
using SnaporyIngest.Data;
using SnaporyIngest.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

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

app.UseRouting();
app.MapControllers();

app.Run();
