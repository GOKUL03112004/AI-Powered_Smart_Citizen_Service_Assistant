from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os


class Settings(BaseSettings):
    google_api_key: str = ""
    chroma_db_path: str = "./chroma_db"
    environment: str = "development"
    allowed_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file="app.env", extra="ignore", case_sensitive=False)

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()
