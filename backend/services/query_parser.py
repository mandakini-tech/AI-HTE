"""Parse natural language queries into structured intents via Gemini."""

import logging
import re
from dataclasses import dataclass, field
from typing import Any

from services.gemini_service import gemini_service
from services.prompt_builder import (
    INTENT_PARSER_SYSTEM,
    build_intent_parser_prompt,
)

logger = logging.getLogger(__name__)

VALID_COLUMNS = {
    "College Name",
    "University Name",
    "District",
    "Students",
    "Students Male",
    "Students Female",
    "Teachers",
    "Placement Percentage",
    "Scholarships",
    "Pass Percentage",
    "Attendance Percentage",
    "Infrastructure Score",
    "AI Risk Score",
    "Budget Lakhs",
    "NAAC Grade",
    "Academic Year",
}

GROUP_BY_COLUMNS = {
    "District",
    "University Name",
    "NAAC Grade",
    "Academic Year",
    "College Name",
}

SUM_METRICS = {"Students", "Students Male", "Students Female", "Teachers", "Scholarships", "Budget Lakhs"}
MEAN_METRICS = {
    "Placement Percentage",
    "Pass Percentage",
    "Attendance Percentage",
    "Infrastructure Score",
    "AI Risk Score",
}


@dataclass
class ParsedQuery:
    intent: str = "aggregate"
    group_by: str | None = None
    metrics: list[str] = field(default_factory=lambda: ["Students"])
    aggregation: str = "sum"
    filters: list[dict] = field(default_factory=list)
    sort_by: str | None = None
    sort_order: str = "desc"
    limit: int | None = None
    use_latest_year: bool = True
    include_all_years: bool = False
    title_hint: str = "Query Results"


def _default_aggregation(metric: str) -> str:
    if metric in SUM_METRICS:
        return "sum"
    if metric in MEAN_METRICS:
        return "mean"
    return "sum"


def _normalize_parsed(data: dict[str, Any]) -> ParsedQuery:
    """Validate and normalize Gemini output."""
    intent = data.get("intent", "aggregate")
    if intent not in {"aggregate", "rank", "filter", "trend", "compare", "summary", "general"}:
        intent = "aggregate"

    group_by = data.get("group_by")
    if group_by and group_by not in GROUP_BY_COLUMNS:
        group_by = None

    metrics = data.get("metrics") or ["Students"]
    metrics = [m for m in metrics if m in VALID_COLUMNS] or ["Students"]

    aggregation = data.get("aggregation", _default_aggregation(metrics[0]))
    if aggregation not in {"sum", "mean", "count", "min", "max"}:
        aggregation = _default_aggregation(metrics[0])

    filters = []
    for f in data.get("filters") or []:
        col = f.get("column")
        if col in VALID_COLUMNS:
            filters.append(
                {
                    "column": col,
                    "operator": f.get("operator", "eq"),
                    "value": f.get("value"),
                }
            )

    sort_by = data.get("sort_by")
    if sort_by and sort_by not in VALID_COLUMNS:
        sort_by = metrics[0]

    sort_order = data.get("sort_order", "desc")
    if sort_order not in {"asc", "desc"}:
        sort_order = "desc"

    limit = data.get("limit")
    if limit is not None:
        try:
            limit = int(limit)
        except (TypeError, ValueError):
            limit = None

    use_latest_year = bool(data.get("use_latest_year", True))
    include_all_years = bool(data.get("include_all_years", False))

    if intent == "trend":
        include_all_years = True
        use_latest_year = False
        group_by = group_by or "Academic Year"

    if intent == "rank" and limit is None:
        limit = 10

    if intent == "summary":
        use_latest_year = True

    return ParsedQuery(
        intent=intent,
        group_by=group_by,
        metrics=metrics,
        aggregation=aggregation,
        filters=filters,
        sort_by=sort_by or metrics[0],
        sort_order=sort_order,
        limit=limit,
        use_latest_year=use_latest_year,
        include_all_years=include_all_years,
        title_hint=data.get("title_hint") or "Query Results",
    )


