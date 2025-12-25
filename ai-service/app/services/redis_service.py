import redis
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class RedisService:
    def __init__(self):
        self.client = None
        self.connect()
    
    def connect(self):
        try:
            self.client = redis.Redis(
                host=settings.redis_host,
                port=settings.redis_port,
                db=settings.redis_db,
                decode_responses=True
            )
            self.client.ping()
            logger.info("Connected to Redis successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.client = None
    
    def is_connected(self) -> bool:
        if self.client is None:
            return False
        try:
            self.client.ping()
            return True
        except:
            return False
    
    def get_queue_length(self) -> int:
        if not self.is_connected():
            return 0
        try:
            return self.client.llen("snapory:photo-processing-queue")
        except:
            return 0
    
    def dequeue_job(self) -> dict | None:
        if not self.is_connected():
            return None
        try:
            job_json = self.client.lpop("snapory:photo-processing-queue")
            if job_json:
                import json
                return json.loads(job_json)
            return None
        except Exception as e:
            logger.error(f"Error dequeuing job: {e}")
            return None

redis_service = RedisService()
