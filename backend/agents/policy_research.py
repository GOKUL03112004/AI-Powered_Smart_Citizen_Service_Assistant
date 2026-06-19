from crewai import Agent
from langchain_google_genai import ChatGoogleGenerativeAI

from config import get_settings


def get_llm() -> ChatGoogleGenerativeAI:
    settings = get_settings()
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.google_api_key,
        temperature=0.3,
    )


class PolicyResearchAgent:
    """Retrieves and synthesizes information from the knowledge base."""

    def build(self) -> Agent:
        return Agent(
            role="Policy Research Specialist",
            goal=(
                "Research and retrieve accurate information about government "
                "schemes, policies, and service procedures. Synthesize retrieved "
                "information into comprehensive, well-structured answers."
            ),
            backstory=(
                "You are a highly knowledgeable government policy researcher with "
                "deep understanding of Indian welfare schemes, government services, "
                "eligibility criteria, and application processes. You specialize "
                "in making complex policy information accessible and accurate."
            ),
            llm=get_llm(),
            verbose=False,
            allow_delegation=False,
        )
