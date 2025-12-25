#!/bin/bash

# Snapory - Local Deployment Script
# This script sets up and runs Snapory locally using Docker Compose

set -e

echo "🚀 Starting Snapory Local Deployment"
echo "===================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your S3 credentials before continuing."
    echo "   Press Enter to continue once you've updated the .env file, or Ctrl+C to exit..."
    read -r
fi

echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "✅ Snapory is starting up!"
echo ""
echo "Services will be available at:"
echo "  - Frontend:  http://localhost"
echo "  - API:       http://localhost/api"
echo "  - AI Service: http://localhost/ai"
echo ""
echo "Health checks:"
echo "  - API Health:       http://localhost/api/health"
echo "  - AI Service Health: http://localhost/ai/health"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop services:"
echo "  docker-compose down"
echo ""
echo "Waiting for services to be healthy..."

# Wait for services
sleep 10

# Check health
echo ""
echo "Checking service health..."

if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ API is healthy"
else
    echo "⚠️  API health check failed (this might be normal if services are still starting)"
fi

if curl -f http://localhost/ai/health > /dev/null 2>&1; then
    echo "✅ AI Service is healthy"
else
    echo "⚠️  AI Service health check failed (this might be normal if services are still starting)"
fi

echo ""
echo "🎉 Deployment complete! Open http://localhost in your browser."
