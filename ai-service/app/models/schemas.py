from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PhotoProcessingJob(BaseModel):
    photo_id: str
    storage_key: str
    enqueued_at: datetime

class PhotoMetadata(BaseModel):
    photo_id: str
    width: Optional[int] = None
    height: Optional[int] = None
    format: Optional[str] = None
    file_size: Optional[int] = None
    analyzed_at: datetime
    tags: list[str] = []

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    redis_connected: bool
    queue_length: int
