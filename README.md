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