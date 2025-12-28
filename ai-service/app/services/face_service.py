"""
Face detection and matching service for Snapory.
Uses face_recognition library for face detection and encoding.
"""

import base64
import logging
from io import BytesIO
from typing import Optional

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

# Try to import face_recognition, fall back to mock if not available
try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
    logger.info("face_recognition library loaded successfully")
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
    logger.warning("face_recognition not available, using mock implementation")


class FaceService:
    """Service for face detection and matching operations."""
    
    def __init__(self, match_threshold: float = 0.6):
        """
        Initialize FaceService.
        
        Args:
            match_threshold: Distance threshold for face matching (default: 0.6).
                Lower values (e.g., 0.4-0.5) result in stricter matching with fewer false positives,
                but may miss some valid matches. Higher values (e.g., 0.7-0.8) are more lenient
                and catch more matches but increase false positives. The default of 0.6 provides
                a good balance for most use cases. This threshold is compared against the Euclidean
                distance between face encoding vectors (128-dimensional).
        """
        self.match_threshold = match_threshold
        self.is_available = FACE_RECOGNITION_AVAILABLE
    
    def detect_faces(self, image_data: bytes) -> dict:
        """
        Detect faces in an image and return their encodings.
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Dictionary with face count and base64-encoded face encodings
        """
        try:
            # Load image
            image = Image.open(BytesIO(image_data))
            image_array = np.array(image)
            
            if not FACE_RECOGNITION_AVAILABLE:
                # Return mock data when face_recognition not available
                return self._mock_detect_faces(image)
            
            # Detect face locations
            face_locations = face_recognition.face_locations(image_array, model="hog")
            
            if not face_locations:
                return {
                    "face_count": 0,
                    "encodings": [],
                    "locations": []
                }
            
            # Get face encodings
            face_encodings = face_recognition.face_encodings(image_array, face_locations)
            
            # Convert encodings to base64 for storage
            encoded_faces = [
                base64.b64encode(encoding.tobytes()).decode('utf-8')
                for encoding in face_encodings
            ]
            
            # Convert locations to serializable format
            locations = [
                {"top": loc[0], "right": loc[1], "bottom": loc[2], "left": loc[3]}
                for loc in face_locations
            ]
            
            logger.info(f"Detected {len(face_locations)} face(s) in image")
            
            return {
                "face_count": len(face_locations),
                "encodings": encoded_faces,
                "locations": locations
            }
            
        except Exception as e:
            logger.error(f"Error detecting faces: {e}")
            raise
    
    def encode_selfie(self, image_data: bytes) -> Optional[str]:
        """
        Detect and encode the primary face in a selfie image.
        
        Args:
            image_data: Raw image bytes of selfie
            
        Returns:
            Base64-encoded face encoding, or None if no face detected
        """
        try:
            result = self.detect_faces(image_data)
            
            if result["face_count"] == 0:
                logger.warning("No face detected in selfie")
                return None
            
            # Return the first (largest/most prominent) face encoding
            return result["encodings"][0]
            
        except Exception as e:
            logger.error(f"Error encoding selfie: {e}")
            raise
    
    def match_faces(
        self, 
        selfie_encoding: str, 
        photo_encodings: list[str]
    ) -> list[dict]:
        """
        Match a selfie encoding against multiple photo face encodings.
        
        Args:
            selfie_encoding: Base64-encoded selfie face encoding
            photo_encodings: List of base64-encoded face encodings from photos
            
        Returns:
            List of match results with confidence scores
        """
        try:
            if not FACE_RECOGNITION_AVAILABLE:
                return self._mock_match_faces(len(photo_encodings))
            
            # Decode selfie encoding
            selfie_vector = np.frombuffer(
                base64.b64decode(selfie_encoding), 
                dtype=np.float64
            )
            
            matches = []
            for i, photo_encoding in enumerate(photo_encodings):
                # Decode photo face encoding
                photo_vector = np.frombuffer(
                    base64.b64decode(photo_encoding),
                    dtype=np.float64
                )
                
                # Calculate face distance (lower = more similar)
                distance = np.linalg.norm(selfie_vector - photo_vector)
                
                # Convert distance to confidence (0-1, higher = more confident).
                # We use 1 / (1 + distance) to keep confidence in (0, 1] and
                # monotonically decreasing as distance increases, independent
                # of the chosen match threshold.
                confidence = 1.0 / (1.0 + float(distance))
                
                if distance <= self.match_threshold:
                    matches.append({
                        "index": i,
                        "distance": float(distance),
                        "confidence": float(confidence),
                        "is_match": True
                    })
            
            # Sort by confidence (highest first)
            matches.sort(key=lambda x: x["confidence"], reverse=True)
            
            logger.info(f"Found {len(matches)} matching faces")
            return matches
            
        except Exception as e:
            logger.error(f"Error matching faces: {e}")
            raise
    
    def find_matching_photos(
        self,
        selfie_encoding: str,
        photos: list[dict]
    ) -> list[dict]:
        """
        Find all photos containing a person based on their selfie.
        
        Args:
            selfie_encoding: Base64-encoded selfie face encoding
            photos: List of photo dicts with 'photo_id' and 'face_encodings'
            
        Returns:
            List of matching photo results with confidence scores
        """
        matching_photos = []
        
        for photo in photos:
            photo_encodings = photo.get("face_encodings", [])
            if not photo_encodings:
                continue
            
            # Check each face in the photo
            matches = self.match_faces(selfie_encoding, photo_encodings)
            
            if matches:
                # Get the best match for this photo
                best_match = matches[0]
                matching_photos.append({
                    "photo_id": photo["photo_id"],
                    "confidence": best_match["confidence"],
                    "distance": best_match["distance"],
                    "face_index": best_match["index"]
                })
        
        # Sort by confidence
        matching_photos.sort(key=lambda x: x["confidence"], reverse=True)
        
        return matching_photos
    
    def _mock_detect_faces(self, image: Image.Image) -> dict:
        """
        Mock face detection when face_recognition is not available.
        
        Args:
            image: PIL Image object
            
        Returns:
            Mock face detection result with random faces for testing
        """
        import random
        
        # Use image dimensions as seed for more deterministic results per image
        seed = hash((image.width, image.height))
        random.seed(seed)
        
        face_count = random.randint(0, 3)
        
        encodings = [
            base64.b64encode(np.random.rand(128).astype(np.float64).tobytes()).decode('utf-8')
            for _ in range(face_count)
        ]
        
        locations = [
            {"top": 100, "right": 200, "bottom": 200, "left": 100}
            for _ in range(face_count)
        ]
        
        return {
            "face_count": face_count,
            "encodings": encodings,
            "locations": locations
        }
    
    def _mock_match_faces(self, count: int) -> list[dict]:
        """
        Mock face matching when face_recognition is not available.
        
        Args:
            count: Number of photo encodings to match against
            
        Returns:
            Mock match results for testing
        """
        import random
        
        matches = []
        for i in range(count):
            if random.random() > 0.7:  # 30% match rate
                matches.append({
                    "index": i,
                    "distance": random.uniform(0.3, 0.5),
                    "confidence": random.uniform(0.6, 0.95),
                    "is_match": True
                })
        return matches


# Singleton instance
face_service = FaceService()
