#!/usr/bin/env bash

# Quick Start Script for Snapory
# - Detects Docker Compose command variant
# - Creates .env from .env.example if missing
# - Validates required environment values
# - Starts the stack and performs basic health checks

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "🎯 Snapory Quick Start"
echo "===================="

detect_compose_cmd() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    echo "docker compose"
    return
  fi

  if command -v docker-compose >/dev/null 2>&1; then
    echo "docker-compose"
    return
  fi

  return 1
}

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker is required but not installed."
  echo "   Install Docker Engine and Docker Compose plugin, then rerun this script."
  exit 1
fi

if ! COMPOSE_CMD="$(detect_compose_cmd)"; then
  echo "❌ Docker Compose is required but not installed."
  echo "   Install either:"
  echo "   - Docker Compose plugin (preferred): docker compose"
  echo "   - Legacy binary: docker-compose"
  exit 1
fi

echo "✅ Docker found: $(docker --version)"
echo "✅ Compose command: ${COMPOSE_CMD}"

if [[ ! -f .env ]]; then
  echo "📝 Creating .env from .env.example"
  cp .env.example .env
fi

./scripts/configure-env.sh --non-interactive

echo "🏗️  Building and starting services..."
${COMPOSE_CMD} up -d --build

echo "⏳ Waiting for services to initialize..."
sleep 15

check_http() {
  local name="$1"
  local url="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")

  if [[ "$code" == "200" ]]; then
    echo "✅ ${name} is healthy (${code})"
  else
    echo "⚠️  ${name} health check returned ${code}"
  fi
}

echo "🏥 Running health checks..."
check_http "Frontend" "http://localhost/"
check_http "API" "http://localhost/api/health"
check_http "AI Service" "http://localhost/ai/health"

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Snapory is running"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Frontend:   http://localhost"
echo "API Docs:   http://localhost/api/swagger"
echo "AI Health:  http://localhost/ai/health"
echo
echo "Useful commands:"
echo "  Logs:      ${COMPOSE_CMD} logs -f"
echo "  Stop:      ${COMPOSE_CMD} down"
echo "  Restart:   ${COMPOSE_CMD} restart"
