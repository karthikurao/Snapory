from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.schemas import HealthResponse
from app.services.redis_service import redis_service
from app.services.face_service import face_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class ImageUrlRequest(BaseModel):
    image_url: str


class PhotoFaceInput(BaseModel):
    photo_id: str
    face_id: str
    encoding: List[float]


class MatchFacesRequest(BaseModel):
    target_encoding: List[float]
    photo_faces: List[PhotoFaceInput]


class FaceMatch(BaseModel):
    photo_id: str
    face_id: str
    distance: float
    confidence: float


class FaceBoundingBox(BaseModel):
    top: float
    right: float
    bottom: float
    left: float


class DetectedFace(BaseModel):
    index: int
    encoding: List[float]
    bounding_box: FaceBoundingBox


class DetectFacesResponse(BaseModel):
    face_count: int
    faces: List[DetectedFace]
    error: Optional[str] = None


class EncodeSelfieResponse(BaseModel):
    face_detected: bool
    encoding: Optional[List[float]] = None
    error: Optional[str] = None


class MatchFacesResponse(BaseModel):
    matches: List[FaceMatch]


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
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
    """Root endpoint"""
    return {
        "service": "Snapory AI Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": [
            "/api/health",
            "/api/detect-faces",
            "/api/encode-selfie",
            "/api/match-faces"
        ],
        "face_recognition_available": face_service.is_available
    }


@router.post("/detect-faces", response_model=DetectFacesResponse)
async def detect_faces(request: ImageUrlRequest):
    """
    Detect all faces in an image and return their encodings.
    
    This endpoint is called by the background worker when processing uploaded photos.
    """
    result = await face_service.detect_faces(request.image_url)
    
    if "error" in result and result.get("face_count", 0) == 0:
        # Still return the result, let the caller decide what to do
        pass
    
    return DetectFacesResponse(
        face_count=result.get("face_count", 0),
        faces=[
            DetectedFace(
                index=f["index"],
                encoding=f["encoding"],
                bounding_box=FaceBoundingBox(**f["bounding_box"])
            )
            for f in result.get("faces", [])
        ],
        error=result.get("error")
    )


@router.post("/encode-selfie", response_model=EncodeSelfieResponse)
async def encode_selfie(request: ImageUrlRequest):
    """
    Encode a single face from a selfie image.
    
    This endpoint is called when a guest uploads their selfie for matching.
    Expects exactly one face in the image (will use largest face if multiple).
    """
    result = await face_service.encode_selfie(request.image_url)
    
    return EncodeSelfieResponse(
        face_detected=result.get("face_detected", False),
        encoding=result.get("encoding"),
        error=result.get("error")
    )


@router.post("/match-faces", response_model=MatchFacesResponse)
async def match_faces(request: MatchFacesRequest):
    """
    Match a target face encoding against a list of photo faces.
    
    This endpoint performs the face matching algorithm to find photos
    containing a specific person based on their selfie encoding.
    """
    photo_faces = [
        {
            "photo_id": pf.photo_id,
            "face_id": pf.face_id,
            "encoding": pf.encoding
        }
        for pf in request.photo_faces
    ]
    
    matches = face_service.match_faces(request.target_encoding, photo_faces)
    
    return MatchFacesResponse(
        matches=[
            FaceMatch(
                photo_id=m["photo_id"],
                face_id=m["face_id"],
                distance=m["distance"],
                confidence=m["confidence"]
            )
            for m in matches
        ]
    )
