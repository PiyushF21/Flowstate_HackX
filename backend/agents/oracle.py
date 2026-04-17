# ==============================================================================
# ORACLE Draft — Pure Python Math & Logic
# ==============================================================================

def calculate_allocation_score(
    resolution_rate: float, 
    avg_resolution_hours: float, 
    escalated_tasks: int, 
    fund_utilization_pct: float
) -> float:
    """
    Draft formula for recommending fund distributions to an MC based on performance.
    Oracle favors MCs with good resolution rates but low fund utilization (efficient),
    and gives emergency bonuses to those with high escalated tasks.
    """
    
    # 1. Base Score (Max 50) based on resolution rate
    # E.g., 85% resolution rate -> 42.5
    base_score = (resolution_rate / 100.0) * 50
    
    # 2. Speed Bonus (Max 20)
    # E.g., under 5 hours is great, over 24 hours is zero
    speed_bonus = max(0, 20 - (avg_resolution_hours / 1.5))
    
    # 3. Efficiency Multiplier
    # MCs that get work done with less funds get a boost. (Inverse of utilization)
    if fund_utilization_pct > 0:
        efficiency = 100.0 / (fund_utilization_pct + 10.0) # Avoid DBZ
    else:
        efficiency = 1.0
        
    score = (base_score + speed_bonus) * efficiency
    
    # 4. Crisis Intervention Need
    # If a corporation is failing (high escalations), they might need targeted aid
    if escalated_tasks > 5:
        score += (escalated_tasks * 2.5)
        
    return min(100.0, score)
