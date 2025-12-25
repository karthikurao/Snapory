# Snapory Backend - ASP.NET Core Web API

## Overview

This is the backend API for Snapory, built with ASP.NET Core 8.0 following Clean Architecture principles.

## Architecture

The solution follows Clean Architecture with clear separation of concerns:

- **Snapory.Api**: API layer with controllers and middleware
- **Snapory.Application**: Application layer with business logic and DTOs
- **Snapory.Domain**: Domain layer with entities and interfaces
- **Snapory.Infrastructure**: Infrastructure layer with external service implementations

## Prerequisites

- .NET 8.0 SDK
- Redis (for background jobs)
- OVH S3-compatible storage account

## Getting Started

### 1. Restore Dependencies

```bash
dotnet restore
```

### 2. Configure Settings

Update `appsettings.json` or set environment variables:

- S3 credentials and endpoint
- Redis connection string
- JWT secret

### 3. Build

```bash
dotnet build
```

### 4. Run

```bash
dotnet run --project src/Snapory.Api/Snapory.Api.csproj
```

API will be available at http://localhost:5000

## API Endpoints

### Photos

- `POST /api/photos/upload` - Upload a photo
- `GET /api/photos/{photoId}` - Get photo by ID
- `GET /api/photos/event/{eventId}` - Get photos for an event

### Health

- `GET /health` - Health check endpoint

## Docker

Build and run with Docker:

```bash
docker build -t snapory-api .
docker run -p 5000:5000 snapory-api
```

## Testing

```bash
dotnet test
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ASPNETCORE_ENVIRONMENT` | Environment (Development/Production) |
| `ASPNETCORE_URLS` | URLs to listen on |
| `S3__Endpoint` | S3 endpoint URL |
| `S3__AccessKey` | S3 access key |
| `S3__SecretKey` | S3 secret key |
| `Redis__ConnectionString` | Redis connection string |
