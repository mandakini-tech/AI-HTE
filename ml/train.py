"""Machine Learning Model Trainer for AI-HTE Platform.

Trains 3 Scikit-learn Linear Regression models using dataset/institutions.csv:
1. Student Enrollment Model: Academic Year -> Students
2. Budget Forecast Model: Academic Year, Students, Teachers -> Budget Lakhs
3. Placement Prediction Model: Attendance Percentage, Pass Percentage, Infrastructure Score -> Placement Percentage

Evaluates models using MAE, RMSE, R² Score and saves .pkl artifacts.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "institutions.csv")
MODELS_DIR = os.path.join(BASE_DIR, "ml", "models")
SCALERS_DIR = os.path.join(BASE_DIR, "ml", "scalers")


def train_models():
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(SCALERS_DIR, exist_ok=True)

    print(f"Loading dataset from: {DATASET_PATH}")
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset file not found at {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)
    print(f"Loaded {len(df)} rows from dataset.")

    results = {}

    # -------------------------------------------------------------
    # 1. Student Enrollment Model (Year -> Total Students Aggregated by Year)
    # -------------------------------------------------------------
    print("\n--- Training Model 1: Student Enrollment Forecast ---")
    yearly_students = df.groupby("Academic Year")["Students"].sum().reset_index()
    X1 = yearly_students[["Academic Year"]]
    y1 = yearly_students["Students"]

    scaler1 = StandardScaler()
    X1_scaled = scaler1.fit_transform(X1)

    model1 = LinearRegression()
    model1.fit(X1_scaled, y1)

    y1_pred = model1.predict(X1_scaled)
    mae1 = mean_absolute_error(y1, y1_pred)
    rmse1 = np.sqrt(mean_squared_error(y1, y1_pred))
    r2_1 = r2_score(y1, y1_pred)

    print(f"  MAE: {mae1:.2f} | RMSE: {rmse1:.2f} | R²: {r2_1:.4f}")

    joblib.dump(model1, os.path.join(MODELS_DIR, "model_students.pkl"))
    joblib.dump(scaler1, os.path.join(SCALERS_DIR, "scaler_students.pkl"))

    results["students"] = {"mae": round(mae1, 2), "rmse": round(rmse1, 2), "r2": round(r2_1, 4)}

    # -------------------------------------------------------------
    # 2. Budget Model (Academic Year, Students, Teachers -> Budget Lakhs)
    # -------------------------------------------------------------
    print("\n--- Training Model 2: Budget Forecast ---")
    X2 = df[["Academic Year", "Students", "Teachers"]]
    y2 = df["Budget Lakhs"]

    X2_train, X2_test, y2_train, y2_test = train_test_split(X2, y2, test_size=0.2, random_state=42)

    scaler2 = StandardScaler()
    X2_train_scaled = scaler2.fit_transform(X2_train)
    X2_test_scaled = scaler2.transform(X2_test)

    model2 = LinearRegression()
    model2.fit(X2_train_scaled, y2_train)

    y2_pred = model2.predict(X2_test_scaled)
    mae2 = mean_absolute_error(y2_test, y2_pred)
    rmse2 = np.sqrt(mean_squared_error(y2_test, y2_pred))
    r2_2 = r2_score(y2_test, y2_pred)

    print(f"  MAE: {mae2:.2f} | RMSE: {rmse2:.2f} | R²: {r2_2:.4f}")

    joblib.dump(model2, os.path.join(MODELS_DIR, "model_budget.pkl"))
    joblib.dump(scaler2, os.path.join(SCALERS_DIR, "scaler_budget.pkl"))

    results["budget"] = {"mae": round(mae2, 2), "rmse": round(rmse2, 2), "r2": round(r2_2, 4)}

    # -------------------------------------------------------------
    # 3. Placement Model (Attendance, Pass Pct, Infrastructure -> Placement Pct)
    # -------------------------------------------------------------
    print("\n--- Training Model 3: Placement Prediction ---")
    X3 = df[["Attendance Percentage", "Pass Percentage", "Infrastructure Score"]]
    y3 = df["Placement Percentage"]

    X3_train, X3_test, y3_train, y3_test = train_test_split(X3, y3, test_size=0.2, random_state=42)

    scaler3 = StandardScaler()
    X3_train_scaled = scaler3.fit_transform(X3_train)
    X3_test_scaled = scaler3.transform(X3_test)

    model3 = LinearRegression()
    model3.fit(X3_train_scaled, y3_train)

    y3_pred = model3.predict(X3_test_scaled)
    mae3 = mean_absolute_error(y3_test, y3_pred)
    rmse3 = np.sqrt(mean_squared_error(y3_test, y3_pred))
    r2_3 = r2_score(y3_test, y3_pred)

    print(f"  MAE: {mae3:.2f} | RMSE: {rmse3:.2f} | R²: {r2_3:.4f}")

    joblib.dump(model3, os.path.join(MODELS_DIR, "model_placement.pkl"))
    joblib.dump(scaler3, os.path.join(SCALERS_DIR, "scaler_placement.pkl"))

    results["placement"] = {"mae": round(mae3, 2), "rmse": round(rmse3, 2), "r2": round(r2_3, 4)}

    print("\nAll models and scalers successfully trained and saved!")
    return results


if __name__ == "__main__":
    train_models()
