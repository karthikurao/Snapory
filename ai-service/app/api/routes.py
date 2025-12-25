from fastapi import APIRouter
from datetime import datetime
from app.models.schemas import HealthResponse
from app.services.redis_service import redis_service

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    """
    redis_connected = redis_service.is_connected()
    queue_length = redis_service.get_queue_length() if redis_connected else 0
    
    return HealthResponse(
        status="healthy" if redis_connected else "degraded",
        timestamp=datetime.utcnow(),
        redis_connected=redis_connected,
        queue_length=queue_length
    )

@router.get("/")
async def root():
    """
    Root endpoint
    """
    return {
        "service": "Snapory AI Service",
        "version": "1.0.0",
        "status": "running"
    }
