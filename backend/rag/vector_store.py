import os
import logging
from pathlib import Path
from typing import Optional

import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document

from config import get_settings

logger = logging.getLogger(__name__)


class VectorStoreManager:
    _instance: Optional["VectorStoreManager"] = None
    _vector_store: Optional[Chroma] = None

    def __new__(cls) -> "VectorStoreManager":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        if self._vector_store is not None:
            return
        settings = get_settings()
        self._embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-2",
            google_api_key=settings.google_api_key,
        )
        db_path = Path(settings.chroma_db_path)
        db_path.mkdir(parents=True, exist_ok=True)
        self._client = chromadb.PersistentClient(
            path=str(db_path),
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        self._vector_store = Chroma(
            client=self._client,
            collection_name="citizen_services",
            embedding_function=self._embeddings,
        )
        logger.info("VectorStore initialized at %s", db_path)

    @property
    def store(self) -> Chroma:
        return self._vector_store  # type: ignore[return-value]

    def add_documents(self, documents: list[Document]) -> list[str]:
        ids = self._vector_store.add_documents(documents)  # type: ignore[union-attr]
        logger.info("Added %d documents to vector store", len(documents))
        return ids

    def similarity_search(self, query: str, k: int = 4) -> list[Document]:
        return self._vector_store.similarity_search(query, k=k)  # type: ignore[union-attr]

    def similarity_search_with_score(
        self, query: str, k: int = 4
    ) -> list[tuple[Document, float]]:
        return self._vector_store.similarity_search_with_score(query, k=k)  # type: ignore[union-attr]

    def get_retriever(self, k: int = 4):
        return self._vector_store.as_retriever(  # type: ignore[union-attr]
            search_type="similarity",
            search_kwargs={"k": k},
        )

    def collection_count(self) -> int:
        try:
            col = self._client.get_collection("citizen_services")
            return col.count()
        except Exception:
            return 0
