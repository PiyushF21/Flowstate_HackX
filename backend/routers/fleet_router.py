"""FLEET Router -- Cross-MC pattern analytics endpoints."""
from fastapi import APIRouter, Query
from agents import fleet

router = APIRouter(prefix="/api/fleet", tags=["FLEET"])


@router.get("/patterns")
async def get_patterns(radius_m: float = Query(500), min_count: int = Query(3)):
    """Detect geographic failure clusters across all MCs."""
    clusters = await fleet.detect_geographic_clusters(radius_m, min_count)
    return {"agent": "FLEET", "patterns": clusters, "count": len(clusters)}


@router.get("/insights")
async def get_insights():
    """Generate AI-powered strategic insights."""
    return await fleet.generate_insights()


@router.get("/compare")
async def compare_mcs():
    """Compare MC performance metrics -- ranked list."""
    rankings = await fleet.compare_mc_performance()
    return {"agent": "FLEET", "rankings": rankings, "count": len(rankings)}


@router.get("/trends")
async def get_trends():
    """Category anomaly detection across MCs."""
    anomalies = await fleet.detect_category_anomalies()
    return {"agent": "FLEET", "anomalies": anomalies, "count": len(anomalies)}
