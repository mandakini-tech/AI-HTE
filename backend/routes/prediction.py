"""Prediction route endpoints for enrollment, budget, placement forecasts, and summary analytics."""

from fastapi import APIRouter
from services.ml_service import ml_service
from services.prediction_service import prediction_service

router = APIRouter()


@router.get("/enrollment")
async def get_enrollment_predictions():
    return ml_service.get_enrollment_forecast()


@router.get("/budget")
async def get_budget_predictions():
    return ml_service.get_budget_forecast()


@router.get("/placement")
async def get_placement_predictions():
    return ml_service.get_placement_forecast()


@router.get("/summary")
async def get_prediction_summary():
    return prediction_service.get_summary()
