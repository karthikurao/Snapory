# Snapory

Event photo ingestion service for photographers.

## Overview

Snapory Ingest is a backend API service that allows photographers to create events and upload high-quality photos to S3-compatible object storage (OVH). It stores metadata in a SQLite database and provides secure access to uploaded photos.

## Features

- ✅ Create events with unique event IDs and upload tokens
- ✅ Upload multiple photos to S3-compatible storage (OVH)
- ✅ Store photo metadata in SQLite database
- ✅ Health check endpoint
- ✅ Async upload handling with retry logic
- ✅ Environment-based configuration
- ✅ Docker and Docker Compose support
- ✅ Comprehensive logging

## API Endpoints

### Health Check
```
GET /health
```
Returns health status of the service.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-25T10:00:00Z"
}
```

### Create Event
```
POST /events
Content-Type: application/json

{
  "name": "Wedding - John & Jane",
  "description": "Wedding ceremony and reception"
}
```

**Response:**
```json
{
  "eventId": "abc123",
  "uploadToken": "xyz789",
  "createdAt": "2025-12-25T10:00:00Z"
}
```

### Upload Photos
```
POST /events/{eventId}/photos
X-Upload-Token: xyz789
Content-Type: multipart/form-data

files: [photo1.jpg, photo2.jpg, ...]
```

**Response:**
```json
{
  "photos": [
    {
      "photoId": "photo123",
      "fileName": "photo1.jpg",
      "fileSize": 2048576,
      "uploadedAt": "2025-12-25T10:05:00Z"
    }
  ]
}
```

### Get Event
```
GET /events/{eventId}
```

**Response:**
```json
{
  "eventId": "abc123",
  "name": "Wedding - John & Jane",
  "description": "Wedding ceremony and reception",
  "createdAt": "2025-12-25T10:00:00Z",
  "uploadToken": "xyz789",
  "photos": [...]
}
```

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed
- OVH S3 credentials (or use local MinIO for testing)

### Local Development with MinIO

1. Clone the repository:
```bash
git clone https://github.com/karthikurao/Snapory.git
cd Snapory
```

2. Copy the environment example file:
```bash
cp .env.example .env
```

3. Edit `.env` and configure for MinIO (for local testing):
```env
S3_SERVICE_URL=http://minio:9000
S3_BUCKET_NAME=snapory-photos
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
```

4. Start the services:
```bash
docker-compose up -d
```

5. Create the bucket in MinIO:
   - Open http://localhost:9001 in your browser
   - Login with minioadmin/minioadmin
   - Create a bucket named `snapory-photos`

6. The API will be available at http://localhost:8080

### Production with OVH S3

1. Edit `.env` with your OVH S3 credentials:
```env
S3_SERVICE_URL=https://s3.gra.io.cloud.ovh.net
S3_BUCKET_NAME=snapory-photos
S3_ACCESS_KEY=your-ovh-access-key
S3_SECRET_KEY=your-ovh-secret-key
```

2. Start the service:
```bash
docker-compose up -d snapory-ingest
```

## Testing with curl

### 1. Health Check
```bash
curl http://localhost:8080/health
```

### 2. Create an Event
```bash
curl -X POST http://localhost:8080/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Event",
    "description": "My first test event"
  }'
```

Save the `eventId` and `uploadToken` from the response.

### 3. Upload Photos
```bash
curl -X POST http://localhost:8080/events/{eventId}/photos \
  -H "X-Upload-Token: {uploadToken}" \
  -F "files=@photo1.jpg" \
  -F "files=@photo2.jpg" \
  -F "files=@photo3.jpg"
```

### 4. Get Event Details
```bash
curl http://localhost:8080/events/{eventId}
```

## Testing with Postman

A Postman collection is available in the repository: `postman_collection.json`

Import it into Postman and:
1. Set the `baseUrl` variable to `http://localhost:8080`
2. Run the requests in order

## Configuration

Configuration can be set via:
- `appsettings.json` file
- Environment variables (recommended for Docker)
- `.env` file (for docker-compose)

### Key Configuration Options

| Setting | Environment Variable | Default | Description |
|---------|---------------------|---------|-------------|
| S3 Service URL | `S3__ServiceUrl` | `https://s3.gra.io.cloud.ovh.net` | S3-compatible endpoint |
| S3 Bucket Name | `S3__BucketName` | `snapory-photos` | Bucket for photo storage |
| S3 Access Key | `S3__AccessKey` | - | S3 access key |
| S3 Secret Key | `S3__SecretKey` | - | S3 secret key |
| Database | `ConnectionStrings__DefaultConnection` | `Data Source=snapory.db` | SQLite database path |

## Architecture

- **ASP.NET Core 9.0**: Web API framework
- **Entity Framework Core 9.0**: ORM for database access
- **SQLite**: Lightweight database for metadata
- **AWS SDK for .NET**: S3-compatible storage client
- **Docker**: Containerization
- **MinIO**: Optional local S3-compatible storage for development

## File Upload Constraints

- **Max file size**: 50 MB per file
- **Supported formats**: JPEG, JPG, PNG, HEIC, HEIF
- **Multiple uploads**: Supported in a single request
- **Retry logic**: 3 attempts with exponential backoff

## Logging

The service logs to console with the following levels:
- Information: Normal operations, photo uploads
- Warning: Validation failures, skipped files
- Error: Upload failures, critical errors

## Development

### Build Locally
```bash
cd src/SnaporyIngest
dotnet build
dotnet run
```

### Run Tests
```bash
dotnet test
```

## License

See LICENSE file for details.

## Success Criteria

✅ You can upload 50 photos to an event and see them stored correctly in cloud storage with metadata saved.

## Future Enhancements

- Photo processing (thumbnails, compression)
- Attendee photo access with face recognition
- Event sharing and gallery views
- Photo download and sharing features
