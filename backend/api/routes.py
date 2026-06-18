from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import JSONResponse

from api.schemas import (
    ChatRequest,
    ChatResponse,
    EligibilityRequest,
    EligibilityResponse,
    SimplifyRequest,
    SimplifyResponse,
    UploadDocumentResponse,
)
from services.chat_service import ChatService
from services.eligibility_service import EligibilityService
from services.simplifier_service import SimplifierService
from rag.vector_store import VectorStoreManager
from rag.document_loader import DocumentLoader
from api.auth import get_current_user
import models

logger = logging.getLogger(__name__)
router = APIRouter()

_chat_service = ChatService()
_eligibility_service = EligibilityService()
_simplifier_service = SimplifierService()


@router.post("/chat", response_model=ChatResponse, summary="Citizen chat assistant")
async def chat(request: ChatRequest, current_user: models.User = Depends(get_current_user)) -> ChatResponse:
    """Process a citizen's question using the LangGraph ReAct workflow."""
    result = await _chat_service.process(request.query)
    return ChatResponse(**result)


@router.post("/eligibility", response_model=EligibilityResponse, summary="Check scheme eligibility")
async def check_eligibility(request: EligibilityRequest, current_user: models.User = Depends(get_current_user)) -> EligibilityResponse:
    """Determine eligible government schemes based on citizen profile."""
    result = await _eligibility_service.check_eligibility(
        age=request.age,
        occupation=request.occupation,
        annual_income=request.annual_income,
    )
    return EligibilityResponse(**result)


@router.post("/simplify-policy", response_model=SimplifyResponse, summary="Simplify policy text")
async def simplify_policy(request: SimplifyRequest, current_user: models.User = Depends(get_current_user)) -> SimplifyResponse:
    """Convert complex government policy language into citizen-friendly text."""
    result = await _simplifier_service.simplify(request.policy_text)
    return SimplifyResponse(**result)


@router.post(
    "/upload-document",
    response_model=UploadDocumentResponse,
    summary="Upload document to knowledge base",
)
async def upload_document(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user)) -> UploadDocumentResponse:
    """Upload a text document to the ChromaDB knowledge base."""
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No filename provided")

    allowed_types = {"text/plain", "application/octet-stream"}
    if file.content_type not in allowed_types and not file.filename.endswith(".txt"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only .txt files are supported",
        )

    try:
        content_bytes = await file.read()
        text = content_bytes.decode("utf-8")

        loader = DocumentLoader()
        source = file.filename.replace(".txt", "")
        docs = loader.load_text(text, source=source)

        vs = VectorStoreManager()
        vs.add_documents(docs)

        return UploadDocumentResponse(
            message=f"Successfully added '{file.filename}' to the knowledge base.",
            chunks_added=len(docs),
            filename=file.filename,
            success=True,
        )
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be UTF-8 encoded text",
        )
    except Exception as exc:
        logger.error("Upload error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process document: {str(exc)}",
        )


@router.get("/health", summary="Health check")
async def health() -> dict:
    vs = VectorStoreManager()
    doc_count = vs.collection_count()
    return {"status": "healthy", "documents_in_kb": doc_count}
