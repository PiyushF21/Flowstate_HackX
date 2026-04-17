"""GUARDIAN Router -- Escalation & monitoring endpoints."""
from fastapi import APIRouter
from models import EscalationRequest
from agents import guardian

router = APIRouter(prefix="/api/guardian", tags=["GUARDIAN"])


@router.get("/alerts")
async def get_alerts():
    """Returns all active alerts."""
    return {"agent": "GUARDIAN", "alerts": guardian.get_active_alerts()}


@router.post("/escalate")
async def escalate_issue(req: EscalationRequest):
    """Manual escalation by state official."""
    return await guardian.escalate(req.issue_id, req.escalated_by, req.reason)


@router.get("/overdue")
async def get_overdue():
    """Returns overdue tasks."""
    tasks = await guardian.check_overdue_tasks()
    return {"agent": "GUARDIAN", "overdue_tasks": tasks, "count": len(tasks)}


@router.get("/monitoring-cycle")
async def run_cycle():
    """Trigger a monitoring cycle manually."""
    return await guardian.run_monitoring_cycle()
