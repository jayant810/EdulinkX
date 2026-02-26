from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings


def add_cors(app: FastAPI) -> None:
    settings = get_settings()
    origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
