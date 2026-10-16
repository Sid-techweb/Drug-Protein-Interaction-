import os
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppSettings(BaseSettings):
    APP_NAME: str = "HelixQ Platform"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # PostgreSQL ONLY Configuration
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "helixq_admin"
    POSTGRES_PASSWORD: str = "helixq_secure_pass"
    POSTGRES_DB: str = "helixq_db"
    DATABASE_URL: str = "postgresql://helixq_admin:helixq_secure_pass@localhost:5432/helixq_db"

    # Security & Auth Infrastructure
    JWT_SECRET_KEY: str = "helixq_super_secret_enterprise_jwt_key_2026_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # External Integration
    UNIPROT_API_BASE_URL: str = "https://rest.uniprot.org/uniprotkb/"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = AppSettings()
