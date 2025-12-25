# Snapory - Cloud Deployment Guide

## Overview

This guide covers deploying Snapory to various cloud platforms. The application is designed to be cloud-agnostic and can run on OVH, AWS, Azure, GCP, or any Kubernetes cluster.

## Architecture Overview

- **Frontend**: Next.js application (stateless, horizontally scalable)
- **API**: ASP.NET Core Web API (stateless, horizontally scalable)
- **AI Service**: Python FastAPI (stateless, horizontally scalable)
- **Storage**: OVH S3-compatible Object Storage (or AWS S3, Azure Blob, GCS)
- **Cache/Queue**: Redis (can be clustered)
- **Reverse Proxy**: Nginx or cloud load balancer

## Prerequisites

- Cloud account (OVH, AWS, Azure, or GCP)
- Docker registry access
- kubectl configured (for Kubernetes deployments)
- Domain name (for production)

---

## Deployment Option 1: OVH Public Cloud with Kubernetes

### 1. Create OVH Resources

#### Object Storage
```bash
# Create S3 bucket via OVH Control Panel or OpenStack CLI
openstack container create snapory-photos
```

#### Managed Kubernetes Cluster
1. Go to OVH Public Cloud → Kubernetes
2. Create a new cluster
3. Download kubeconfig file

### 2. Prepare Docker Images

```bash
# Build and tag images
docker build -t registry.example.com/snapory-api:latest ./backend
docker build -t registry.example.com/snapory-frontend:latest ./frontend
docker build -t registry.example.com/snapory-ai:latest ./ai-service

# Push to registry
docker push registry.example.com/snapory-api:latest
docker push registry.example.com/snapory-frontend:latest
docker push registry.example.com/snapory-ai:latest
```

### 3. Create Kubernetes Manifests

Create these files in `infrastructure/k8s/`:

**namespace.yaml**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: snapory
```

**secrets.yaml**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: snapory-secrets
  namespace: snapory
type: Opaque
stringData:
  s3-endpoint: "https://s3.gra.cloud.ovh.net"
  s3-access-key: "your-access-key"
  s3-secret-key: "your-secret-key"
  jwt-secret: "your-jwt-secret"
```

**redis-deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: snapory
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
```

### 4. Deploy

```bash
# Apply manifests
kubectl apply -f infrastructure/k8s/

# Check status
kubectl get pods -n snapory
```

### 5. Set Up Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: snapory-ingress
  namespace: snapory
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - snapory.example.com
    secretName: snapory-tls
  rules:
  - host: snapory.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 5000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 3000
```

---

## Deployment Option 2: Docker Swarm (Simple)

For smaller deployments without Kubernetes:

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml snapory

# Check services
docker service ls
```

---

## Deployment Option 3: AWS

### Services Used
- **ECS/Fargate**: Container orchestration
- **ALB**: Load balancing
- **S3**: Object storage
- **ElastiCache Redis**: Managed Redis
- **RDS** (optional): Database if needed
- **CloudFront** (optional): CDN

### Quick Setup

1. **S3 Bucket**
```bash
aws s3 mb s3://snapory-photos
```

2. **ECR Repositories**
```bash
aws ecr create-repository --repository-name snapory-api
aws ecr create-repository --repository-name snapory-frontend
aws ecr create-repository --repository-name snapory-ai
```

3. **ECS Task Definitions**
Create task definitions for each service and deploy via ECS.

---

## Deployment Option 4: Azure

### Services Used
- **AKS**: Kubernetes service
- **Azure Blob Storage**: Object storage
- **Azure Cache for Redis**: Managed Redis
- **Application Gateway**: Load balancing

### Quick Setup

```bash
# Create resource group
az group create --name snapory-rg --location eastus

# Create AKS cluster
az aks create \
  --resource-group snapory-rg \
  --name snapory-cluster \
  --node-count 3 \
  --enable-managed-identity

# Get credentials
az aks get-credentials --resource-group snapory-rg --name snapory-cluster
```

---

## Deployment Option 5: Google Cloud Platform

### Services Used
- **GKE**: Kubernetes engine
- **Cloud Storage**: Object storage
- **Cloud Memorystore**: Managed Redis
- **Cloud Load Balancing**: Load balancing

### Quick Setup

```bash
# Create GKE cluster
gcloud container clusters create snapory-cluster \
  --num-nodes=3 \
  --zone=us-central1-a

# Get credentials
gcloud container clusters get-credentials snapory-cluster
```

---

## Environment Variables for Production

### API (ASP.NET Core)
```env
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:5000
S3__Endpoint=https://s3.gra.cloud.ovh.net
S3__BucketName=snapory-photos
S3__AccessKey=<from-secrets>
S3__SecretKey=<from-secrets>
Redis__ConnectionString=redis:6379
JWT__Secret=<from-secrets>
```

### Frontend (Next.js)
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.snapory.example.com
```

### AI Service (Python)
```env
PYTHON_ENV=production
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## Monitoring and Logging

### Recommended Tools

1. **Logging**: ELK Stack, Grafana Loki, or cloud-native solutions
2. **Metrics**: Prometheus + Grafana
3. **Tracing**: Jaeger or OpenTelemetry
4. **Uptime**: UptimeRobot, Pingdom

### Health Check Endpoints

- API: `/health`
- AI Service: `/health`
- Frontend: `/` (should return 200)

---

## Scaling

### Horizontal Pod Autoscaler (Kubernetes)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: snapory
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## Security Checklist

- [ ] Enable HTTPS/TLS
- [ ] Use secrets management (Kubernetes Secrets, AWS Secrets Manager, etc.)
- [ ] Configure firewall rules
- [ ] Enable S3 bucket encryption
- [ ] Set up VPC/network isolation
- [ ] Enable Redis authentication
- [ ] Use strong JWT secrets
- [ ] Implement rate limiting
- [ ] Enable CORS with specific origins
- [ ] Regular security updates

---

## Backup Strategy

1. **Object Storage**: Enable versioning on S3 bucket
2. **Redis**: Regular snapshots if persistent
3. **Configuration**: Version control all manifests
4. **Secrets**: Store encrypted backups securely

---

## Cost Optimization

1. Use reserved instances for stable workloads
2. Enable autoscaling to scale down during low usage
3. Use CDN for static assets
4. Implement proper caching strategies
5. Right-size your instances based on actual usage

---

## Support and Troubleshooting

For issues during deployment:

1. Check service logs: `kubectl logs -n snapory <pod-name>`
2. Verify health endpoints
3. Check resource utilization
4. Review network policies and firewall rules
5. Validate environment variables and secrets

---

## Next Steps

1. Set up CI/CD pipeline
2. Configure monitoring and alerting
3. Implement automated backups
4. Set up staging environment
5. Document runbooks for common operations
