from models import FundAllocation, MC
from data_store import data_store

# ==============================================================================
# ORACLE Draft — Pure Python Math & Logic
# ==============================================================================

def calculate_allocation_score(mc: MC) -> FundAllocation:
    """
    Draft formula for recommending fund distributions to an MC based on performance.
    Oracle favors MCs with good resolution rates but low fund utilization (efficient),
    and gives emergency bonuses to those with high escalated tasks.
    """
    
    # 1. Base Score (Max 50) based on resolution rate
    # E.g., 85% resolution rate -> 42.5
    base_score = (mc.resolution_rate / 100.0) * 50
    
    # 2. Speed Bonus (Max 20)
    # E.g., under 5 hours is great, over 24 hours is zero
    speed_bonus = max(0, 20 - (mc.avg_resolution_hours / 1.5))
    
    # 3. Efficiency Multiplier
    # (Assuming we map this from reports later, defaulting to 1.0 for draft)
    # In full logic we will fetch Report utilization
    efficiency = 1.0
        
    score = (base_score + speed_bonus) * efficiency
    
    return FundAllocation(
        mc_id=mc.mc_id,
        mc_name=mc.name,
        recommended_amount=score * 100000.0, # Scaled for mock currency
        rationale=f"Computed allocation score: {score:.2f}"
    )
