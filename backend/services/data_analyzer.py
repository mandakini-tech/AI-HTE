"""Execute parsed queries using Pandas — all calculations happen here."""

import pandas as pd

from services.analytics_service import AnalyticsService
from services.data_loader import get_institutions_df
from services.query_parser import ParsedQuery

PERCENTAGE_COLUMNS = {
    "Placement Percentage",
    "Pass Percentage",
    "Attendance Percentage",
}


def _apply_filters(df: pd.DataFrame, filters: list[dict]) -> pd.DataFrame:
    result = df.copy()
    for f in filters:
        col = f["column"]
        op = f.get("operator", "eq")
        val = f.get("value")
        if col not in result.columns or val is None:
            continue

        if op == "eq":
            result = result[result[col].astype(str).str.lower() == str(val).lower()]
        elif op == "contains":
            result = result[result[col].astype(str).str.contains(str(val), case=False, na=False)]
        elif op == "gt":
            result = result[result[col] > float(val)]
        elif op == "lt":
            result = result[result[col] < float(val)]
        elif op == "gte":
            result = result[result[col] >= float(val)]
        elif op == "lte":
            result = result[result[col] <= float(val)]

    return result


def _aggregate(df: pd.DataFrame, col: str, agg: str) -> pd.Series:
    if agg == "sum":
        return df[col].sum()
    if agg == "mean":
        return df[col].mean()
    if agg == "count":
        return df[col].count()
    if agg == "min":
        return df[col].min()
    if agg == "max":
        return df[col].max()
    return df[col].sum()


def _round_value(val, col: str):
    if col in PERCENTAGE_COLUMNS or col in {"Infrastructure Score", "AI Risk Score"}:
        return round(float(val), 2)
    return int(val) if pd.notna(val) else 0


def _to_camel_key(name: str) -> str:
    return (
        name.replace(" ", "")
        .replace("_", "")
        .replace("%", "Pct")
        .replace("(", "")
        .replace(")", "")
        .replace("/", "")
        .replace("-", "")
        .replace(".", "")
        .replace(",", "")
        .replace("'", "")
        .replace('"', "")
        .replace("NAACGrade", "naacGrade")
        .replace("CollegeName", "college")
        .replace("UniversityName", "university")
        .replace("District", "district")
        .replace("AcademicYear", "year")
        .replace("StudentsMale", "studentsMale")
        .replace("StudentsFemale", "studentsFemale")
        .replace("PlacementPercentage", "placement")
        .replace("PassPercentage", "passPercentage")
        .replace("AttendancePercentage", "attendance")
        .replace("InfrastructureScore", "infrastructure")
        .replace("AIRiskScore", "aiRisk")
        .replace("BudgetLakhs", "budget")
        .replace("Students", "students")
        .replace("Teachers", "teachers")
        .replace("Scholarships", "scholarships")
    )


def _rename_columns(records: list[dict]) -> list[dict]:
    renamed = []
    for row in records:
        renamed.append({_to_camel_key(k): v for k, v in row.items()})
    return renamed


class AnalysisResult:
    def __init__(
        self,
        records: list[dict],
        columns: list[str],
        title: str,
        group_key: str | None = None,
        metric_keys: list[str] | None = None,
        is_empty: bool = False,
        summary_text: str = "",
    ):
        self.records = records
        self.columns = columns
        self.title = title
        self.group_key = group_key
        self.metric_keys = metric_keys or []
        self.is_empty = is_empty
        self.summary_text = summary_text


