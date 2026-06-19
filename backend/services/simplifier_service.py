from __future__ import annotations

import logging

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

from config import get_settings

logger = logging.getLogger(__name__)


class SimplifierService:
    """Simplifies government policy text using Self-Reflection."""

    def _get_llm(self, temperature: float = 0.3) -> ChatGoogleGenerativeAI:
        settings = get_settings()
        return ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=settings.google_api_key,
            temperature=temperature,
        )

    async def simplify(self, policy_text: str) -> dict:
        try:
            llm = self._get_llm(temperature=0.3)

            # First pass: initial simplification
            initial_prompt = f"""You are an expert at translating complex government policy language into simple, citizen-friendly text.

ORIGINAL POLICY TEXT:
{policy_text}

Simplify this policy text so that:
1. An average citizen with basic education can understand it
2. Technical/legal jargon is replaced with everyday language
3. Long sentences are broken into shorter ones
4. Key points are clearly highlighted
5. The meaning is preserved accurately

SIMPLIFIED VERSION:"""

            messages = [HumanMessage(content=initial_prompt)]
            initial_response = llm.invoke(messages)
            initial_simplified = initial_response.content if hasattr(initial_response, "content") else str(initial_response)
            if initial_simplified.startswith("SIMPLIFIED VERSION:"):
                initial_simplified = initial_simplified.replace("SIMPLIFIED VERSION:", "").strip()

            # Second pass: Self-reflection to improve
            reflection_prompt = f"""You are reviewing your own simplification of a government policy for quality.

ORIGINAL POLICY:
{policy_text}

YOUR INITIAL SIMPLIFICATION:
{initial_simplified}

Apply self-reflection using this checklist:
1. Is every important point from the original preserved?
2. Is any sentence still too complex or uses jargon?
3. Is the flow logical and easy to follow?
4. Would a person with only basic education understand this?
5. Are there any ambiguities or unclear parts?
6. Could the formatting be improved (bullet points, sections)?

Based on your self-reflection, provide an IMPROVED final version that addresses all shortcomings.

Also provide:
- KEY POINTS: A bullet list of the most important takeaways (max 5 points)
- CITIZEN ACTION: What the citizen needs to do (if applicable)
- IMPORTANT DATES/DEADLINES: Any time-sensitive information

FORMAT YOUR RESPONSE AS:
## Simplified Policy

[simplified text here]

## Key Takeaways
[bullet points]

## What You Need to Do
[action steps if any]

## Important Notes
[deadlines, warnings, special conditions]"""

            messages2 = [HumanMessage(content=reflection_prompt)]
            final_response = llm.invoke(messages2)
            final_simplified = final_response.content if hasattr(final_response, "content") else str(final_response)

            return {
                "original_length": len(policy_text),
                "simplified_length": len(final_simplified),
                "simplified_text": final_simplified,
                "initial_draft": initial_simplified,
                "success": True,
            }

        except Exception as exc:
            logger.error("Simplifier service error: %s", exc, exc_info=True)
            return {
                "original_length": len(policy_text),
                "simplified_length": 0,
                "simplified_text": "Unable to simplify the policy text. Please try again.",
                "initial_draft": "",
                "success": False,
                "error": str(exc),
            }
