"""Format analysis results into API response with auto chart selection."""

from typing import Any

from services.data_analyzer import AnalysisResult
from services.gemini_service import gemini_service
from services.prompt_builder import SUMMARY_GENERATOR_SYSTEM, build_summary_prompt
from services.query_parser import ParsedQuery

CHART_TYPES = {"bar", "horizontalBar", "line", "pie", "area"}


def _select_chart_type(result: AnalysisResult, query: ParsedQuery) -> str | None:
    if not result.records or result.is_empty:
        return None

    n = len(result.records)
    col1 = result.columns[0] if result.columns else None
    col2 = result.columns[1] if len(result.columns) > 1 else None

    group_key = result.group_key or col1
    metric_keys = result.metric_keys or ([col2] if col2 else [])

    if not group_key or not metric_keys:
        return None

    # Summary table (metric/value pairs)
    if group_key in ("metric", "Metric"):
        return "bar"

    # Gender / category comparison
    if group_key in ("category", "Category"):
        return "pie"

    # Time series
    if group_key in ("year", "Academic Year") or query.intent == "trend":
        return "area" if n >= 4 else "line"

    # NAAC grades — pie works well
    if group_key in ("naacGrade", "NAAC Grade") and n <= 8:
        return "pie"

    # Long labels → horizontal bar
    if group_key in ("college", "university", "College Name", "University Name"):
        return "horizontalBar"

    if n > 12:
        avg_len = sum(len(str(r.get(group_key, ""))) for r in result.records) / n
        if avg_len > 18:
            return "horizontalBar"
        return "bar"

    if n <= 6 and query.aggregation in ("sum", "count"):
        return "pie"

    if n >= 5 and query.intent in ("trend", "compare"):
        return "line"

    return "bar"


def _build_chart(
    result: AnalysisResult,
    query: ParsedQuery,
) -> dict[str, Any] | None:
    if not result.records or result.is_empty:
        return None

    col1 = result.columns[0] if result.columns else None
    col2 = result.columns[1] if len(result.columns) > 1 else None

    group_key = result.group_key or col1
    metric_key = (result.metric_keys[0] if result.metric_keys else col2) or col2

    if not group_key or not metric_key:
        return None

    chart_type = _select_chart_type(result, query)
    if not chart_type:
        return None

    data = []
    for row in result.records:
        entry = dict(row)
        if group_key in entry and metric_key in entry:
            data.append(entry)

    if not data:
        return None

    title = result.title or query.title_hint

    return {
        "type": chart_type,
        "title": title,
        "xKey": group_key,
        "yKey": metric_key,
        "data": data,
    }


def _fallback_summary(
    user_message: str,
    result: AnalysisResult,
) -> tuple[str, list[str]]:
    if result.is_empty or not result.records:
        return (
            "I couldn't find any data matching your query. Try asking about districts, "
            "universities, placement rates, scholarships, or enrollment trends.",
            ["No matching records in the institutions dataset."],
        )

    count = len(result.records)
    first = result.records[0]
    
    col1 = result.columns[0] if result.columns else None
    col2 = result.columns[1] if len(result.columns) > 1 else None

    group_key = result.group_key or col1
    metric_key = (result.metric_keys[0] if result.metric_keys else col2) or col2

    if group_key and metric_key and group_key in first and metric_key in first:
        top_label = first.get(group_key, "N/A")
        top_value = first.get(metric_key, "N/A")
        formatted_val = f"{top_value:,}" if isinstance(top_value, (int, float)) else str(top_value)
        answer = (
            f"Found {count} result(s) for your query. "
            f"The top entry is '{top_label}' with {metric_key} of {formatted_val}."
        )
    elif col1 and col1 in first:
        top_label = first.get(col1, "N/A")
        answer = f"Found {count} result(s) for your query. Top entry: '{top_label}'."
    else:
        answer = f"Found {count} result(s) for your query."

    insights = []
    if count >= 3 and metric_key:
        values = [r.get(metric_key) for r in result.records if isinstance(r.get(metric_key), (int, float))]
        if values:
            insights.append(f"Highest {metric_key}: {max(values):,}")
            insights.append(f"Lowest {metric_key}: {min(values):,}")
            if len(values) > 1:
                avg = round(sum(values) / len(values), 2)
                insights.append(f"Average {metric_key}: {avg:,}")

    if not insights:
        insights.append(f"Returned {count} rows from the Maharashtra HTE dataset.")

    return answer, insights


async def format_response(
    user_message: str,
    query: ParsedQuery,
    result: AnalysisResult,
    history: list[dict],
) -> dict[str, Any]:
    """Build the final chat response payload."""
    table = {
        "columns": result.columns,
        "rows": result.records,
        "title": result.title,
    } if result.records else None

    chart = _build_chart(result, query)

    answer = ""
    insights: list[str] = []

    if result.is_empty or not result.records:
        answer, insights = _fallback_summary(user_message, result)
    elif gemini_service.is_available:
        prompt = build_summary_prompt(
            user_message,
            result.summary_text,
            len(result.records),
            history,
        )
        summary = await gemini_service.generate_json(SUMMARY_GENERATOR_SYSTEM, prompt)
        if summary:
            answer = summary.get("answer", "")
            insights = summary.get("insights", [])
            if isinstance(insights, str):
                insights = [insights]

    if not answer:
        answer, insights = _fallback_summary(user_message, result)

    return {
        "answer": answer,
        "table": table,
        "chart": chart,
        "insights": insights,
    }
