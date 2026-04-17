from fastapi import APIRouter
from pydantic import BaseModel
from agents.field_copilot import get_advice, CopilotResponse

router = APIRouter(prefix="/api/field-copilot", tags=["FIELD_COPILOT"])

class CopilotRequest(BaseModel):
    worker_id: str
    issue_id: str
    message: str

@router.post("/chat", response_model=CopilotResponse)
async def api_copilot_chat(req: CopilotRequest):
    res = await get_advice(req.worker_id, req.issue_id, req.message)
    return res
