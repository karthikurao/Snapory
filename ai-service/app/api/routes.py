from fastapi import APIRouter, File, UploadFile, HTTPException
from datetime import datetime
from app.models.schemas import HealthResponse
from app.services.redis_service import redis_service
from app.services.face_recognition_service import face_recognition_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

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

@router.post("/api/face/detect")
async def detect_faces(file: UploadFile = File(...)):
    """
    Detect faces in an uploaded image and return embeddings and bounding boxes.
    """
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        # Detect faces
        faces = face_recognition_service.detect_faces(image_bytes)
        
        if not faces:
            return {
                "success": False,
                "message": "No faces detected in image",
                "faces": []
            }
        
        return {
            "success": True,
            "message": f"Detected {len(faces)} face(s)",
            "faces": faces
        }
        
    except Exception as e:
        logger.error(f"Error in detect_faces endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/face/extract-embedding")
async def extract_embedding(file: UploadFile = File(...)):
    """
    Extract face embedding from an uploaded image (assumes one face).
    """
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        # Extract embedding
        embedding = face_recognition_service.extract_embedding(image_bytes)
        
        if embedding is None:
            raise HTTPException(status_code=400, detail="No face detected in image")
        
        return {
            "success": True,
            "embedding": embedding
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in extract_embedding endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
