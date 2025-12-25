# Snapory Architecture

## High-Level Overview

Snapory follows a modern microservices architecture with clear separation of concerns:

```
                              ┌──────────────┐
                              │   Internet   │
                              └──────┬───────┘
                                     │
                              ┌──────▼───────┐
                              │    Nginx     │
                              │ (Port 80/443)│
                              └──┬────┬────┬─┘
                                 │    │    │
                   ┌─────────────┘    │    └─────────────┐
                   │                  │                  │
            ┌──────▼───────┐   ┌─────▼──────┐   ┌──────▼──────┐
            │   Next.js    │   │ ASP.NET    │   │   Python    │
            │   Frontend   │   │  Core API  │   │ AI Service  │
            │  (Port 3000) │   │(Port 5000) │   │ (Port 8000) │
            └──────────────┘   └─────┬──────┘   └──────┬──────┘
                                     │                  │
                                     │    ┌─────────────┘
                                     │    │
                              ┌──────▼────▼─┐
                              │    Redis    │
                              │  (Port 6379)│
                              └─────────────┘
                                     
                              ┌─────────────┐
                              │  OVH S3     │
                              │   Storage   │
                              └─────────────┘
```

## Components

### 1. Frontend (Next.js)
- **Technology**: Next.js 14 with React 18 and TypeScript
- **Purpose**: User interface for photo uploads and event management
- **Port**: 3000 (internal), accessible via Nginx on port 80
- **Key Features**:
  - Server-side rendering for optimal performance
  - Responsive design
  - Photo upload with progress tracking
  - Event-based organization

### 2. Backend API (ASP.NET Core)
- **Technology**: ASP.NET Core 8.0 Web API
- **Architecture**: Clean Architecture (Domain, Application, Infrastructure, API)
- **Purpose**: Business logic and data orchestration
- **Port**: 5000 (internal)
- **Key Features**:
  - RESTful API design
  - S3 storage integration
  - Redis queue management
  - Health checks
  - Swagger documentation

#### Clean Architecture Layers:
```
┌─────────────────────────────────────────┐
│              API Layer                  │
│    (Controllers, Middleware)            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Application Layer                │
│   (Services, DTOs, Interfaces)          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Domain Layer                   │
│      (Entities, Interfaces)              │
└─────────────────────────────────────────┘
                  ▲
                  │
┌─────────────────┴───────────────────────┐
│       Infrastructure Layer               │
│  (S3 Service, Redis Service)            │
└─────────────────────────────────────────┘
```

### 3. AI Service (Python/FastAPI)
- **Technology**: Python 3.11 with FastAPI
- **Purpose**: Photo processing and AI analysis
- **Port**: 8000 (internal)
- **Key Features**:
  - Async job processing
  - Photo metadata extraction
  - AI-powered tagging (extensible for ML models)
  - Health monitoring

### 4. Storage (OVH S3)
- **Technology**: S3-compatible object storage
- **Purpose**: Persistent photo storage
- **Key Features**:
  - Scalable object storage
  - Pre-signed URLs for secure access
  - Multi-region support
  - CDN integration ready

### 5. Queue/Cache (Redis)
- **Technology**: Redis 7
- **Purpose**: Job queue and caching
- **Key Features**:
  - Background job queue
  - High-performance caching
  - Pub/sub capabilities
  - Persistence with AOF

### 6. Reverse Proxy (Nginx)
- **Technology**: Nginx Alpine
- **Purpose**: Request routing and load balancing
- **Port**: 80 (external)
- **Key Features**:
  - Path-based routing
  - SSL/TLS termination
  - Static file serving
  - Load balancing ready

## Data Flow

### Photo Upload Flow
```
1. User selects photo in Frontend
2. Frontend sends multipart/form-data to API via Nginx
3. API validates file (type, size)
4. API uploads to S3 storage
5. API creates photo record (in-memory for MVP)
6. API enqueues processing job in Redis
7. API returns photo metadata to Frontend
8. AI Service picks up job from Redis queue
9. AI Service processes photo (extract metadata, generate tags)
10. AI Service updates photo record
11. Frontend polls for updated photo status
```

