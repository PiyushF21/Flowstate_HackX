from fastapi import APIRouter
from pydantic import BaseModel
from agents.cognos import process_cognos

router = APIRouter(prefix="/api/cognos", tags=["COGNOS"])

class AnalyzeRequest(BaseModel):
    issue_id: str
    source: str
    raw_data: dict
    lat: float
    lng: float

@router.post("/analyze-sensor")
async def api_analyze_sensor(req: AnalyzeRequest):
    """Direct testing endpoint for COGNOS (bypasses NEXUS pipeline)."""
    result = await process_cognos(req.issue_id, req.raw_data, req.source, req.lat, req.lng)
    return {"status": "success", "agent": "COGNOS", "data": result}
