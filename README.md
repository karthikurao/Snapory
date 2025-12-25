# Snapory 📸

> A real-time event photo platform for capturing and sharing memories instantly.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🎯 Overview

Snapory is a production-ready MVP for a real-time event photo platform that enables seamless photo uploading, AI-powered processing, and instant sharing at events. Built with modern cloud-native technologies and designed for scalability.

## 🏗️ Architecture

```
┌─────────────┐
│   Nginx     │  (Reverse Proxy)
└──────┬──────┘
       │
   ┌───┴────────────────────┐
   │                        │
┌──▼──────┐      ┌─────────▼──────┐
│ Next.js │      │ ASP.NET Core   │
│Frontend │      │   Web API      │
└─────────┘      └────────┬───────┘
                          │
        ┌─────────────────┼──────────────┐
        │                 │              │
   ┌────▼─────┐    ┌─────▼──────┐  ┌───▼────┐
   │ Python   │    │    OVH     │  │ Redis  │
   │AI Service│    │ S3 Storage │  │        │
   └──────────┘    └────────────┘  └────────┘
```

## 🚀 Tech Stack

- **Backend API**: ASP.NET Core 8.0 Web API (Clean Architecture)
- **Frontend**: Next.js 14 with React 18 and TypeScript
- **AI Service**: Python 3.11 with FastAPI
- **Storage**: OVH S3-compatible Object Storage
- **Cache/Jobs**: Redis 7
- **Reverse Proxy**: Nginx
- **Containerization**: Docker & Docker Compose
- **Cloud**: Ready for OVH, AWS, Azure, or GCP deployment

## 📋 Prerequisites

- **Docker** 24.0+ and **Docker Compose** 2.20+
- **Git** 2.40+
- For local development without Docker:
  - .NET 8.0 SDK
  - Node.js 20+ and npm/yarn
  - Python 3.11+
  - Redis 7+

## 🎬 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/karthikurao/Snapory.git
cd Snapory
```

### 2. Configure Environment

```bash
# Copy the environment template
cp .env.example .env

# Edit .env and set your values, especially:
# - S3_ACCESS_KEY and S3_SECRET_KEY for OVH Object Storage
# - JWT_SECRET for authentication
# - Other service-specific configurations
```

### 3. Start All Services

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d
```

### 4. Access the Application

- **Frontend**: http://localhost
- **API**: http://localhost/api
- **API Health**: http://localhost/api/health
- **AI Service**: http://localhost/ai
- **AI Health**: http://localhost/ai/health

## 🛠️ Development Setup

### Backend (ASP.NET Core)

```bash
cd backend
dotnet restore
dotnet build
dotnet run --project src/Snapory.Api/Snapory.Api.csproj
```

API will be available at http://localhost:5000

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at http://localhost:3000

### AI Service (Python)

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

AI Service will be available at http://localhost:8000

## 📁 Project Structure

```
Snapory/
├── backend/                    # ASP.NET Core Web API
│   ├── src/
│   │   ├── Snapory.Api/       # API Layer (Controllers, Middleware)
│   │   ├── Snapory.Application/ # Application Layer (Services, DTOs)
│   │   ├── Snapory.Domain/    # Domain Layer (Entities, Interfaces)
│   │   └── Snapory.Infrastructure/ # Infrastructure (S3, Redis, etc.)
│   ├── tests/                 # Unit and Integration Tests
│   └── Dockerfile
├── frontend/                   # Next.js React Application
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   ├── components/        # React components
│   │   ├── lib/               # Utilities and API clients
│   │   └── styles/            # Global styles
│   ├── public/                # Static assets
│   └── Dockerfile
├── ai-service/                 # Python AI Microservice
│   ├── app/
│   │   ├── api/               # FastAPI routes
│   │   ├── services/          # Business logic
│   │   └── models/            # Data models
│   ├── requirements.txt
│   └── Dockerfile
├── infrastructure/             # Infrastructure as Code
│   ├── nginx/                 # Nginx configuration
│   └── scripts/               # Deployment scripts
├── docker-compose.yml          # Local development orchestration
└── .env.example               # Environment variables template
```

## 🔄 Photo Upload Flow

1. User uploads photo via Next.js frontend
2. Frontend sends photo to ASP.NET Core API
3. API validates and uploads photo to OVH S3 storage
4. API enqueues background job in Redis for AI processing
5. Python AI service picks up job and processes photo
6. Processed metadata stored and user notified
7. Photo accessible via CDN/S3 URL

## 🏥 Health Checks

All services implement health check endpoints:

