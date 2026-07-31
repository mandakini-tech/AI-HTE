"""Verification script for Phase 4 API endpoints."""

import asyncio
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from routes.prediction import (
    get_budget_predictions,
    get_enrollment_predictions,
    get_placement_predictions,
    get_prediction_summary,
)
from routes.recommendation import get_recommendations


async def main():
    print("==================================================")
    print("       AI-HTE PHASE 4 PIPELINE VERIFICATION       ")
    print("==================================================\n")

    # 1. Enrollment Forecast
    print("[1/5] Testing GET /prediction/enrollment...")
    enr = await get_enrollment_predictions()
    print(f"  • Returned {len(enr)} data points.")
    if enr:
        print(f"  • Sample forecast point: {enr[-1]}")
    print("-" * 50)

    # 2. Budget Forecast
    print("[2/5] Testing GET /prediction/budget...")
    bud = await get_budget_predictions()
    print(f"  • Returned {len(bud)} data points.")
    if bud:
        print(f"  • Sample forecast point: {bud[-1]}")
    print("-" * 50)

    # 3. Placement Forecast
    print("[3/5] Testing GET /prediction/placement...")
    plc = await get_placement_predictions()
    print(f"  • Returned {len(plc)} data points.")
    if plc:
        print(f"  • Sample forecast point: {plc[-1]}")
    print("-" * 50)

    # 4. Prediction Summary
    print("[4/5] Testing GET /prediction/summary...")
    summ = await get_prediction_summary()
    print(f"  • Predicted Students (2026): {summ.get('predictedStudentsNextYear'):,}")
    print(f"  • Predicted Budget (2026): INR {summ.get('predictedBudgetNextYearCr'):,} Cr")
    print(f"  • Predicted Placement (2026): {summ.get('predictedPlacementNextYear')}%")
    print(f"  • Highest Growth District: {summ.get('highestGrowthDistrict')}")
    print(f"  • Lowest Growth District: {summ.get('lowestGrowthDistrict')}")
    print(f"  • Forecast Table Rows: {len(summ.get('forecastTable', []))}")
    print("-" * 50)

    # 5. Recommendations
    print("[5/5] Testing GET /recommendations...")
    recs = await get_recommendations()
    print(f"  • Total Recommendations: {recs.get('totalRecommendations')}")
    print(f"  • Priority Counts: {recs.get('priorityCounts')}")
    if recs.get("recommendations"):
        sample = recs["recommendations"][0]
        print(f"  • Sample recommendation: Priority='{sample['priority']}', District='{sample['district']}', Action='{sample['recommendation'][:60]}...'")
    print("-" * 50)

    print("\nPhase 4 API Pipeline successfully verified!")


if __name__ == "__main__":
    asyncio.run(main())
