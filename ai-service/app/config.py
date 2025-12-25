import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Snapory AI Service"
    python_env: str = "development"
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
