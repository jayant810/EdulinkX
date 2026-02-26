from fastapi import FastAPI

from app.api.router import api_router
from app.core.cors import add_cors

app = FastAPI(title="MedAI API")

add_cors(app)
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
def healthcheck() -> dict:
    return {"status": "ok"}
