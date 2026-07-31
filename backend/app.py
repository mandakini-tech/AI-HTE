from contextlib import asynccontextmanager

import os
import sys

# Add root directory to python path so 'ml' module can be imported
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.append(ROOT_DIR)

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import analytics, chat, chatbot, prediction, recommendation
from services.data_loader import get_institutions_df

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_institutions_df()
    yield


app = FastAPI(
    title="AI-HTE API",
    description="Higher & Technical Education Analytics Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(prediction.router, prefix="/prediction", tags=["Prediction"])
app.include_router(recommendation.router, prefix="/recommendations", tags=["Recommendations"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])


@app.get("/")
async def health_check():
    return {"status": "Running"}