- **API**: `GET /health`
- **AI Service**: `GET /health`
- **Frontend**: `GET /` (Next.js default)
- **Redis**: `redis-cli ping`

Check all services:
```bash
curl http://localhost/api/health
curl http://localhost/ai/health
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
dotnet test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### AI Service Tests
```bash
cd ai-service
pytest
```

## ⚠️ MVP Limitations

This is a minimum viable product (MVP) template with the following known limitations:

1. **In-Memory Storage**: Photo metadata is stored in-memory (not persisted). For production:
   - Add a database (PostgreSQL, MongoDB, etc.)
   - Implement proper entity persistence
   - Use Entity Framework Core or another ORM

2. **Scalability**: Single Redis instance limits horizontal scaling:
   - For production, use Redis cluster or managed Redis
   - Consider using a proper message queue (RabbitMQ, Azure Service Bus)

3. **Authentication**: JWT infrastructure is in place but not fully implemented:
   - Add user registration/login
   - Implement JWT token generation and validation
   - Add authorization policies

4. **Photo Processing**: Basic metadata extraction only:
   - Integrate ML models for advanced features
   - Add face detection, object recognition, etc.
   - Implement image optimization pipeline

5. **Error Handling**: Basic error handling implemented:
   - Add comprehensive error tracking (Sentry, Application Insights)
   - Implement retry policies
   - Add circuit breakers for external services

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture and future enhancements.

## 🚢 Deployment

### Docker Compose (Recommended for Small Scale)

```bash
# Production build
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Cloud Deployment (OVH, AWS, Azure, GCP)

See [infrastructure/docs/deployment.md](infrastructure/docs/deployment.md) for detailed cloud deployment guides.

**Quick deployment options:**
- **OVH Public Cloud**: Use Kubernetes or Docker Swarm
- **AWS**: ECS/EKS with RDS and ElastiCache
- **Azure**: AKS with Azure Cache for Redis
- **GCP**: GKE with Cloud Memorystore

## 🔒 Security Considerations

- ✅ JWT-based authentication
- ✅ CORS configuration
- ✅ File type validation
- ✅ File size limits
- ✅ S3 pre-signed URLs for secure access
- ✅ Environment-based secrets management
- ✅ HTTPS enforced in production (via Nginx)

**Production Checklist:**
- [ ] Change default JWT_SECRET
- [ ] Enable HTTPS/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Enable Redis password
- [ ] Use secrets management (AWS Secrets Manager, Azure Key Vault, etc.)

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for full list):

| Variable | Description | Default |
|----------|-------------|---------|
| `S3_ENDPOINT` | OVH S3 endpoint URL | `https://s3.gra.cloud.ovh.net` |
| `S3_BUCKET_NAME` | S3 bucket name | `snapory-photos` |
| `S3_ACCESS_KEY` | S3 access key | - |
| `S3_SECRET_KEY` | S3 secret key | - |
| `REDIS_CONNECTION_STRING` | Redis connection | `redis:6379` |
| `JWT_SECRET` | JWT signing secret | - |

### Scaling Configuration

- **Redis**: Can be configured as a cluster for high availability
- **S3**: Use CDN (OVH CDN or CloudFlare) for better performance
- **API**: Horizontal scaling with load balancer
- **AI Service**: Scale based on job queue length

## 📊 Monitoring

### Docker Health Checks
```bash
docker-compose ps
```

### Application Metrics
- API exposes `/health` endpoint with detailed status
- Redis monitoring via Redis CLI or RedisInsight
- Application logs via `docker-compose logs`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

Once the application is running, API documentation is available at:
- Swagger UI: http://localhost/api/swagger

## 🐛 Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs

# Restart specific service
docker-compose restart api

# Rebuild from scratch
docker-compose down -v
docker-compose up --build
```

### Redis connection issues
```bash
# Check Redis is running
docker-compose ps redis

# Test Redis connection
docker-compose exec redis redis-cli ping
```

### S3 upload failures
- Verify S3 credentials in `.env`
- Check bucket permissions
- Ensure bucket exists and is accessible

## 📚 Additional Resources

- [ASP.NET Core Documentation](https://docs.microsoft.com/aspnet/core)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [OVH Object Storage Guide](https://docs.ovh.com/us/en/storage/object-storage/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Karthik Urao** - [karthikurao](https://github.com/karthikurao)

## 🙏 Acknowledgments

- Built with modern best practices for cloud-native applications
- Clean Architecture principles
- Domain-Driven Design concepts
- SOLID principles

---

**Happy Snapping! 📸**
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
