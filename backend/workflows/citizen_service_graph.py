from __future__ import annotations

import logging
from typing import TypedDict, Annotated
import operator

from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from rag.vector_store import VectorStoreManager
from config import get_settings

logger = logging.getLogger(__name__)


class GraphState(TypedDict):
    query: str
    intent: str
    entities: str
    retrieved_context: str
    draft_response: str
    final_response: str
    messages: Annotated[list[str], operator.add]


def _get_llm(temperature: float = 0.2) -> ChatGoogleGenerativeAI:
    settings = get_settings()
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.google_api_key,
        temperature=temperature,
    )


class CitizenServiceGraph:
    """LangGraph workflow: Query → Analyzer → Research → Generation → Review → Final."""

    def __init__(self) -> None:
        self._vector_store = VectorStoreManager()
        self._graph = self._build_graph()

    # ------------------------------------------------------------------ nodes

    def _analyze_query(self, state: GraphState) -> GraphState:
        """Step 1: Detect intent and extract entities using ReAct reasoning."""
        llm = _get_llm(temperature=0.1)
        prompt = f"""You are a Query Analyzer for a government services portal.

Analyze the following citizen query using ReAct reasoning:
Query: {state['query']}

Think step-by-step:
1. What is the citizen's primary intent? (information_request / eligibility_check / document_guidance / policy_simplification / general)
2. What key entities are present? (scheme names, document types, age, income, occupation, location)
3. What specific information does the citizen need?

Respond in this exact format:
INTENT: <one of the types above>
ENTITIES: <comma-separated list of extracted entities>
SUMMARY: <one sentence describing what the citizen needs>"""

        messages = [HumanMessage(content=prompt)]
        response = llm.invoke(messages)
        content = response.content if hasattr(response, "content") else str(response)

        intent = "information_request"
        entities = ""
        for line in content.split("\n"):
            if line.startswith("INTENT:"):
                intent = line.replace("INTENT:", "").strip()
            elif line.startswith("ENTITIES:"):
                entities = line.replace("ENTITIES:", "").strip()

        return {
            **state,
            "intent": intent,
            "entities": entities,
            "messages": [f"[Analyzer] Intent: {intent} | Entities: {entities}"],
        }

    def _research_policy(self, state: GraphState) -> GraphState:
        """Step 2: Retrieve relevant context from ChromaDB."""
        search_query = f"{state['query']} {state['entities']}"
        results = self._vector_store.similarity_search_with_score(
            search_query, k=4
        )

        context_parts: list[str] = []
        for doc, score in results:
            if score < 1.5:  # only include reasonably relevant results
                source = doc.metadata.get("source", "unknown")
                context_parts.append(
                    f"[Source: {source}]\n{doc.page_content}"
                )

        context = "\n\n---\n\n".join(context_parts) if context_parts else "No specific information found in knowledge base."

        return {
            **state,
            "retrieved_context": context,
            "messages": [f"[Research] Retrieved {len(context_parts)} relevant documents"],
        }

    def _generate_response(self, state: GraphState) -> GraphState:
        """Step 3: Generate response using Chain-of-Thought reasoning."""
        llm = _get_llm(temperature=0.1)
        prompt = f"""You are a precise, helpful government services assistant for Indian citizens.

Citizen Query: {state['query']}
Detected Intent: {state['intent']}
Extracted Entities: {state['entities']}

Retrieved Knowledge Base Context:
{state['retrieved_context']}

Using Chain-of-Thought reasoning:
1. First, understand what the citizen needs
2. Review the context for relevant information
3. Structure a highly precise and direct response
4. Avoid unnecessary fluff; be concise and straight to the point
5. Include actionable steps where applicable
6. Mention important requirements, fees, and timeframes explicitly

Provide a precise and citizen-friendly response:"""

        messages = [HumanMessage(content=prompt)]
        response = llm.invoke(messages)
        draft = response.content if hasattr(response, "content") else str(response)

        return {
            **state,
            "draft_response": draft,
            "messages": ["[Generator] Draft response created"],
        }

    def _review_response(self, state: GraphState) -> GraphState:
        """Step 4: Self-reflection review to improve response quality."""
        llm = _get_llm(temperature=0.1)
        prompt = f"""You are a Quality Review Specialist for government communications.

Original Query: {state['query']}

Draft Response to Review:
{state['draft_response']}

Apply self-reflection to improve this response:

REFLECTION CHECKLIST:
1. Is the information perfectly accurate and based only on retrieved context?
2. Is the response highly precise, concise, and straight to the point?
3. Are the steps clear and actionable without unnecessary fluff?
4. Is any critical information missing?
5. Is the response well-structured with proper formatting?
6. Does it address all parts of the citizen's query directly?

Based on your reflection, provide an improved final response that is:
- Extremely precise and concise
- Accurate and direct
- Better structured (use bullet points if helpful)
- Actionable with specific next steps

IMPROVED FINAL RESPONSE:"""

        messages = [HumanMessage(content=prompt)]
        response = llm.invoke(messages)
        final = response.content if hasattr(response, "content") else str(response)

        if final.startswith("IMPROVED FINAL RESPONSE:"):
            final = final.replace("IMPROVED FINAL RESPONSE:", "").strip()

        return {
            **state,
            "final_response": final,
            "messages": ["[Review] Response reviewed and improved"],
        }

    # ----------------------------------------------------------------- graph

    def _build_graph(self) -> StateGraph:
        workflow = StateGraph(GraphState)

        workflow.add_node("analyze_query", self._analyze_query)
        workflow.add_node("research_policy", self._research_policy)
        workflow.add_node("generate_response", self._generate_response)
        workflow.add_node("review_response", self._review_response)

        workflow.set_entry_point("analyze_query")
        workflow.add_edge("analyze_query", "research_policy")
        workflow.add_edge("research_policy", "generate_response")
        workflow.add_edge("generate_response", "review_response")
        workflow.add_edge("review_response", END)

        return workflow.compile()

    def run(self, query: str) -> dict:
        initial_state: GraphState = {
            "query": query,
            "intent": "",
            "entities": "",
            "retrieved_context": "",
            "draft_response": "",
            "final_response": "",
            "messages": [],
        }
        result = self._graph.invoke(initial_state)
        return {
            "response": result["final_response"],
            "intent": result["intent"],
            "entities": result["entities"],
            "workflow_steps": result["messages"],
        }
