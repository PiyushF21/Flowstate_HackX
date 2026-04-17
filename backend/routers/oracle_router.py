from fastapi import APIRouter
from agents.oracle import generate_fund_allocations
from models import FundAllocation

router = APIRouter(prefix="/api/oracle", tags=["ORACLE"])

@router.get("/funds", response_model=list[FundAllocation])
async def api_get_funds():
    res = await generate_fund_allocations()
    return res
