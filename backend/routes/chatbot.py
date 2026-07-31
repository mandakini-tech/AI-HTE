from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ChatQuery(BaseModel):
    message: str


@router.post("/query")
async def chat_query(query: ChatQuery):
    return {
        "message": "Chatbot query endpoint — coming soon",
        "query": query.message,
    }


@router.post("/upload")
async def upload_csv():
    return {"message": "CSV upload endpoint — coming soon"}
