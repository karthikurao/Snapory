import face_recognition
import numpy as np
from PIL import Image
import io
import httpx
from typing import List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class FaceService:
    """Service for face detection and encoding using face_recognition library."""
    
    def __init__(self):
        self.tolerance = 0.6  # Lower = more strict matching
    
    async def download_image(self, image_url: str) -> Optional[np.ndarray]:
        """Download image from URL and convert to numpy array."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(image_url, timeout=30.0)
                response.raise_for_status()
                
            image = Image.open(io.BytesIO(response.content))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            return np.array(image)
        except Exception as e:
            logger.error(f"Failed to download image: {e}")
            return None
    
    async def detect_faces(self, image_url: str) -> dict:
        """
        Detect all faces in an image and return their encodings and bounding boxes.
        
        Returns:
            dict with face_count, faces (list of face data)
        """
        image = await self.download_image(image_url)
        if image is None:
            return {"face_count": 0, "faces": [], "error": "Failed to load image"}
        
        try:
            # Detect face locations
            face_locations = face_recognition.face_locations(image)
            
            if not face_locations:
                return {"face_count": 0, "faces": []}
            
            # Get face encodings
            face_encodings = face_recognition.face_encodings(image, face_locations)
            
            # Get image dimensions for percentage-based bounding boxes
            height, width = image.shape[:2]
            
            faces = []
            for i, (location, encoding) in enumerate(zip(face_locations, face_encodings)):
                top, right, bottom, left = location
                
                faces.append({
                    "index": i,
                    "encoding": encoding.tolist(),
                    "bounding_box": {
                        "top": top / height,
                        "right": right / width,
                        "bottom": bottom / height,
                        "left": left / width
                    }
                })
            
            return {
                "face_count": len(faces),
                "faces": faces
            }
        except Exception as e:
            logger.error(f"Face detection failed: {e}")
            return {"face_count": 0, "faces": [], "error": str(e)}
    
    async def encode_selfie(self, image_url: str) -> dict:
        """
        Encode a single face from a selfie image.
        Expects exactly one face in the image.
        
        Returns:
            dict with encoding (list of floats) or error
        """
        image = await self.download_image(image_url)
        if image is None:
            return {"face_detected": False, "error": "Failed to load image"}
        
        try:
            # Detect faces
            face_locations = face_recognition.face_locations(image)
            
            if not face_locations:
                return {"face_detected": False, "error": "No face detected"}
            
            if len(face_locations) > 1:
                # Use the largest face (likely the selfie subject)
                areas = [(bottom - top) * (right - left) for top, right, bottom, left in face_locations]
                largest_idx = np.argmax(areas)
                face_locations = [face_locations[largest_idx]]
            
            # Get encoding
            face_encodings = face_recognition.face_encodings(image, face_locations)
            
            if not face_encodings:
                return {"face_detected": False, "error": "Could not encode face"}
            
            return {
                "face_detected": True,
                "encoding": face_encodings[0].tolist()
            }
        except Exception as e:
            logger.error(f"Selfie encoding failed: {e}")
            return {"face_detected": False, "error": str(e)}
    
    def match_faces(
        self, 
        target_encoding: List[float], 
        photo_faces: List[dict]
    ) -> List[dict]:
        """
        Match a target face encoding against a list of photo faces.
        
        Args:
            target_encoding: 128-dimensional face encoding to match
            photo_faces: List of dicts with photo_id, face_id, encoding
            
        Returns:
            List of matches with photo_id, face_id, distance, confidence
        """
        target = np.array(target_encoding)
        matches = []
        
        for photo_face in photo_faces:
            try:
                encoding = np.array(photo_face["encoding"])
                
                # Calculate Euclidean distance
                distance = np.linalg.norm(target - encoding)
                confidence = max(0, 1 - distance)
                
                # Only include if above threshold
                if confidence >= 0.4:  # Lower threshold than final filter
                    matches.append({
                        "photo_id": photo_face["photo_id"],
                        "face_id": photo_face["face_id"],
                        "distance": float(distance),
                        "confidence": float(confidence)
                    })
            except Exception as e:
                logger.warning(f"Error matching face: {e}")
                continue
        
        # Sort by confidence (highest first)
        matches.sort(key=lambda x: x["confidence"], reverse=True)
        
        return matches
    
    def compare_faces(
        self, 
        encoding1: List[float], 
        encoding2: List[float]
    ) -> Tuple[float, bool]:
        """
        Compare two face encodings.
        
        Returns:
            Tuple of (distance, is_match)
        """
        enc1 = np.array(encoding1)
        enc2 = np.array(encoding2)
        
        distance = float(np.linalg.norm(enc1 - enc2))
        is_match = distance <= self.tolerance
        
        return distance, is_match


# Global instance
face_service = FaceService()