### Request Routing (Nginx)
```
http://localhost/          → Frontend (Next.js)
http://localhost/api/*     → Backend API
http://localhost/ai/*      → AI Service
```

## Security Architecture

### Authentication & Authorization
- JWT-based authentication (ready for implementation)
- Configurable CORS policies
- Environment-based secrets

### Data Security
- S3 pre-signed URLs (time-limited access)
- File type validation
- File size limits
- HTTPS/TLS in production

### Network Security
- Internal Docker network isolation
- Nginx as single entry point
- No direct external access to services

## Scalability

### Horizontal Scaling
All services are stateless and can be scaled horizontally:

```
                    ┌──────────┐
                    │   Load   │
                    │ Balancer │
                    └────┬─────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │  API 1  │    │  API 2  │    │  API 3  │
    └────┬────┘    └────┬────┘    └────┬────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                    ┌────▼────┐
                    │  Redis  │
                    │ Cluster │
                    └─────────┘
```

### Caching Strategy
- Redis for frequently accessed data
- S3 with CDN for static assets
- API response caching (future)

## Deployment Topologies

### Development (Docker Compose)
All services run on single host for development.

### Production - Small Scale (Docker Swarm)
- Single manager node
- 3-5 worker nodes
- Shared Redis instance
- Managed S3 storage

### Production - Large Scale (Kubernetes)
- Multi-node K8s cluster
- Redis cluster for HA
- Horizontal pod autoscaling
- Ingress controller
- Managed services (RDS, ElastiCache)

## Monitoring & Observability

### Health Checks
Each service exposes health endpoints:
- API: `/health` - Checks API and Redis connectivity
- AI Service: `/health` - Checks service and Redis connectivity
- Frontend: `/` - Next.js health

### Metrics (Future Enhancement)
- Prometheus for metrics collection
- Grafana for visualization
- Application insights

### Logging
- Structured logging in all services
- Centralized log aggregation (ELK stack recommended)
- Request tracing

## Technology Decisions

### Why ASP.NET Core?
- High performance
- Strong typing with C#
- Excellent cloud integration
- Mature ecosystem

### Why Next.js?
- Server-side rendering
- Excellent developer experience
- Built-in optimization
- Production-ready out of the box

### Why Python/FastAPI?
- Easy integration with ML/AI libraries
- Async support for I/O operations
- Simple and intuitive API design
- Fast development

### Why Redis?
- High performance
- Simple pub/sub for jobs
- Widely supported
- Easy to scale

### Why S3-compatible storage?
- Industry standard
- Scalable
- Cost-effective
- Multi-provider support (OVH, AWS, etc.)

## Future Enhancements

1. **Database Integration**: Add PostgreSQL for structured data
2. **Real-time Updates**: WebSocket support for live photo updates
3. **CDN Integration**: CloudFlare or OVH CDN for faster delivery
4. **Advanced AI**: Integrate ML models for object detection, face recognition
5. **Search**: Elasticsearch for advanced photo search
6. **Analytics**: Track usage patterns and performance metrics
7. **Multi-tenancy**: Support for multiple organizations
8. **Mobile Apps**: Native iOS and Android applications

## Performance Considerations

### Current Limitations (MVP)
- In-memory photo storage (no database)
- Single Redis instance
- No caching layer
- Synchronous file uploads

### Production Optimizations
- Add database for persistence
- Implement Redis cluster
- Add CDN for static assets
- Async upload with presigned URLs
- Image optimization pipeline
- Rate limiting and throttling

## Disaster Recovery

### Backup Strategy
- S3 versioning enabled
- Redis AOF persistence
- Configuration in version control
- Regular snapshot testing

### Recovery Time Objectives
- **RTO**: < 1 hour for full system
- **RPO**: < 15 minutes for data
