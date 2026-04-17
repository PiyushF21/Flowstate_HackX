from models import FundAllocation, MC
from data_store import data_store

def calculate_allocation_score(mc: MC) -> FundAllocation:
    # 1. Base Score (Max 50) based on resolution rate
    base_score = (mc.resolution_rate / 100.0) * 50
    
    # 2. Speed Bonus (Max 20)
    speed_bonus = max(0, 20 - (mc.avg_resolution_hours / 1.5))
    
    efficiency = 1.0
    score = (base_score + speed_bonus) * efficiency
    
    return FundAllocation(
        mc_id=mc.mc_id,
        mc_name=mc.name,
        recommended_amount=score * 100000.0,
        rationale=f"Computed allocation score: {score:.2f}"
    )

async def generate_fund_allocations() -> list[FundAllocation]:
    """Generates state-wide fund allocations for all Municipal Corporations."""
    mcs = await data_store.list_mcs()
    allocations = []
    
    for mc in mcs:
        alloc = calculate_allocation_score(mc)
        
        # Add basic performance flag
        if mc.avg_resolution_hours > 24:
            alloc.performance_flag = "warning"
        elif mc.resolution_rate < 50:
            alloc.performance_flag = "critical"
        else:
            alloc.performance_flag = "good"
            
        allocations.append(alloc)
        
    return allocations