def analyze(query: ParsedQuery) -> AnalysisResult:
    """Run Pandas analysis based on parsed query intent."""
    df = get_institutions_df()

    if query.use_latest_year and not query.include_all_years:
        latest_year = df["Academic Year"].max()
        df = df[df["Academic Year"] == latest_year]

    df = _apply_filters(df, query.filters)

    if query.intent == "summary":
        summary = AnalyticsService.get_summary()
        records = [
            {"Metric": "Total Institutions", "Value": summary["totalInstitutions"]},
            {"Metric": "Total Students", "Value": summary["totalStudents"]},
            {"Metric": "Male Students", "Value": summary["maleStudents"]},
            {"Metric": "Female Students", "Value": summary["femaleStudents"]},
            {"Metric": "Total Teachers", "Value": summary["totalTeachers"]},
            {"Metric": "Student-Teacher Ratio", "Value": summary["studentTeacherRatio"]},
            {"Metric": "Average Placement %", "Value": summary["averagePlacement"]},
            {"Metric": "Average Attendance %", "Value": summary["averageAttendance"]},
            {"Metric": "Average Pass %", "Value": summary["averagePassPercentage"]},
            {"Metric": "Total Scholarships", "Value": summary["totalScholarships"]},
            {"Metric": "Average Infrastructure Score", "Value": summary["averageInfrastructure"]},
            {"Metric": "Total Budget (Lakhs)", "Value": summary["totalBudget"]},
        ]
        records = _rename_columns(records)
        return AnalysisResult(
            records=records,
            columns=["metric", "value"],
            title="Platform Summary",
            group_key="metric",
            metric_keys=["value"],
            summary_text=_format_summary_text(records),
        )

    if query.intent == "general":
        return AnalysisResult(
            records=[],
            columns=[],
            title=query.title_hint,
            is_empty=True,
            summary_text="General platform question — no tabular data required.",
        )

    if df.empty:
        return AnalysisResult(
            records=[],
            columns=[],
            title=query.title_hint,
            is_empty=True,
        )

    # Gender compare without group_by
    if query.intent == "compare" and not query.group_by:
        records = []
        for metric in query.metrics:
            val = _aggregate(df, metric, query.aggregation)
            records.append({"Category": metric, "Value": _round_value(val, metric)})
        records = _rename_columns(records)
        return AnalysisResult(
            records=records,
            columns=["category", "value"],
            title=query.title_hint,
            group_key="category",
            metric_keys=["value"],
            summary_text=_format_summary_text(records),
        )

    # Grouped aggregation
    if query.group_by:
        agg_map = {}
        for metric in query.metrics:
            agg_map[metric] = query.aggregation

        grouped = df.groupby(query.group_by).agg(agg_map).reset_index()

        for metric in query.metrics:
            grouped[metric] = grouped[metric].apply(lambda v, m=metric: _round_value(v, m))

        sort_col = query.sort_by or query.metrics[0]
        if sort_col in grouped.columns:
            grouped = grouped.sort_values(
                by=sort_col, ascending=(query.sort_order == "asc")
            )

        if query.limit:
            grouped = grouped.head(query.limit)

        records = grouped.to_dict(orient="records")
        records = _rename_columns(records)
        group_key = _to_camel_key(query.group_by)
        metric_keys = [_to_camel_key(m) for m in query.metrics]

        return AnalysisResult(
            records=records,
            columns=[group_key] + metric_keys,
            title=query.title_hint,
            group_key=group_key,
            metric_keys=metric_keys,
            summary_text=_format_summary_text(records),
        )

    # Rank at college level
    if query.intent == "rank":
        sort_col = query.sort_by or query.metrics[0]
        sorted_df = df.sort_values(by=sort_col, ascending=(query.sort_order == "asc"))
        limit = query.limit or 10
        top = sorted_df.head(limit)

        display_cols = ["College Name", "District", "University Name"] + query.metrics
        display_cols = [c for c in display_cols if c in top.columns]
        records = top[display_cols].to_dict(orient="records")
        records = _rename_columns(records)

        return AnalysisResult(
            records=records,
            columns=[_to_camel_key(c) for c in display_cols],
            title=query.title_hint,
            group_key="college",
            metric_keys=[_to_camel_key(m) for m in query.metrics],
            summary_text=_format_summary_text(records),
        )

    # Filter — return matching rows
    if query.intent == "filter":
        limit = query.limit or 20
        display_cols = [
            "College Name",
            "District",
            "University Name",
            "Students",
            "Placement Percentage",
            "Pass Percentage",
        ]
        display_cols = [c for c in display_cols if c in df.columns]
        subset = df.head(limit)
        records = subset[display_cols].to_dict(orient="records")
        records = _rename_columns(records)

        return AnalysisResult(
            records=records,
            columns=[_to_camel_key(c) for c in display_cols],
            title=query.title_hint,
            group_key="college",
            metric_keys=["students", "placement", "passPercentage"],
            summary_text=_format_summary_text(records),
        )

    # Default: district aggregation
    grouped = (
        df.groupby("District")[query.metrics[0]]
        .agg(query.aggregation)
        .reset_index()
        .sort_values(by=query.metrics[0], ascending=False)
    )
    if query.limit:
        grouped = grouped.head(query.limit)

    grouped[query.metrics[0]] = grouped[query.metrics[0]].apply(
        lambda v: _round_value(v, query.metrics[0])
    )
    records = grouped.to_dict(orient="records")
    records = _rename_columns(records)
    metric_key = _to_camel_key(query.metrics[0])

    return AnalysisResult(
        records=records,
        columns=["district", metric_key],
        title=query.title_hint,
        group_key="district",
        metric_keys=[metric_key],
        summary_text=_format_summary_text(records),
    )


def _format_summary_text(records: list[dict]) -> str:
    if not records:
        return "No data found."
    lines = []
    for i, row in enumerate(records[:15]):
        parts = [f"{k}: {v}" for k, v in row.items()]
        lines.append(f"Row {i + 1}: {', '.join(parts)}")
    if len(records) > 15:
        lines.append(f"... and {len(records) - 15} more rows")
    return "\n".join(lines)
