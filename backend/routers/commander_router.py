from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from agents.commander import assign_issue
from data_store import data_store

router = APIRouter(prefix="/api/commander", tags=["COMMANDER"])

class AssignRequest(BaseModel):
    issue_id: str

@router.post("/assign")
async def api_assign(req: AssignRequest):
    """Direct testing endpoint for COMMANDER."""
    issue = await data_store.get_issue(req.issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    res = await assign_issue(issue)
    
    # Save assignment to data store
    await data_store.update_issue(res.issue_id, res.model_dump())
    
    return {"status": "success", "agent": "COMMANDER", "data": res.model_dump()}


@router.get("/workers")
async def api_get_workers(status: Optional[str] = None, mc: Optional[str] = None):
    """Get all workers with current status — used by BMC WorkersPage."""
    filters = {}
    if status:
        filters["status"] = status
    if mc:
        filters["mc"] = mc
    workers = await data_store.list_workers(filters)
    return [w.model_dump() for w in workers]


@router.get("/workload")
async def api_get_workload():
    """Get workload distribution across workers."""
    workers = await data_store.list_workers()
    total = len(workers)
    on_task = len([w for w in workers if w.status == "on_task"])
    available = len([w for w in workers if w.status == "available"])
    off_duty = len([w for w in workers if w.status == "off_duty"])
    
    return {
        "agent": "COMMANDER",
        "total_workers": total,
        "on_task": on_task,
        "available": available,
        "off_duty": off_duty,
        "utilization_pct": round((on_task / total * 100) if total else 0, 1),
    }
