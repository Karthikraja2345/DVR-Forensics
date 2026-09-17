import os
from pathlib import Path
from typing import List
try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
    class BaseSettingsClass(BaseSettings):
        model_config = SettingsConfigDict(
            env_file=".env",
            env_file_encoding="utf-8",
            extra="ignore",
        )
except ImportError:
    class BaseSettingsClass:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)


class Settings(BaseSettingsClass):
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "SIH-26150 DVR/NVR Forensic Analysis Platform"
    TOOL_VERSION: str = "1.0.0-rc1"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "sqlite:///./forensics.db"

    # Storage Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    EVIDENCE_STORAGE_PATH: Path = BASE_DIR / "evidence_cases"
    FIXTURES_PATH: Path = BASE_DIR / "forensic_fixtures"
    REPORTS_OUTPUT_PATH: Path = BASE_DIR / "reports" / "generated"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # Forensic Configuration
    FORCE_READ_ONLY_ORIGINAL: bool = True
    HASH_CHUNK_SIZE_BYTES: int = 65536  # 64 KB
    DEFAULT_OPERATOR_ID: str = "INVESTIGATOR-TECH-01"


settings = Settings()

# Ensure directories exist
settings.EVIDENCE_STORAGE_PATH.mkdir(parents=True, exist_ok=True)
settings.FIXTURES_PATH.mkdir(parents=True, exist_ok=True)
settings.REPORTS_OUTPUT_PATH.mkdir(parents=True, exist_ok=True)
