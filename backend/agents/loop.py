import math
from datetime import datetime, timezone
from models import Issue, Completion, AgentEvent
from data_store import data_store

# ==============================================================================
# LOOP Draft — Pure Python Math & Logic
# ==============================================================================

def calculate_sla_status(issue: Issue, completed_at: datetime) -> dict:
    """Draft logic for SLA calculation"""
    try:
        if not issue.deadline:
            return {"sla_met": True, "hours_over_deadline": 0}
            
        deadline = datetime.fromisoformat(issue.deadline)
        
        sla_met = completed_at <= deadline
        
        diff = completed_at - deadline
        diff_hours = diff.total_seconds() / 3600.0
        
        return {
            "sla_met": sla_met,
            "hours_over_deadline": max(0, diff_hours)
        }
    except Exception:
        return {"sla_met": False, "hours_over_deadline": 0}


async def check_is_rereport(new_lat: float, new_lng: float) -> dict:
    """Find if issue is a re-report of a recent resolved issue using data_store."""
    RADIUS_THRESHOLD_METERS = 10.0
    
    # Use real data_store method
    nearby_issues = await data_store.list_issues_near(new_lat, new_lng, RADIUS_THRESHOLD_METERS)
    
    for old in nearby_issues:
        if old.status == "resolved":
            return {
                "is_rereport": True,
                "original_issue_id": old.issue_id
            }
            
    return {"is_rereport": False}

