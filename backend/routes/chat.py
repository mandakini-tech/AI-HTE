"""Chat endpoint — orchestrates the AI assistant pipeline via ChatService."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.chat_service import chat_service

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: str = Field(default="default")
    history: list[ChatMessage] | None = None


class ChatResponse(BaseModel):
    answer: str
    table: dict | None = None
    chart: dict | None = None
    insights: list[str] = []


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    session_id = request.session_id or "default"
    history_dicts = [msg.model_dump() for msg in request.history] if request.history else None

    try:
        response = await chat_service.process_chat(
            message=message,
            session_id=session_id,
            client_history=history_dicts,
        )
        return ChatResponse(**response)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process query: {exc}",
        ) from exc
