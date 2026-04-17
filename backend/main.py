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
from routers import (
    issues_router, nexus_router, cognos_router, 
    commander_router, sentinel_router, loop_router, 
    oracle_router, field_copilot_router
)
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
    version="0.1.0",
    lifespan=lifespan
)

# ---------------------------------------------------------------------------
# Middlewares (Order matters: Execution is outer -> inner)
# CORS acts first to allow preflights. Then Sentinel authenticates/audits.
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
# Routers
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
