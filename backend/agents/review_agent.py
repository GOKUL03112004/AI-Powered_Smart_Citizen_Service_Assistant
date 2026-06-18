from crewai import Agent
from langchain_google_genai import ChatGoogleGenerativeAI

from config import get_settings


def get_llm() -> ChatGoogleGenerativeAI:
    settings = get_settings()
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.google_api_key,
        temperature=0.1,
    )


class ReviewAgent:
    """Reviews responses for accuracy, clarity, and completeness via self-reflection."""

    def build(self) -> Agent:
        return Agent(
            role="Quality Review Specialist",
            goal=(
                "Review AI-generated responses about government services for "
                "accuracy, clarity, completeness, and citizen-friendliness. "
                "Use self-reflection to identify gaps, correct errors, and "
                "improve the response to ensure maximum helpfulness."
            ),
            backstory=(
                "You are a quality assurance expert for government communication. "
                "You apply rigorous self-reflection to improve responses, ensuring "
                "they are factually accurate, free from jargon, complete, and "
                "genuinely helpful to citizens of varying literacy levels. "
                "You always consider whether a citizen can take action based on "
                "the information provided."
            ),
            llm=get_llm(),
            verbose=False,
            allow_delegation=False,
        )
