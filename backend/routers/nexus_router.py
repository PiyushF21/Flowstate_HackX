from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from agents.nexus import process_issue
import traceback

router = APIRouter(prefix="/api/nexus", tags=["NEXUS"])

class ProcessRequest(BaseModel):
    source: str
    raw_data: dict
    location: dict

@router.post("/process")
async def api_process_issue(req: ProcessRequest, request: Request):
    """Entry point for incoming infrastructure reports (sensor/images/manual)."""
    try:
        role = request.headers.get("X-User-Role", "system")
        result = await process_issue(req.raw_data, req.source, req.location, role)
        return {"status": "success", "agent": "NEXUS", "data": result}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
