"""Decision Intelligence recommendation service powered purely by Pandas rules."""

import logging
from typing import Any

from services.data_loader import get_institutions_df

logger = logging.getLogger(__name__)


class RecommendationService:
    """Generates color-coded Decision Intelligence recommendations using Pandas rule logic."""

    @staticmethod
    def get_recommendations() -> dict[str, Any]:
        df = get_institutions_df()
        latest_year = df["Academic Year"].max()
        latest_df = df[df["Academic Year"] == latest_year]

        recommendations = []

        # 1. High AI Risk Colleges (> 70) -> Critical
        high_risk = latest_df[latest_df["AI Risk Score"] > 70]
        for _, row in high_risk.iterrows():
            recommendations.append(
                {
                    "id": f"rec-risk-{row['College Name']}",
                    "recommendation": f"Immediate AI & Operational audit required for {row['College Name']}.",
                    "priority": "Critical",
                    "reason": f"High AI Risk Score ({row['AI Risk Score']}) detected in {row['District']}.",
                    "district": str(row["District"]),
                    "college": str(row["College Name"]),
                    "category": "Risk Management",
                }
            )

        # 2. Low Placement Colleges (< 60% Critical, < 70% High)
        low_placement = latest_df[latest_df["Placement Percentage"] < 70]
        for _, row in low_placement.head(10).iterrows():
            prio = "Critical" if row["Placement Percentage"] < 60 else "High"
            recommendations.append(
                {
                    "id": f"rec-place-{row['College Name']}",
                    "recommendation": f"Enhance skill development & industry tie-ups at {row['College Name']}.",
                    "priority": prio,
                    "reason": f"Placement percentage is at {row['Placement Percentage']}% (threshold < 70%).",
                    "district": str(row["District"]),
                    "college": str(row["College Name"]),
                    "category": "Placements",
                }
            )

        # 3. Low Attendance Colleges (< 75%) -> High
        low_attendance = latest_df[latest_df["Attendance Percentage"] < 75]
        for _, row in low_attendance.head(8).iterrows():
            recommendations.append(
                {
                    "id": f"rec-att-{row['College Name']}",
                    "recommendation": f"Implement biometric tracking & student monitoring at {row['College Name']}.",
                    "priority": "High",
                    "reason": f"Student attendance dropped to {row['Attendance Percentage']}% (threshold < 75%).",
                    "district": str(row["District"]),
                    "college": str(row["College Name"]),
                    "category": "Attendance",
                }
            )

        # 4. Low Infrastructure Colleges (< 70) -> High / Medium
        low_infra = latest_df[latest_df["Infrastructure Score"] < 70]
        for _, row in low_infra.head(8).iterrows():
            recommendations.append(
                {
                    "id": f"rec-infra-{row['College Name']}",
                    "recommendation": f"Allocate infrastructure modernization funds for {row['College Name']}.",
                    "priority": "High",
                    "reason": f"Infrastructure score is {row['Infrastructure Score']}/100 in {row['District']}.",
                    "district": str(row["District"]),
                    "college": str(row["College Name"]),
                    "category": "Infrastructure",
                }
            )

        # 5. Low Pass Percentage Colleges (< 80%) -> Medium
        low_pass = latest_df[latest_df["Pass Percentage"] < 80]
        for _, row in low_pass.head(6).iterrows():
            recommendations.append(
                {
                    "id": f"rec-pass-{row['College Name']}",
                    "recommendation": f"Conduct academic review & remedial teaching at {row['College Name']}.",
                    "priority": "Medium",
                    "reason": f"Pass percentage is {row['Pass Percentage']}% (threshold < 80%).",
                    "district": str(row["District"]),
                    "college": str(row["College Name"]),
                    "category": "Academic Performance",
                }
            )

        # 6. District Faculty Recruitment Needs (Student-Teacher Ratio > 22)
        district_summary = (
            latest_df.groupby("District")
            .agg({"Students": "sum", "Teachers": "sum", "Scholarships": "sum"})
            .reset_index()
        )
        district_summary["Ratio"] = (
            district_summary["Students"] / district_summary["Teachers"].replace(0, 1)
        ).round(1)

        high_ratio_districts = district_summary[district_summary["Ratio"] > 22]
        for _, row in high_ratio_districts.iterrows():
            recommendations.append(
                {
                    "id": f"rec-fac-{row['District']}",
                    "recommendation": f"Increase faculty recruitment in {row['District']} district.",
                    "priority": "High",
                    "reason": f"High Student-Teacher ratio of {row['Ratio']}:1 across district colleges.",
                    "district": str(row["District"]),
                    "college": "District Wide",
                    "category": "Faculty & Staff",
                }
            )

        # 7. Scholarship Support Needs (High student count > 3000)
        large_colleges = latest_df[latest_df["Students"] > 3000]
        for _, row in large_colleges.head(6).iterrows():
            recommendations.append(
                {
                    "id": f"rec-schol-{row['College Name']}",
                    "recommendation": f"Expand scholarship disbursement programs at {row['College Name']}.",
                    "priority": "Medium",
                    "reason": f"Large student enrollment of {row['Students']:,} with {row['Scholarships']:,} active scholarships.",
                    "district": str(row["District"]),
                    "college": str(row["College Name"]),
                    "category": "Scholarships",
                }
            )

        # Categorize analytics counts
        critical_count = sum(1 for r in recommendations if r["priority"] == "Critical")
        high_count = sum(1 for r in recommendations if r["priority"] == "High")
        medium_count = sum(1 for r in recommendations if r["priority"] == "Medium")
        low_count = sum(1 for r in recommendations if r["priority"] == "Low")

        return {
            "totalRecommendations": len(recommendations),
            "priorityCounts": {
                "critical": critical_count,
                "high": high_count,
                "medium": medium_count,
                "low": low_count,
            },
            "recommendations": recommendations,
        }


recommendation_service = RecommendationService()
