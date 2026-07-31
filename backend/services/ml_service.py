"""ML service wrapper providing model predictions and accuracy metrics."""

import logging
import os
import sys
from typing import Any

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from ml.predict import predict_budget, predict_placement, predict_students
from services.data_loader import get_institutions_df

logger = logging.getLogger(__name__)


class MLService:
    """Interface between FastAPI backend services and Scikit-learn trained models."""

    @staticmethod
    def get_enrollment_forecast(future_years: list[int] | None = None) -> list[dict[str, Any]]:
        if future_years is None:
            future_years = [2026, 2027, 2028, 2029, 2030]

        df = get_institutions_df()
        yearly = df.groupby("Academic Year")["Students"].sum().reset_index()

        historical = [
            {"year": int(row["Academic Year"]), "students": int(row["Students"]), "isForecast": False}
            for _, row in yearly.iterrows()
        ]

        predictions = predict_students(future_years)
        forecast = [
            {"year": item["year"], "students": item["students"], "isForecast": True}
            for item in predictions
        ]

        return historical + forecast

    @staticmethod
    def get_budget_forecast(future_years: list[int] | None = None) -> list[dict[str, Any]]:
        if future_years is None:
            future_years = [2026, 2027, 2028, 2029, 2030]

        df = get_institutions_df()
        latest = df[df["Academic Year"] == df["Academic Year"].max()]

        base_students = latest["Students"].sum()
        base_teachers = latest["Teachers"].sum()

        input_features = []
        for idx, y in enumerate(future_years, 1):
            # Apply estimated ~4% annual student growth and ~3% faculty growth
            est_students = int(base_students * ((1.04) ** idx))
            est_teachers = int(base_teachers * ((1.03) ** idx))
            input_features.append((y, est_students, est_teachers))

        preds = predict_budget(input_features)

        yearly_hist = df.groupby("Academic Year")["Budget Lakhs"].sum().reset_index()
        historical = [
            {
                "year": int(row["Academic Year"]),
                "budgetLakhs": float(row["Budget Lakhs"]),
                "budgetCr": round(float(row["Budget Lakhs"]) / 100.0, 2),
                "isForecast": False,
            }
            for _, row in yearly_hist.iterrows()
        ]

        forecast = [
            {
                "year": item["year"],
                "budgetLakhs": item["budgetLakhs"],
                "budgetCr": item["budgetCr"],
                "isForecast": True,
            }
            for item in preds
        ]

        return historical + forecast

    @staticmethod
    def get_placement_forecast() -> list[dict[str, Any]]:
        df = get_institutions_df()
        yearly = df.groupby("Academic Year").agg(
            {
                "Placement Percentage": "mean",
                "Attendance Percentage": "mean",
                "Pass Percentage": "mean",
                "Infrastructure Score": "mean",
            }
        ).reset_index()

        historical = [
            {
                "year": int(row["Academic Year"]),
                "placementPercentage": round(float(row["Placement Percentage"]), 2),
                "isForecast": False,
            }
            for _, row in yearly.iterrows()
        ]

        # Forecast next 5 years based on infrastructure & pass rate trends
        latest_row = yearly.iloc[-1]
        input_features = []
        for i in range(1, 6):
            att = min(100.0, latest_row["Attendance Percentage"] + i * 0.5)
            pass_p = min(100.0, latest_row["Pass Percentage"] + i * 0.4)
            infra = min(100.0, latest_row["Infrastructure Score"] + i * 0.6)
            input_features.append((att, pass_p, infra))

        preds = predict_placement(input_features)
        forecast = [
            {
                "year": 2025 + idx,
                "placementPercentage": item["placementPercentage"],
                "isForecast": True,
            }
            for idx, item in enumerate(preds, 1)
        ]

        return historical + forecast


ml_service = MLService()
