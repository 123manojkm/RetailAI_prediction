import os
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Retail Analytics Platform"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "sqlite:///./data/retail_ai.db"
    
    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production-abc123"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:3000"
    
    # Directories
    MODEL_DIR: str = "./models"
    DATA_DIR: str = "./data"
    
    # Logging
    LOG_LEVEL: str = "INFO"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return []

    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        return [i.strip() for i in str(self.CORS_ORIGINS).split(",") if i.strip()]

    @property
    def resolved_data_dir(self) -> Path:
        p = Path(self.DATA_DIR)
        if not p.is_absolute():
            # Relative to project root
            p = ROOT_DIR / p
        return p

    @property
    def resolved_model_dir(self) -> Path:
        p = Path(self.MODEL_DIR)
        if not p.is_absolute():
            # Relative to project root
            p = ROOT_DIR / p
        return p

    model_config = SettingsConfigDict(
        env_file=(
            ".env",
            "../.env",
            str(ROOT_DIR / ".env")
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
