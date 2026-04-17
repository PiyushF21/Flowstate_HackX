"""PRESCIENT Router -- Reporting & forecasting endpoints."""
from fastapi import APIRouter, Query
from agents import prescient

router = APIRouter(prefix="/api/prescient", tags=["PRESCIENT"])


@router.get("/daily/{mc_name}")
async def daily_report(mc_name: str, date: str = None):
    """Get or generate daily report for a specific MC."""
    return await prescient.generate_daily_report(mc_name, date)


@router.get("/weekly")
async def weekly_digest():
    """State-level weekly digest across all MCs."""
    return await prescient.generate_weekly_digest()


@router.get("/forecast/{mc_name}")
async def forecast(mc_name: str):
    """Predictive warnings for an MC."""
    return await prescient.generate_forecast(mc_name)


@router.post("/generate")
async def manual_generate(mc_name: str = Query(...), date: str = Query(default=None)):
    """Manual trigger for report generation."""
    return await prescient.generate_daily_report(mc_name, date)
