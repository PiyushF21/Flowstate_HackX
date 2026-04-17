from fastapi import APIRouter
from agents.oracle import generate_fund_allocations
from models import FundAllocation

router = APIRouter(prefix="/api/oracle", tags=["ORACLE"])

@router.get("/funds", response_model=list[FundAllocation])
async def api_get_funds():
    res = await generate_fund_allocations()
    return res

from pydantic import BaseModel

class ApproveAllocationReq(BaseModel):
    allocation_id: str
    approved_by: str
    modifications: dict = {}

class ApproveResourceReq(BaseModel):
    recommendation_id: str
    approved_by: str
    action: str

@router.post("/approve-funds")
async def api_approve_funds(req: ApproveAllocationReq):
    from agents.oracle import approve_fund_allocation
    return await approve_fund_allocation(req.allocation_id, req.approved_by, req.modifications)

@router.get("/recommend-resources")
async def api_recommend_resources():
    from agents.oracle import recommend_resource_allocation
    return await recommend_resource_allocation()

@router.post("/approve-resources")
async def api_approve_resources(req: ApproveResourceReq):
    from agents.oracle import approve_resource_allocation
    return await approve_resource_allocation(req.recommendation_id, req.approved_by, req.action)

@router.get("/budget-tracker")
async def api_budget_tracker():
    from agents.oracle import get_budget_tracker
    return await get_budget_tracker()
