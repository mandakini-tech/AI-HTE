from services.data_loader import get_institutions_df


def _get_latest_df():
    """Return rows for the most recent academic year."""
    df = get_institutions_df()
    latest_year = df["Academic Year"].max()
    latest = df[df["Academic Year"] == latest_year]
    return latest if not latest.empty else df


class AnalyticsService:
    """Service layer for analytics computations over institutions.csv."""

    @staticmethod
    def get_summary():
        latest = _get_latest_df()
        total_students = int(latest["Students"].sum())
        total_teachers = int(latest["Teachers"].sum())

        return {
            "totalInstitutions": int(latest["College Name"].nunique()),
            "totalStudents": total_students,
            "maleStudents": int(latest["Students Male"].sum()),
            "femaleStudents": int(latest["Students Female"].sum()),
            "totalTeachers": total_teachers,
            "studentTeacherRatio": round(
                total_students / total_teachers, 2
            )
            if total_teachers > 0
            else 0.0,
            "averagePlacement": round(
                float(latest["Placement Percentage"].mean()), 2
            ),
            "averageAttendance": round(
                float(latest["Attendance Percentage"].mean()), 2
            ),
            "averagePassPercentage": round(
                float(latest["Pass Percentage"].mean()), 2
            ),
            "totalScholarships": int(latest["Scholarships"].sum()),
            "averageInfrastructure": round(
                float(latest["Infrastructure Score"].mean()), 2
            ),
            "averageAIRisk": round(float(latest["AI Risk Score"].mean()), 2),
            "totalBudget": int(latest["Budget Lakhs"].sum()),
        }

    @staticmethod
    def get_districts():
        latest = _get_latest_df()
        grouped = (
            latest.groupby("District")
            .agg(
                students=("Students", "sum"),
                teachers=("Teachers", "sum"),
                placement=("Placement Percentage", "mean"),
                passPercentage=("Pass Percentage", "mean"),
                attendance=("Attendance Percentage", "mean"),
                budget=("Budget Lakhs", "sum"),
                scholarships=("Scholarships", "sum"),
                infrastructure=("Infrastructure Score", "mean"),
            )
            .reset_index()
            .rename(columns={"District": "district"})
        )

        for col in ["placement", "passPercentage", "attendance", "infrastructure"]:
            grouped[col] = grouped[col].round(2)

        return (
            grouped.sort_values(by="students", ascending=False)
            .to_dict(orient="records")
        )

    @staticmethod
    def get_universities():
        latest = _get_latest_df()
        grouped = (
            latest.groupby("University Name")
            .agg(
                students=("Students", "sum"),
                colleges=("College Name", "count"),
                teachers=("Teachers", "sum"),
                placement=("Placement Percentage", "mean"),
                passPercentage=("Pass Percentage", "mean"),
                budget=("Budget Lakhs", "sum"),
            )
            .reset_index()
            .rename(columns={"University Name": "university"})
        )

        grouped["placement"] = grouped["placement"].round(2)
        grouped["passPercentage"] = grouped["passPercentage"].round(2)

        return (
            grouped.sort_values(by="students", ascending=False)
            .to_dict(orient="records")
        )

    @staticmethod
    def _format_college_row(row):
        return {
            "college": row["College Name"],
            "district": row["District"],
            "university": row["University Name"],
            "students": int(row["Students"]),
            "placement": int(row["Placement Percentage"]),
            "passPercentage": int(row["Pass Percentage"]),
            "attendance": int(row["Attendance Percentage"]),
        }

    @staticmethod
    def get_placement():
        latest = _get_latest_df()
        sorted_df = latest.sort_values(by="Placement Percentage", ascending=False)

        top_10 = sorted_df.head(10)
        bottom_10 = latest.sort_values(
            by="Placement Percentage", ascending=True
        ).head(10)

        return {
            "top10Colleges": [
                AnalyticsService._format_college_row(row)
                for _, row in top_10.iterrows()
            ],
            "bottom10Colleges": [
                AnalyticsService._format_college_row(row)
                for _, row in bottom_10.iterrows()
            ],
            "averagePlacement": round(
                float(latest["Placement Percentage"].mean()), 2
            ),
        }

    @staticmethod
    def get_scholarships():
        latest = _get_latest_df()
        by_district = (
            latest.groupby("District")["Scholarships"]
            .sum()
            .reset_index()
            .rename(columns={"District": "district", "Scholarships": "scholarships"})
            .sort_values(by="scholarships", ascending=False)
        )

        top_colleges = latest.sort_values(by="Scholarships", ascending=False).head(10)

        return {
            "totalScholarships": int(latest["Scholarships"].sum()),
            "byDistrict": by_district.to_dict(orient="records"),
            "topColleges": [
                {
                    "college": row["College Name"],
                    "district": row["District"],
                    "scholarships": int(row["Scholarships"]),
                }
                for _, row in top_colleges.iterrows()
            ],
        }

    @staticmethod
    def get_enrollment_trend():
        df = get_institutions_df()
        grouped = (
            df.groupby("Academic Year")
            .agg(enrollment=("Students", "sum"))
            .reset_index()
            .rename(columns={"Academic Year": "year"})
            .sort_values(by="year")
        )
        return grouped.to_dict(orient="records")

    @staticmethod
    def get_budget_allocation():
        df = get_institutions_df()
        grouped = (
            df.groupby("Academic Year")
            .agg(budget=("Budget Lakhs", "sum"))
            .reset_index()
            .rename(columns={"Academic Year": "year"})
            .sort_values(by="year")
        )
        return grouped.to_dict(orient="records")

    @staticmethod
    def get_gender_distribution():
        summary = AnalyticsService.get_summary()
        return [
            {"name": "Male", "value": summary["maleStudents"]},
            {"name": "Female", "value": summary["femaleStudents"]},
        ]

    @staticmethod
    def get_dashboard():
        latest = _get_latest_df()
        districts = AnalyticsService.get_districts()
        universities = AnalyticsService.get_universities()
        placement = AnalyticsService.get_placement()

        return {
            "summary": AnalyticsService.get_summary(),
            "enrollmentTrend": AnalyticsService.get_enrollment_trend(),
            "topDistricts": districts[:10],
            "genderDistribution": AnalyticsService.get_gender_distribution(),
            "budgetAllocation": AnalyticsService.get_budget_allocation(),
            "topUniversities": universities[:10],
            "top10Colleges": placement["top10Colleges"],
        }
