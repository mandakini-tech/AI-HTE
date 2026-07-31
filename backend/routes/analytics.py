from fastapi import APIRouter
from services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/summary")
def get_summary():
    """Overall dashboard KPI summary."""
    return AnalyticsService.get_summary()


@router.get("/districts")
def get_districts():
    """District-wise aggregations."""
    return AnalyticsService.get_districts()


@router.get("/universities")
def get_universities():
    """Universities ranked by total student enrollment."""
    return AnalyticsService.get_universities()


@router.get("/placement")
def get_placement():
    """Top and bottom colleges by placement rate."""
    return AnalyticsService.get_placement()


@router.get("/scholarships")
def get_scholarships():
    """Scholarship distribution analytics."""
    return AnalyticsService.get_scholarships()


@router.get("/dashboard")
def get_dashboard():
    """All dashboard chart datasets in a single response."""
    return AnalyticsService.get_dashboard()
