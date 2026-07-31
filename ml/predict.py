"""Prediction module to execute model inference for future years."""

import os
import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "ml", "models")
SCALERS_DIR = os.path.join(BASE_DIR, "ml", "scalers")

_models = {}
_scalers = {}


def load_artifacts():
    global _models, _scalers
    if not _models:
        model_names = ["students", "budget", "placement"]
        for name in model_names:
            model_path = os.path.join(MODELS_DIR, f"model_{name}.pkl")
            scaler_path = os.path.join(SCALERS_DIR, f"scaler_{name}.pkl")

            if os.path.exists(model_path) and os.path.exists(scaler_path):
                _models[name] = joblib.load(model_path)
                _scalers[name] = joblib.load(scaler_path)


def predict_students(years: list[int]) -> list[dict]:
    load_artifacts()
    if "students" not in _models:
        return []

    model = _models["students"]
    scaler = _scalers["students"]

    df_in = pd.DataFrame({"Academic Year": years})
    X_scaled = scaler.transform(df_in)
    preds = model.predict(X_scaled)

    return [
        {"year": int(y), "students": max(0, int(round(p)))}
        for y, p in zip(years, preds)
    ]


def predict_budget(input_features: list[tuple[int, int, int]]) -> list[dict]:
    """input_features: list of (year, students, teachers)"""
    load_artifacts()
    if "budget" not in _models:
        return []

    model = _models["budget"]
    scaler = _scalers["budget"]

    df_in = pd.DataFrame(input_features, columns=["Academic Year", "Students", "Teachers"])
    X_scaled = scaler.transform(df_in)
    preds = model.predict(X_scaled)

    return [
        {
            "year": int(feat[0]),
            "budgetLakhs": max(0, round(float(p), 2)),
            "budgetCr": round(float(p) / 100.0, 2),
        }
        for feat, p in zip(input_features, preds)
    ]


def predict_placement(input_features: list[tuple[float, float, float]]) -> list[dict]:
    """input_features: list of (attendance, pass_pct, infrastructure)"""
    load_artifacts()
    if "placement" not in _models:
        return []

    model = _models["placement"]
    scaler = _scalers["placement"]

    df_in = pd.DataFrame(
        input_features,
        columns=["Attendance Percentage", "Pass Percentage", "Infrastructure Score"],
    )
    X_scaled = scaler.transform(df_in)
    preds = model.predict(X_scaled)

    return [
        {"placementPercentage": min(100.0, max(0.0, round(float(p), 2)))}
        for p in preds
    ]
