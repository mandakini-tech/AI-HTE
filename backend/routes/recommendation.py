"""Recommendation route endpoint for rule-based decision intelligence."""

from fastapi import APIRouter
from services.recommendation_service import recommendation_service

router = APIRouter()


@router.get("/")
async def get_recommendations():
    return recommendation_service.get_recommendations()
