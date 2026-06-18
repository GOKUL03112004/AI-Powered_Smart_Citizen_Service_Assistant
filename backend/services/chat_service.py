from __future__ import annotations

import logging
from typing import Optional

from workflows.citizen_service_graph import CitizenServiceGraph

logger = logging.getLogger(__name__)

_graph_instance: Optional[CitizenServiceGraph] = None


def _get_graph() -> CitizenServiceGraph:
    global _graph_instance
    if _graph_instance is None:
        _graph_instance = CitizenServiceGraph()
    return _graph_instance


class ChatService:
    """Handles citizen chat queries via the LangGraph workflow."""

    async def process(self, query: str) -> dict:
        graph = _get_graph()
        try:
            result = graph.run(query)
            return {
                "response": result["response"],
                "intent": result["intent"],
                "entities": result["entities"],
                "workflow_steps": result.get("workflow_steps", []),
                "success": True,
            }
        except Exception as exc:
            logger.error("Chat service error: %s", exc, exc_info=True)
            return {
                "response": "I apologize, I'm unable to process your query right now. Please try again.",
                "intent": "error",
                "entities": "",
                "workflow_steps": [],
                "success": False,
                "error": str(exc),
            }
