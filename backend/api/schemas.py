from __future__ import annotations

from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000, description="Citizen's question")

    @field_validator("query")
    @classmethod
    def clean_query(cls, v: str) -> str:
        return v.strip()


class ChatResponse(BaseModel):
    response: str
    intent: str
    entities: str
    workflow_steps: list[str]
    success: bool


class EligibilityRequest(BaseModel):
    age: int = Field(..., ge=0, le=120, description="Age in years")
    occupation: str = Field(..., min_length=1, max_length=200, description="Occupation or profession")
    annual_income: float = Field(..., ge=0, description="Annual income in INR")


class EligibilityResponse(BaseModel):
    analysis: str
    eligible_schemes: list[dict]
    profile: dict
    success: bool


class SimplifyRequest(BaseModel):
    policy_text: str = Field(..., min_length=10, max_length=10000, description="Policy text to simplify")


class SimplifyResponse(BaseModel):
    original_length: int
    simplified_length: int
    simplified_text: str
    initial_draft: str
    success: bool


class UploadDocumentResponse(BaseModel):
    message: str
    chunks_added: int
    filename: str
    success: bool
