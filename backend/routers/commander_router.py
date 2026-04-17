from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
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
