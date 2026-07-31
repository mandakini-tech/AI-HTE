"""Prompt templates for Gemini intent parsing and summary generation."""

DATASET_SCHEMA = """
Available dataset: Maharashtra Higher & Technical Education institutions (institutions.csv)

Columns:
- College Name (string): institution name
- University Name (string): parent university
- District (string): geographic district
- Students (int): total enrolled students
- Students Male (int): male students
- Students Female (int): female students
- Teachers (int): faculty count
- Placement Percentage (int): 0-100
- Scholarships (int): scholarship count
- Pass Percentage (int): 0-100
- Attendance Percentage (int): 0-100
- Infrastructure Score (int): 0-100
- AI Risk Score (int): risk metric
- Budget Lakhs (int): budget in lakhs (INR)
- NAAC Grade (string): e.g. A++, A, B++
- Academic Year (int): 2022-2025
"""

INTENT_PARSER_SYSTEM = f"""You are an intent parser for an education analytics platform.
Your ONLY job is to parse natural language questions into structured query parameters.

CRITICAL RULES:
- You must NEVER perform calculations, aggregations, or math.
- You must NEVER invent or estimate data values.
- Only output valid JSON matching the schema below.
- Use exact column names from the dataset schema.

{DATASET_SCHEMA}

Output JSON schema:
{{
  "intent": "aggregate" | "rank" | "filter" | "trend" | "compare" | "summary" | "general",
  "group_by": "<column name or null>",
  "metrics": ["<column names>"],
  "aggregation": "sum" | "mean" | "count" | "min" | "max",
  "filters": [{{"column": "<name>", "operator": "eq"|"contains"|"gt"|"lt"|"gte"|"lte", "value": "<value>"}}],
  "sort_by": "<column name or null>",
  "sort_order": "asc" | "desc",
  "limit": <integer or null>,
  "use_latest_year": <boolean>,
  "include_all_years": <boolean>,
  "title_hint": "<short descriptive title for the result>"
}}

Intent guidelines:
- "aggregate": group and summarize (e.g. students by district)
- "rank": top/bottom N items (e.g. top 10 colleges by placement)
- "filter": specific records matching criteria
- "trend": changes over Academic Year
- "compare": compare groups side by side
- "summary": overall platform statistics
- "general": non-data questions about the platform

Defaults:
- use_latest_year: true unless question mentions trends, years, or history
- include_all_years: true only for trend queries
- limit: 10 for rank queries, null otherwise
- aggregation: "sum" for counts (Students, Teachers, Scholarships, Budget Lakhs), "mean" for percentages/scores
"""

SUMMARY_GENERATOR_SYSTEM = f"""You are a data analyst assistant for Maharashtra Higher & Technical Education analytics.

CRITICAL RULES:
- You must NEVER perform calculations or invent numbers.
- Only reference values explicitly provided in the analysis results.
- Write clear, concise natural language explanations for government/education stakeholders.
- Highlight key insights from the provided data.
- If no data was found, explain that politely and suggest alternative queries.
- Keep answers to 2-4 sentences. Insights should be 2-4 bullet points.

{DATASET_SCHEMA}
"""


def build_intent_parser_prompt(user_message: str, history: list[dict]) -> str:
    """Build the user prompt for intent parsing."""
    parts = []

    if history:
        parts.append("Recent conversation context:")
        for msg in history[-6:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            parts.append(f"{role}: {content}")
        parts.append("")

    parts.append(f'Parse this question into structured query parameters:\n"{user_message}"')
    return "\n".join(parts)


def build_summary_prompt(
    user_message: str,
    analysis_summary: str,
    row_count: int,
    history: list[dict],
) -> str:
    """Build the user prompt for summary generation."""
    parts = []

    if history:
        parts.append("Recent conversation:")
        for msg in history[-4:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            parts.append(f"{role}: {content}")
        parts.append("")

    parts.append(f'User question: "{user_message}"')
    parts.append(f"\nAnalysis results ({row_count} rows):\n{analysis_summary}")
    parts.append(
        "\nProvide a JSON response with this schema:\n"
        '{"answer": "<natural language answer>", "insights": ["<insight 1>", "<insight 2>"]}'
    )
    return "\n".join(parts)
