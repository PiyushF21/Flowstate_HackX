from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
import logging
from datetime import datetime
import json
import uuid

# Setup simple audit logger
audit_logger = logging.getLogger("sentinel_audit")
audit_logger.setLevel(logging.INFO)
# In a real app we'd attach a FileHandler, but basic stream is okay for drafted scaffolding
handler = logging.StreamHandler()
audit_logger.addHandler(handler)

ROLES = {
    "citizen": {
        "scope": "own_complaints_only",
        "can_access": ["/api/vira", "/api/issues", "/api/notifications", "/api/loop"],
        "cannot_access": ["/api/fleet", "/api/commander", "/api/oracle"]
    },
    "bmc_supervisor": {
        "scope": "own_mc_only",
        "can_access": ["/api/issues", "/api/commander", "/api/workers", "/api/loop"],
        "cannot_access": ["/api/oracle", "/api/fleet/compare"]
    },
    "field_worker": {
        "scope": "assigned_tasks_only",
        "can_access": ["/api/tasks", "/api/field-copilot", "/api/loop"],
        "cannot_access": ["/api/commander", "/api/fleet", "/api/oracle"]
    },
    "state_official": {
        "scope": "all_mcs_aggregated",
        "can_access": ["/api/fleet", "/api/oracle", "/api/prescient", "/api/guardian", "/api/issues"],
        "cannot_access": ["/api/commander/assign"]
    },
    "nexus_admin": {
        "scope": "full",
        "can_access": ["*"],
        "cannot_access": []
    }
}

class SentinelMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # We skip checking health/docs endpoints
        path = request.url.path
        if path.startswith("/docs") or path.startswith("/openapi.json") or path == "/api/health" or path.startswith("/ws/"):
            return await call_next(request)

        # 1. Read Role Header (Default to nexus_admin for ease of development if missing, or enforce strict)
        role = request.headers.get("X-User-Role", "citizen").lower()
        user_id = request.headers.get("X-User-Id", "anonymous")
        
        # Validate role exists
        if role not in ROLES:
            return self._audit_and_deny(request, role, user_id, "Unknown role")

        # 2. Check Permissions
        role_config = ROLES[role]
        allowed = False
        
        if "*" in role_config["can_access"]:
            allowed = True
        else:
            # Check if path starts with any allowed path
            for allowed_path in role_config["can_access"]:
                if path.startswith(allowed_path):
                    allowed = True
                    break
        
        # Check explicit denials (overrides allows)
        if "cannot_access" in role_config:
            for denied_path in role_config["cannot_access"]:
                if path.startswith(denied_path):
                    allowed = False
                    break
                    
        # Exemption for prototyping: if path isn't in any predefined structure yet (i.e., we are developing it), allow it if they are nexus_admin
        if role == "nexus_admin":
            allowed = True
            
        if not allowed:
            return self._audit_and_deny(request, role, user_id, "Path access denied by RBAC")

        # 3. Proceed to actual route
        response = await call_next(request)
        
        # 4. Success Audit Log
        self._audit_log(request, role, user_id, "allowed")
        
        return response

    def _audit_and_deny(self, request: Request, role: str, user_id: str, reason: str):
        self._audit_log(request, role, user_id, "denied", reason)
        return JSONResponse(
            status_code=403,
            content={
                "agent": "SENTINEL",
                "error": "Forbidden",
                "reason": reason,
                "role": role
            }
        )
        
    def _audit_log(self, request: Request, role: str, user_id: str, outcome: str, details: str = ""):
        log_entry = {
            "id": f"AUD-{uuid.uuid4().hex[:8]}",
            "agent": "SENTINEL",
            "action": f"{request.method} {request.url.path}",
            "role": role,
            "user_id": user_id,
            "outcome": outcome,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        # In a real system, insert to DB. Here we log to stdout.
        # print(f"[SENTINEL AUDIT] {json.dumps(log_entry)}")
        audit_logger.info(f"[SENTINEL AUDIT] {json.dumps(log_entry)}")
