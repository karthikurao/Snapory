import numpy as np
import cv2
import logging
from typing import List, Tuple, Optional
from deepface import DeepFace
from io import BytesIO
from PIL import Image
import json

logger = logging.getLogger(__name__)

class FaceRecognitionService:
    def __init__(self):
        # DeepFace will download models on first use
        self.model_name = "Facenet512"  # High accuracy model
        logger.info(f"Initialized FaceRecognitionService with model: {self.model_name}")
    
    def detect_faces(self, image_bytes: bytes) -> List[dict]:
        """
        Detect faces in an image and return their bounding boxes and embeddings.
        
        Args:
            image_bytes: Image data as bytes
            
        Returns:
            List of dictionaries with face information (embedding, bounding box)
        """
        try:
            # Convert bytes to numpy array
            image = Image.open(BytesIO(image_bytes))
            image_array = np.array(image)
            
            # Convert RGB to BGR for OpenCV
            if len(image_array.shape) == 3 and image_array.shape[2] == 3:
                image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
            
            # Detect and analyze faces
            faces = DeepFace.extract_faces(
                img_path=image_array,
                detector_backend="opencv",
                enforce_detection=False,
                align=True
            )
            
            result = []
            for face_data in faces:
                if face_data['confidence'] < 0.5:
                    continue
                
                # Get face embedding
                face_region = face_data['facial_area']
                face_img = image_array[
                    face_region['y']:face_region['y'] + face_region['h'],
                    face_region['x']:face_region['x'] + face_region['w']
                ]
                
                try:
                    embedding_result = DeepFace.represent(
                        img_path=face_img,
                        model_name=self.model_name,
                        enforce_detection=False
                    )
                    
                    if embedding_result:
                        embedding = embedding_result[0]['embedding']
                        
                        result.append({
                            'embedding': json.dumps(embedding),
                            'bounding_box': json.dumps(face_region),
                            'confidence': float(face_data['confidence'])
                        })
                except Exception as e:
                    logger.warning(f"Error generating embedding for face: {e}")
                    continue
            
            logger.info(f"Detected {len(result)} faces in image")
            return result
            
        except Exception as e:
            logger.error(f"Error detecting faces: {e}")
            return []
    
    def extract_embedding(self, image_bytes: bytes) -> Optional[str]:
        """
        Extract face embedding from an image (assumes one face).
        
        Args:
            image_bytes: Image data as bytes
            
        Returns:
            JSON string of face embedding, or None if no face detected
        """
        try:
            # Convert bytes to numpy array
            image = Image.open(BytesIO(image_bytes))
            image_array = np.array(image)
            
            # Convert RGB to BGR for OpenCV
            if len(image_array.shape) == 3 and image_array.shape[2] == 3:
                image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
            
            # Generate embedding
            embedding_result = DeepFace.represent(
                img_path=image_array,
                model_name=self.model_name,
                enforce_detection=True
            )
            
            if embedding_result:
                embedding = embedding_result[0]['embedding']
                logger.info("Successfully extracted face embedding")
                return json.dumps(embedding)
            
            logger.warning("No face detected in image")
            return None
            
        except Exception as e:
            logger.error(f"Error extracting face embedding: {e}")
            return None
    
    def compare_embeddings(self, embedding1: str, embedding2: str) -> float:
        """
        Compare two face embeddings using cosine similarity.
        
        Args:
            embedding1: JSON string of first embedding
            embedding2: JSON string of second embedding
            
        Returns:
            Similarity score (0 to 1, higher is more similar)
        """
        try:
            vec1 = np.array(json.loads(embedding1))
            vec2 = np.array(json.loads(embedding2))
            
            # Calculate cosine similarity
            dot_product = np.dot(vec1, vec2)
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            similarity = dot_product / (norm1 * norm2)
            # Convert to 0-1 range (cosine similarity is -1 to 1)
            similarity = (similarity + 1) / 2
            
            return float(similarity)
            
        except Exception as e:
            logger.error(f"Error comparing embeddings: {e}")
            return 0.0

# Global instance
face_recognition_service = FaceRecognitionService()
