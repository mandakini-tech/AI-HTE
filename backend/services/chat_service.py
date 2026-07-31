"""Chat service orchestrating the Phase 3 AI Assistant pipeline."""

import logging
from typing import Any

from services.conversation_store import conversation_store
from services.data_analyzer import analyze
from services.query_parser import parse_query
from services.response_formatter import format_response

logger = logging.getLogger(__name__)


class ChatService:
    """Orchestrates natural language intent parsing, Pandas analysis, and response formatting."""

    @staticmethod
    async def process_chat(
        message: str,
        session_id: str = "default",
        client_history: list[dict] | None = None,
    ) -> dict[str, Any]:
        """Execute Phase 3 AI Assistant workflow:

        User -> History -> Gemini Intent Parser -> Pandas Data Analyzer -> Response Formatter -> Gemini Summary Generator -> Response
        """
        clean_message = message.strip()

        # Update in-memory session history if client sent history
        if client_history:
            conversation_store.clear(session_id)
            for msg in client_history[-10:]:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                conversation_store.add_message(session_id, role, content)

        # Get existing history for context (up to last 10 messages)
        history = conversation_store.get_history(session_id)

        # Add user message to history
        conversation_store.add_message(session_id, "user", clean_message)

        # 1. Gemini Intent Parser (no math/calculations)
        parsed_query = await parse_query(clean_message, history)

        # 2. Pandas Data Analyzer (all aggregations & calculations executed in Pandas)
        analysis_result = analyze(parsed_query)

        # 3. Response Formatter + Gemini Summary Generator
        response_payload = await format_response(
            user_message=clean_message,
            query=parsed_query,
            result=analysis_result,
            history=history,
        )

        # Add assistant answer to history
        conversation_store.add_message(
            session_id, "assistant", response_payload.get("answer", "")
        )

        return response_payload


chat_service = ChatService()
