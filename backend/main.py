from __future__ import annotations

import logging
import sys
import structlog
from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv

load_dotenv("app.env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from api.routes import router
from api.auth_routes import router as auth_router
from rag.vector_store import VectorStoreManager
from rag.document_loader import DocumentLoader
import models
from database import engine

models.Base.metadata.create_all(bind=engine)

structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logging.basicConfig(
    format="%(message)s",
    stream=sys.stdout,
    level=logging.INFO,
)

logger = structlog.get_logger(__name__)

def _seed_knowledge_base() -> None:
    """Load built-in documents into ChromaDB if the collection is empty."""
    vs = VectorStoreManager()
    if vs.collection_count() > 0:
        logger.info("Knowledge base already seeded (%d chunks)", vs.collection_count())
        return

    data_dir = Path(__file__).parent / "data"
    loader = DocumentLoader(str(data_dir))
    docs = loader.load_all()
    if docs:
        vs.add_documents(docs)
        logger.info("Seeded knowledge base with %d document chunks", len(docs))
    else:
        logger.warning("No documents found in %s", data_dir)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up Citizen Service API...")
    _seed_knowledge_base()
    yield
    logger.info("Shutting down Citizen Service API")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="AI-Powered Smart Citizen Service Assistant",
        description="Government services assistant powered by Gemini, LangChain, LangGraph, and CrewAI",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
    app.include_router(router, prefix="/api/v1")

    @app.get("/")
    async def root():
        return {"message": "Citizen Service Assistant API", "version": "1.0.0", "docs": "/docs"}

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
