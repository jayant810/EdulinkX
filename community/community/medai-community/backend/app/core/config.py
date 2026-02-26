from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str = "postgresql+psycopg://user:pass@localhost:5432/medai"
    cors_origins: str = "http://localhost:5173"
    jwt_secret: str = "change_me"
    jwt_alg: str = "HS256"
    redis_url: str = "redis://localhost:6379/0"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
