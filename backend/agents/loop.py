import math
from datetime import datetime

# ==============================================================================
# LOOP Draft — Pure Python Math & Logic (No Imports)
# ==============================================================================

def calculate_sla_status(deadline_iso_str: str, completion_iso_str: str) -> dict:
    """Draft logic for SLA calculation"""
    try:
        # Example format: "2026-04-17T22:35:00+05:30"
        # We would parse this and compare.
        # Mocking parsing for the draft:
        deadline = datetime.fromisoformat(deadline_iso_str)
        completed = datetime.fromisoformat(completion_iso_str)
        
        sla_met = completed <= deadline
        
        diff = completed - deadline
        diff_hours = diff.total_seconds() / 3600.0
        
        return {
            "sla_met": sla_met,
            "hours_over_deadline": max(0, diff_hours)
        }
    except Exception:
        return {"sla_met": False, "hours_over_deadline": 0}


def calculate_gps_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine math for re-report detection"""
    R = 6371000  # radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance

def check_is_rereport(new_lat: float, new_lng: float, old_issues: list) -> dict:
    """Draft to find if issue is a re-report of a recent resolved issue"""
    RADIUS_THRESHOLD_METERS = 10.0
    
    for old in old_issues:
        # Check distance
        dist = calculate_gps_distance(new_lat, new_lng, old["lat"], old["lng"])
        if dist <= RADIUS_THRESHOLD_METERS:
            return {
                "is_rereport": True,
                "original_issue_id": old["issue_id"],
                "distance_meters": dist
            }
            
    return {"is_rereport": False}
