#!/bin/bash

# Quick Start Script for Snapory
# This script performs initial setup and starts all services

set -e

echo "🎯 Snapory Quick Start"
echo "===================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Docker and Docker Compose found"
echo ""

# Setup environment
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your credentials:"
    echo "   - S3_ACCESS_KEY and S3_SECRET_KEY (required for photo uploads)"
    echo "   - JWT_SECRET (required for production)"
    echo ""
    echo "Press Enter to continue or Ctrl+C to exit and configure .env first..."
    read -r
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🏗️  Building and starting services..."
echo "This may take a few minutes on first run..."
echo ""

docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 15

# Check service health
echo ""
echo "🏥 Checking service health..."

API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health 2>/dev/null || echo "000")
AI_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ai/health 2>/dev/null || echo "000")
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")

if [ "$API_HEALTH" = "200" ]; then
    echo "✅ API is healthy"
else
    echo "⚠️  API health check returned $API_HEALTH (may need more time to start)"
fi

if [ "$AI_HEALTH" = "200" ]; then
    echo "✅ AI Service is healthy"
else
    echo "⚠️  AI Service health check returned $AI_HEALTH (may need more time to start)"
fi

if [ "$FRONTEND" = "200" ]; then
    echo "✅ Frontend is accessible"
else
    echo "⚠️  Frontend returned $FRONTEND (may need more time to start)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Snapory is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Access the application:"
echo "   Frontend:       http://localhost"
echo "   API Docs:       http://localhost/api/swagger"
echo "   API Health:     http://localhost/api/health"
echo "   AI Service:     http://localhost/ai"
echo "   AI Health:      http://localhost/ai/health"
echo ""
echo "📊 Useful commands:"
echo "   View logs:      docker-compose logs -f"
echo "   View API logs:  docker-compose logs -f api"
echo "   Stop services:  docker-compose down"
echo "   Restart:        docker-compose restart"
echo ""
echo "📚 Documentation:"
echo "   Main README:    README.md"
echo "   Deployment:     infrastructure/docs/deployment.md"
echo "   Contributing:   CONTRIBUTING.md"
echo ""
echo "⚠️  If services are not responding, wait a bit longer or check logs."
echo ""
