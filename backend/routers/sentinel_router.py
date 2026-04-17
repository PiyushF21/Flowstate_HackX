from fastapi import APIRouter
from data_store import data_store

router = APIRouter(prefix="/api/sentinel", tags=["SENTINEL"])

@router.get("/audit")
async def api_get_audit(limit: int = 100):
    logs = await data_store.get_audit_logs({"limit": limit})
    return {"status": "success", "agent": "SENTINEL", "data": logs}
