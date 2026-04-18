import asyncio
from models import FundAllocation, MC
from data_store import data_store
from langchain_xai import ChatXAI
from langchain_core.messages import SystemMessage, HumanMessage
from config import settings

llm = ChatXAI(
    xai_api_key=settings.XAI_API_KEY,
    model="grok-4-1-fast-reasoning",
    temperature=0.3
)

async def calculate_allocation_score(mc: MC) -> FundAllocation:
    # 1. Base Score (Max 50) based on resolution rate
    base_score = (mc.resolution_rate / 100.0) * 50
    
    # 2. Speed Bonus (Max 20)
    speed_bonus = max(0, 20 - (mc.avg_resolution_hours / 1.5))
    
    efficiency = 1.0
    score = (base_score + speed_bonus) * efficiency
    
    amount = score * 100000.0
    
    # Generate Rationale via ORACLE AI Engine
    sys_prompt = "You are ORACLE, the state fund allocation AI. Keep your answers brief (1-2 sentences)."
    user_prompt = (
        f"Generate a financial rationale justifying an infrastructure fund allocation of {amount:,.0f} Rupees "
        f"for {mc.name}. Their resolution rate is {mc.resolution_rate}%, and their avg resolution time is "
        f"{mc.avg_resolution_hours} hours over {mc.issues_this_week} total issues this week."
    )
    
    try:
        response = await llm.ainvoke([SystemMessage(content=sys_prompt), HumanMessage(content=user_prompt)])
        # Strip chain-of-thought tags if using reasoning model
        rationale = str(response.content)
        import re
        rationale = re.sub(r'<think>.*?</think>', '', rationale, flags=re.DOTALL).strip()
    except Exception as e:
        rationale = f"AI Generation Failed: Computed base allocation score is {score:.2f} due to {mc.resolution_rate}% resolution rate."

    return FundAllocation(
        mc_id=mc.mc_id,
        mc_name=mc.name,
        recommended_amount=amount,
        rationale=rationale
    )

async def generate_fund_allocations() -> list[FundAllocation]:
    """Generates state-wide fund allocations for all Municipal Corporations."""
    mcs = await data_store.list_mcs()
    allocations = []
    
    # Await all the LLM calls concurrently
    tasks = [calculate_allocation_score(mc) for mc in mcs]
    allocs = await asyncio.gather(*tasks)
    
    for mc, alloc in zip(mcs, allocs):
        # Add basic performance flag
        if mc.avg_resolution_hours > 24:
            alloc.performance_flag = "warning"
        elif mc.resolution_rate < 50:
            alloc.performance_flag = "critical"
        else:
            alloc.performance_flag = "good"
            
        allocations.append(alloc)
        
    return allocations

async def approve_fund_allocation(allocation_id: str, approved_by: str, modifications: dict = {}) -> dict:
    return {"status": "approved", "allocation_id": allocation_id, "approved_by": approved_by, "modifications": modifications}

async def recommend_resource_allocation() -> list:
    return [{"mc": "BMC Mumbai", "equipment_need": "Excavator", "priority": "High"}]

async def approve_resource_allocation(recommendation_id: str, approved_by: str, action: str) -> dict:
    return {"status": "actioned", "recommendation_id": recommendation_id, "action": action}

async def get_budget_tracker() -> dict:
    return {
        "total_state_budget": 50000000.0,
        "allocated": 12500000.0,
        "remaining": 37500000.0
    }
