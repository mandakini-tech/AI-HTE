"""In-memory conversation history store (last 10 messages per session)."""

from collections import defaultdict
from threading import Lock

MAX_MESSAGES = 10


class ConversationStore:
    """Thread-safe store for chat session history."""

    def __init__(self) -> None:
        self._sessions: dict[str, list[dict]] = defaultdict(list)
        self._lock = Lock()

    def add_message(self, session_id: str, role: str, content: str) -> None:
        with self._lock:
            messages = self._sessions[session_id]
            messages.append({"role": role, "content": content})
            if len(messages) > MAX_MESSAGES:
                self._sessions[session_id] = messages[-MAX_MESSAGES:]

    def get_history(self, session_id: str) -> list[dict]:
        with self._lock:
            return list(self._sessions.get(session_id, []))

    def clear(self, session_id: str) -> None:
        with self._lock:
            self._sessions.pop(session_id, None)


conversation_store = ConversationStore()
