# Snapory AI Service - Python Microservice

## Overview

This is the AI microservice for Snapory, built with FastAPI and Python 3.11. It handles background photo processing tasks from the Redis queue.

## Features

- Photo metadata extraction
- AI-powered photo tagging (placeholder for ML models)
- Redis queue integration
- Health check endpoints
- Async processing

## Prerequisites

- Python 3.11+
- Redis

## Getting Started

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Create a `.env` file:

```env
PYTHON_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Run the Service

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at http://localhost:8000

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check with Redis status
- `GET /docs` - Interactive API documentation (Swagger UI)

## Docker

Build and run with Docker:

```bash
docker build -t snapory-ai-service .
docker run -p 8000:8000 snapory-ai-service
```

## Project Structure

```
ai-service/
├── app/
│   ├── api/
│   │   └── routes.py        # API endpoints
│   ├── services/
│   │   ├── redis_service.py # Redis integration
│   │   └── photo_processor.py # Photo processing
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   ├── config.py           # Configuration
│   └── main.py             # FastAPI application
├── requirements.txt
└── Dockerfile
```

## Adding ML Models

To add actual AI/ML capabilities:

1. Install ML libraries (e.g., `tensorflow`, `torch`, `transformers`)
2. Update `photo_processor.py` with your models
3. Add model files to the project
4. Update `requirements.txt` with ML dependencies

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PYTHON_ENV` | Environment name | `development` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_DB` | Redis database | `0` |

## Technologies

- FastAPI for async API
- Redis for job queuing
- Pillow for image processing
- Pydantic for data validation
- Uvicorn ASGI server
