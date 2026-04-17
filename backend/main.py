"""
InfraLens — FastAPI Application Entry Point

Phase 1 scaffolding:
- Health check endpoint
- CORS middleware for frontend

Phase 2 core (Added):
- SENTINEL middleware (RBAC + Audit)
- WebSocket multiplexer
- Issues router
- App Lifespan (Seed Data loading)
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from data_store import data_store
from ws_manager import ws_manager
from routers import issues_router
from routers.vira_router import router as vira_router
from routers.guardian_router import router as guardian_router
from routers.prescient_router import router as prescient_router
from routers.fleet_router import router as fleet_router

# ---------------------------------------------------------------------------
# App initialization
# ---------------------------------------------------------------------------
app = FastAPI(
    title="InfraLens",
    description="AI-Powered Civic Infrastructure Intelligence Platform",
    version="0.2.0",
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
# Startup event — load seed data
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup():
    data_store.load_seed_data()

# ---------------------------------------------------------------------------
# Register routers
# ---------------------------------------------------------------------------
app.include_router(vira_router)
app.include_router(guardian_router)
app.include_router(prescient_router)
app.include_router(fleet_router)

# ---------------------------------------------------------------------------
# WebSockets
# ---------------------------------------------------------------------------
@app.websocket("/ws/{channel}")
async def websocket_endpoint(websocket: WebSocket, channel: str):
    # Check headers or query params for role for targeting, default empty
    role = websocket.query_params.get("role", "")
    await ws_manager.connect(websocket, channel, role)
    try:
        while True:
            # We mostly broadcast, but if clients send, read here
            data = await websocket.receive_text()
            # Loopback or process client messages if needed
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, channel)


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