def _fallback_parse(message: str) -> ParsedQuery:
    """Keyword-based fallback when Gemini is unavailable."""
    text = message.lower()

    if any(w in text for w in ("trend", "over time", "yearly", "year by year", "growth")):
        metric = "Students"
        if "budget" in text:
            metric = "Budget Lakhs"
        elif "placement" in text:
            metric = "Placement Percentage"
        return ParsedQuery(
            intent="trend",
            group_by="Academic Year",
            metrics=[metric],
            aggregation=_default_aggregation(metric),
            include_all_years=True,
            use_latest_year=False,
            title_hint="Trend Analysis",
        )

    if any(w in text for w in ("gender", "male", "female")):
        return ParsedQuery(
            intent="compare",
            group_by=None,
            metrics=["Students Male", "Students Female"],
            aggregation="sum",
            title_hint="Gender Distribution",
        )

    if any(w in text for w in ("top", "best", "highest", "leading", "bottom", "worst", "lowest")):
        metric = "Placement Percentage"
        if "student" in text or "enrollment" in text:
            metric = "Students"
        elif "scholarship" in text:
            metric = "Scholarships"
        elif "budget" in text:
            metric = "Budget Lakhs"
        elif "attendance" in text:
            metric = "Attendance Percentage"
        elif "pass" in text:
            metric = "Pass Percentage"

        sort_order = "desc"
        if any(w in text for w in ("bottom", "worst", "lowest")):
            sort_order = "asc"

        group_by = "College Name"
        if "district" in text:
            group_by = "District"
        elif "university" in text or "universities" in text:
            group_by = "University Name"

        return ParsedQuery(
            intent="rank",
            group_by=group_by,
            metrics=[metric],
            aggregation=_default_aggregation(metric),
            sort_by=metric,
            sort_order=sort_order,
            limit=10,
            title_hint=f"Top Results by {metric}",
        )

    # Filter with numeric threshold (e.g. placement below 60%)
    num_match = re.search(r"(below|under|less than|above|greater than|over)\s+(\d+)", text)
    if num_match or "below" in text or "under" in text or "above" in text:
        op = "lt" if any(w in text for w in ("below", "under", "less")) else "gt"
        val = int(num_match.group(2)) if num_match else 60
        metric = "Placement Percentage"
        if "pass" in text:
            metric = "Pass Percentage"
        elif "attendance" in text:
            metric = "Attendance Percentage"
        elif "student" in text:
            metric = "Students"

        return ParsedQuery(
            intent="filter",
            group_by=None,
            metrics=[metric],
            filters=[{"column": metric, "operator": op, "value": val}],
            sort_by=metric,
            sort_order="asc" if op == "lt" else "desc",
            limit=20,
            title_hint=f"Colleges with {metric} {op} {val}",
        )

    if "district" in text:
        metric = "Students"
        if "placement" in text:
            metric = "Placement Percentage"
        elif "scholarship" in text:
            metric = "Scholarships"
        elif "budget" in text:
            metric = "Budget Lakhs"
        return ParsedQuery(
            intent="aggregate",
            group_by="District",
            metrics=[metric],
            aggregation=_default_aggregation(metric),
            sort_by=metric,
            sort_order="desc",
            title_hint=f"{metric} by District",
        )

    if "university" in text or "universities" in text:
        return ParsedQuery(
            intent="aggregate",
            group_by="University Name",
            metrics=["Students"],
            aggregation="sum",
            sort_by="Students",
            sort_order="desc",
            limit=15,
            title_hint="Students by University",
        )

    if any(w in text for w in ("summary", "overview", "dashboard summary", "how many colleges")):
        return ParsedQuery(intent="summary", title_hint="Platform Summary")

    if "scholarship" in text:
        return ParsedQuery(
            intent="aggregate",
            group_by="District",
            metrics=["Scholarships"],
            aggregation="sum",
            sort_by="Scholarships",
            sort_order="desc",
            title_hint="Scholarships by District",
        )

    if "placement" in text:
        return ParsedQuery(
            intent="aggregate",
            group_by="District",
            metrics=["Placement Percentage"],
            aggregation="mean",
            sort_by="Placement Percentage",
            sort_order="desc",
            title_hint="Average Placement by District",
        )

    # Extract district filter if question asks about specific district
    district_match = re.search(r"in\s+([A-Za-z\s]+?)(?:\s+district|\?|$|,)", message, re.I)
    filters = []
    if district_match:
        filters.append(
            {"column": "District", "operator": "contains", "value": district_match.group(1).strip()}
        )

    return ParsedQuery(
        intent="filter" if filters else "aggregate",
        group_by="District",
        metrics=["Students"],
        aggregation="sum",
        filters=filters,
        sort_by="Students",
        sort_order="desc",
        limit=15,
        title_hint="Students by District",
    )


async def parse_query(message: str, history: list[dict]) -> ParsedQuery:
    """Parse user message into structured query using Gemini with fallback."""
    if gemini_service.is_available:
        prompt = build_intent_parser_prompt(message, history)
        result = await gemini_service.generate_json(INTENT_PARSER_SYSTEM, prompt)
        if result:
            try:
                return _normalize_parsed(result)
            except Exception as exc:
                logger.warning("Failed to normalize Gemini parse result: %s", exc)

    logger.info("Using fallback query parser")
    return _fallback_parse(message)
