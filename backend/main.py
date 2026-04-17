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

Phase 3 (Piyush):
- VIRA, GUARDIAN, PRESCIENT, FLEET routers
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from data_store import data_store
from ws_manager import ws_manager
from routers import (
    issues_router, nexus_router, cognos_router, 
    commander_router, sentinel_router, loop_router, 
    oracle_router, field_copilot_router
)
from routers.vira_router import router as vira_router
from routers.guardian_router import router as guardian_router
from routers.prescient_router import router as prescient_router
from routers.fleet_router import router as fleet_router
from routers.notifications_router import router as notifications_router
from middleware.sentinel_middleware import SentinelMiddleware

# ---------------------------------------------------------------------------
# App Lifespan (Startup / Shutdown)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle hook for startup and shutdown events."""
    print("[NEXUS] Booting InfraLens data layer...")
    data_store.load_seed_data()
    yield
    print("[NEXUS] Shutting down InfraLens...")

# ---------------------------------------------------------------------------
# App initialization
# ---------------------------------------------------------------------------
app = FastAPI(
    title="InfraLens",
    description="Engineered by Flowstate — Civic Intelligence Platform",
    version="0.2.0",
    lifespan=lifespan
)

# ---------------------------------------------------------------------------
# Middlewares
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_ORIGIN,
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SentinelMiddleware)

# ---------------------------------------------------------------------------
# Register routers — Stavan's core routers
# ---------------------------------------------------------------------------
app.include_router(issues_router.router)
app.include_router(nexus_router.router)
app.include_router(cognos_router.router)
app.include_router(commander_router.router)
app.include_router(sentinel_router.router)
app.include_router(loop_router.router)
app.include_router(oracle_router.router)
app.include_router(field_copilot_router.router)

# ---------------------------------------------------------------------------
# Register routers — Piyush's agent routers
# ---------------------------------------------------------------------------
app.include_router(vira_router)
app.include_router(guardian_router)
app.include_router(prescient_router)
app.include_router(fleet_router)
app.include_router(notifications_router)

# ---------------------------------------------------------------------------
# WebSockets
# ---------------------------------------------------------------------------
@app.websocket("/ws/{channel}")
async def websocket_endpoint(websocket: WebSocket, channel: str):
    role = websocket.query_params.get("role", "")
    await ws_manager.connect(websocket, channel, role)
    try:
        while True:
            data = await websocket.receive_text()
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
        "version": "0.2.0",
    }
