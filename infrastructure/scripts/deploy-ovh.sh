#!/bin/bash

# Snapory - Cloud Deployment Script for OVH
# This is a template script for deploying to OVH cloud

set -e

echo "🚀 Snapory - OVH Cloud Deployment"
echo "================================="
echo ""
echo "Prerequisites:"
echo "  1. OVH account with Public Cloud project"
echo "  2. kubectl configured for your OVH Kubernetes cluster"
echo "  3. Docker images pushed to container registry"
echo "  4. S3 bucket created in OVH Object Storage"
echo ""

# Configuration
CLUSTER_NAME="${CLUSTER_NAME:-snapory-cluster}"
NAMESPACE="${NAMESPACE:-snapory}"
REGISTRY="${REGISTRY:-your-registry.io}"

echo "Configuration:"
echo "  Cluster: $CLUSTER_NAME"
echo "  Namespace: $NAMESPACE"
echo "  Registry: $REGISTRY"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ Error: kubectl is not installed."
    exit 1
fi

# Create namespace
echo "📦 Creating namespace..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Create secrets
echo "🔐 Creating secrets..."
echo "⚠️  Make sure to update these with your actual values!"
kubectl create secret generic snapory-secrets \
    --from-literal=s3-access-key=your-access-key \
    --from-literal=s3-secret-key=your-secret-key \
    --from-literal=jwt-secret=your-jwt-secret \
    --from-literal=redis-password=your-redis-password \
    --namespace=$NAMESPACE \
    --dry-run=client -o yaml | kubectl apply -f -

echo ""
echo "📝 Next steps:"
echo "  1. Build and push Docker images to your registry"
echo "  2. Create Kubernetes manifests in infrastructure/k8s/"
echo "  3. Apply manifests: kubectl apply -f infrastructure/k8s/ -n $NAMESPACE"
echo "  4. Set up Ingress with TLS certificates"
echo "  5. Configure DNS to point to your Ingress IP"
echo ""
echo "For detailed instructions, see infrastructure/docs/deployment.md"
