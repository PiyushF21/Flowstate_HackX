"""
InfraLens — FastAPI Application Entry Point

Minimal Phase 1 scaffolding:
- Health check endpoint
- CORS middleware for frontend (localhost:5173)

Phase 2 will add: SENTINEL middleware, WebSocket, routers, startup events.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings

# ---------------------------------------------------------------------------
# App initialization
# ---------------------------------------------------------------------------
app = FastAPI(
    title="InfraLens",
    description="AI-Powered Civic Infrastructure Intelligence Platform",
    version="0.1.0",
)

# ---------------------------------------------------------------------------
# CORS — allow frontend dev server
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_ORIGIN,  # http://localhost:5173
        "http://localhost:5173",     # explicit fallback
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/api/health")
async def health_check():
    """Health check endpoint — confirms the backend is alive."""
    return {
        "status": "ok",
        "agent": "InfraLens",
        "version": "0.1.0",
    }
