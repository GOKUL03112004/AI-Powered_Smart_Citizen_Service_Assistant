from crewai import Agent
from langchain_google_genai import ChatGoogleGenerativeAI

from config import get_settings


def get_llm() -> ChatGoogleGenerativeAI:
    settings = get_settings()
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=settings.google_api_key,
        temperature=0.2,
    )


class QueryAnalyzerAgent:
    """Detects intent and extracts entities from citizen queries."""

    def build(self) -> Agent:
        return Agent(
            role="Query Analyzer",
            goal=(
                "Analyze citizen queries to detect intent (information request, "
                "eligibility check, document guidance, complaint) and extract "
                "key entities like scheme names, document types, age, income, "
                "and occupation."
            ),
            backstory=(
                "You are an expert at understanding citizen needs in the context "
                "of Indian government services. You can accurately parse natural "
                "language queries and identify what the citizen is really asking "
                "for, extracting structured information to guide subsequent agents."
            ),
            llm=get_llm(),
            verbose=False,
            allow_delegation=False,
        )
