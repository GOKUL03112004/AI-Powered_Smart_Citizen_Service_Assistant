from __future__ import annotations

import logging

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

from rag.vector_store import VectorStoreManager
from config import get_settings

logger = logging.getLogger(__name__)


class EligibilityService:
    """Determines scheme eligibility using Chain-of-Thought reasoning."""

    def __init__(self) -> None:
        self._vector_store = VectorStoreManager()

    def _get_llm(self) -> ChatGoogleGenerativeAI:
        settings = get_settings()
        return ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=settings.google_api_key,
            temperature=0.1,
        )

    async def check_eligibility(
        self,
        age: int,
        occupation: str,
        annual_income: float,
    ) -> dict:
        try:
            search_query = f"eligibility criteria age {age} occupation {occupation} income {annual_income}"
            docs = self._vector_store.similarity_search(search_query, k=6)
            context = "\n\n---\n\n".join(
                f"[{doc.metadata.get('source', 'unknown')}]\n{doc.page_content}"
                for doc in docs
            )

            llm = self._get_llm()
            prompt = f"""You are a government scheme eligibility expert. Analyze eligibility for a citizen.

CITIZEN PROFILE:
- Age: {age} years
- Occupation: {occupation}
- Annual Income: Rs. {annual_income:,.0f}

KNOWLEDGE BASE (relevant scheme information):
{context}

Using Chain-of-Thought reasoning, analyze eligibility for ALL relevant schemes:

STEP 1: Identify all schemes in the context
STEP 2: For each scheme, check eligibility criteria against the citizen's profile
STEP 3: Determine if the citizen is ELIGIBLE, NOT ELIGIBLE, or POTENTIALLY ELIGIBLE
STEP 4: Explain the reasoning for each determination

Provide your analysis in this structured format:

## Eligibility Analysis

For each relevant scheme found, provide:
**Scheme Name**: [name]
**Status**: [ELIGIBLE / NOT ELIGIBLE / POTENTIALLY ELIGIBLE]
**Reasoning**: [step-by-step analysis]
**Key Benefits**: [what they would receive if eligible]
**Next Steps**: [what to do to apply]

End with a SUMMARY section listing all eligible schemes."""

            messages = [HumanMessage(content=prompt)]
            response = llm.invoke(messages)
            analysis = response.content if hasattr(response, "content") else str(response)

            eligible_schemes: list[dict] = []
            for line in analysis.split("\n"):
                if "**Scheme Name**:" in line:
                    scheme_name = line.replace("**Scheme Name**:", "").strip()
                elif "**Status**: ELIGIBLE" in line:
                    eligible_schemes.append({"name": scheme_name, "status": "eligible"})
                elif "**Status**: NOT ELIGIBLE" in line:
                    eligible_schemes.append({"name": scheme_name, "status": "not_eligible"})
                elif "**Status**: POTENTIALLY ELIGIBLE" in line:
                    eligible_schemes.append({"name": scheme_name, "status": "potential"})

            return {
                "analysis": analysis,
                "eligible_schemes": eligible_schemes,
                "profile": {"age": age, "occupation": occupation, "annual_income": annual_income},
                "success": True,
            }

        except Exception as exc:
            logger.error("Eligibility service error: %s", exc, exc_info=True)
            return {
                "analysis": "Unable to process eligibility check. Please try again.",
                "eligible_schemes": [],
                "profile": {"age": age, "occupation": occupation, "annual_income": annual_income},
                "success": False,
                "error": str(exc),
            }
