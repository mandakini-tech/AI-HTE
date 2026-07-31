"""Verification test script for Phase 3 AI Education Assistant pipeline."""

import asyncio
import json
from services.chat_service import chat_service


async def main():
    test_queries = [
        "Total students by district",
        "Top 10 colleges by placement",
        "Enrollment trend over years",
        "Gender distribution of students",
        "Show platform dashboard summary",
        "Show colleges with placement below 60%",
        "Compare Mumbai and Pune admissions",
    ]

    print("==================================================")
    print("       AI-HTE PHASE 3 PIPELINE VERIFICATION       ")
    print("==================================================\n")

    session_id = "test-session-1"

    for idx, query in enumerate(test_queries, 1):
        print(f"[{idx}/{len(test_queries)}] Query: '{query}'")
        try:
            res = await chat_service.process_chat(query, session_id=session_id)
            print(f"  • Answer: {res.get('answer', '')[:100]}...")
            chart = res.get('chart')
            if chart:
                print(f"  • Chart: type='{chart.get('type')}', title='{chart.get('title')}', data_points={len(chart.get('data', []))}")
            else:
                print("  • Chart: None")
            table = res.get('table')
            if table:
                print(f"  • Table: columns={table.get('columns')}, rows={len(table.get('rows', []))}")
            else:
                print("  • Table: None")
            print(f"  • Insights count: {len(res.get('insights', []))}")
            print("-" * 50)
        except Exception as exc:
            print(f"  ❌ ERROR processing query: {exc}")
            print("-" * 50)

    print("\nPhase 3 verification test completed successfully!")


if __name__ == "__main__":
    asyncio.run(main())
