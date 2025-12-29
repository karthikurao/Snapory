from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
from typing import Optional, List
from typing import Optional
from pydantic import BaseModel
from app.models.schemas import HealthResponse
from app.services.redis_service import redis_service
from app.services.face_service import face_service
from app.services.photo_processor import photo_processor
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


# URL-based API models (for PR #9 backend integration)
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


# File upload API models (for PR #7 direct upload approach)
class FaceDetectionResponse(BaseModel):
    face_count: int
    encodings: list[str]
    locations: list[dict]


class SelfieEncodingResponse(BaseModel):
    success: bool
    encoding: Optional[str] = None
    message: str


class FaceMatchRequest(BaseModel):
    selfie_encoding: str
    photos: list[dict]  # Each with photo_id and face_encodings


class FaceMatchResponse(BaseModel):
    matches: list[dict]
    total_searched: int


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
            "/api/detect-faces (POST with URL or file upload)",
            "/api/encode-selfie (POST with URL or file upload)",
            "/api/match-faces",
            "/api/analyze-photo"
        ],
        "face_recognition_available": face_service.is_available
    }


# URL-based face detection endpoint (for PR #9 backend)
@router.post("/detect-faces-url", response_model=DetectFacesResponse)
async def detect_faces_url(request: ImageUrlRequest):
    """
    Detect all faces in an image from a URL and return their encodings.
    
    This endpoint is called by the background worker when processing uploaded photos.
    """
    result = await face_service.detect_faces_from_url(request.image_url)
    
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


# File upload face detection endpoint (for PR #7 direct upload)
@router.post("/detect-faces", response_model=FaceDetectionResponse)
async def detect_faces(file: UploadFile = File(...)):
    """
    Detect faces in an uploaded photo.
    Returns face count and encoded face data for each detected face.
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Validate specific image formats
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported image format. Allowed formats: {', '.join(allowed_types)}"
            )
        
        # Read image data
        image_data = await file.read()
        
        # Validate file size (10MB max)
        max_size = 10 * 1024 * 1024  # 10MB
        if len(image_data) > max_size:
            raise HTTPException(
                status_code=400, 
                detail=f"File size exceeds maximum limit of {max_size / (1024 * 1024):.0f}MB"
            )
        
        # Detect faces
        result = face_service.detect_faces(image_data)
        
        logger.info(f"Detected {result['face_count']} faces in uploaded image")
        
        return FaceDetectionResponse(
            face_count=result["face_count"],
            encodings=result["encodings"],
            locations=result["locations"]
        )
        
    except Exception as e:
        logger.error(f"Face detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# URL-based selfie encoding endpoint (for PR #9 backend)
@router.post("/encode-selfie-url", response_model=EncodeSelfieResponse)
async def encode_selfie_url(request: ImageUrlRequest):
    """
    Encode a single face from a selfie image URL.
    
    This endpoint is called when a guest uploads their selfie for matching.
    Expects exactly one face in the image (will use largest face if multiple).
    """
    result = await face_service.encode_selfie_from_url(request.image_url)
    
    return EncodeSelfieResponse(
        face_detected=result.get("face_detected", False),
        encoding=result.get("encoding"),
        error=result.get("error")
    )


# File upload selfie encoding endpoint (for PR #7 direct upload)
@router.post("/encode-selfie", response_model=SelfieEncodingResponse)
async def encode_selfie(file: UploadFile = File(...)):
    """
    Process a selfie and return the face encoding for matching.
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Validate specific image formats
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported image format. Allowed formats: {', '.join(allowed_types)}"
            )
        
        # Read image data
        image_data = await file.read()
        
        # Validate file size (10MB max)
        max_size = 10 * 1024 * 1024  # 10MB
        if len(image_data) > max_size:
            raise HTTPException(
                status_code=400, 
                detail=f"File size exceeds maximum limit of {max_size / (1024 * 1024):.0f}MB"
            )
        
        # Encode selfie
        encoding = face_service.encode_selfie(image_data)
        
        if encoding is None:
            return SelfieEncodingResponse(
                success=False,
                encoding=None,
                message="No face detected in the selfie. Please try again with a clearer photo."
            )
        
        return SelfieEncodingResponse(
            success=True,
            encoding=encoding,
            message="Face encoded successfully"
        )
        
    except Exception as e:
        logger.error(f"Selfie encoding error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Unified face matching endpoint (works with both approaches)
@router.post("/match-faces-structured", response_model=MatchFacesResponse)
async def match_faces_structured(request: MatchFacesRequest):
    """
    Match a target face encoding against a list of photo faces (structured format).
    
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


@router.post("/match-faces", response_model=FaceMatchResponse)
async def match_faces(request: FaceMatchRequest):
    """
    Match a selfie encoding against photos to find all photos containing the person.
    """
    try:
        matches = face_service.find_matching_photos(
            selfie_encoding=request.selfie_encoding,
            photos=request.photos
        )
        
        logger.info(f"Found {len(matches)} matching photos out of {len(request.photos)}")
        
        return FaceMatchResponse(
            matches=matches,
            total_searched=len(request.photos)
        )
        
    except Exception as e:
        logger.error(f"Face matching error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-photo")
async def analyze_photo(file: UploadFile = File(...)):
    """
    Analyze a photo for metadata and basic properties.
    """
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image_data = await file.read()
        metadata = photo_processor.analyze_photo(image_data)
        
        # Also detect faces
        face_result = face_service.detect_faces(image_data)
        
        return {
            "metadata": metadata,
            "faces": face_result
        }
        
    except Exception as e:
        logger.error(f"Photo analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

