import uuid
from datetime import datetime, timezone
from data_store import data_store
from models import AuditEntry

async def verify_access(role: str, path: str) -> bool:
    """Internal verification function. Primary traffic handled via middleware."""
    # Hardcoded fallback logic mapping
    permissions = {
        "citizen": ["/api/vira", "/api/issues"],
        "bmc_supervisor": ["/api/issues", "/api/commander", "/api/workers"],
        "field_worker": ["/api/tasks", "/api/field-copilot"],
        "state_official": ["/api/fleet", "/api/oracle", "/api/prescient", "/api/guardian", "/api/issues"],
        "nexus_admin": ["*"]
    }
    
    allowed = permissions.get(role, [])
    if "*" in allowed: return True
    return any(path.startswith(p) for p in allowed)

async def log_action(agent_name: str, action: str, role: str, user_id: str, outcome: str, details: dict):
    entry = AuditEntry(
        id=f"AUD-{uuid.uuid4().hex[:8]}",
        agent=agent_name,
        action=action,
        role=role,
        user_id=user_id,
        outcome=outcome,
        details=details,
        timestamp=datetime.now(timezone.utc).isoformat()
    )
    await data_store.add_audit_log(entry)
    
async def process_sentinel(issue_id: str, role: str) -> dict:
    """Agent pipeline explicit verification step."""
    is_valid = await verify_access(role, "/api/issues")
    outcome = "allowed" if is_valid else "denied"
    await log_action("SENTINEL", "pipeline_verification", role, "system", outcome, {"issue_id": issue_id})
    return {"sentinel_passed": is_valid, "outcome": outcome}
