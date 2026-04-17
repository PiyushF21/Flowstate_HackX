"""
InfraLens — WebSocket Connection Manager

Manages real-time data streaming across portals.
Channels: agent_events, issues, tasks, notifications, escalations
"""

from typing import Dict, List, Any
from fastapi import WebSocket, WebSocketDisconnect

class ConnectionManager:
    def __init__(self):
        # channel_name -> list of WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {
            "agent_events": [],
            "issues": [],
            "tasks": [],
            "notifications": [],
            "escalations": []
        }
        # websocket -> role mapping for role-based targeting
        self.websocket_roles: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, channel: str, role: str = ""):
        """Accept a connection and assign it to a channel and optional role."""
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        self.active_connections[channel].append(websocket)
        if role:
            self.websocket_roles[websocket] = role
        print(f"[WebSocket] Connected to channel '{channel}' with role '{role}'")

    def disconnect(self, websocket: WebSocket, channel: str):
        """Remove a connection."""
        if channel in self.active_connections:
            if websocket in self.active_connections[channel]:
                self.active_connections[channel].remove(websocket)
        if websocket in self.websocket_roles:
            del self.websocket_roles[websocket]
        print(f"[WebSocket] Disconnected from channel '{channel}'")

    async def broadcast(self, channel: str, message: dict):
        """Broadcast a JSON message to all clients in a channel."""
        if channel not in self.active_connections:
            return
            
        disconnected = []
        for connection in self.active_connections[channel]:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
                
        # Clean up dead connections
        for conn in disconnected:
            self.disconnect(conn, channel)

    async def send_to_role(self, channel: str, role: str, message: dict):
        """Send a JSON message to specific roles within a channel."""
        if channel not in self.active_connections:
            return
            
        disconnected = []
        for connection in self.active_connections[channel]:
            conn_role = self.websocket_roles.get(connection)
            if conn_role == role:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.append(connection)
                    
        # Clean up dead connections
        for conn in disconnected:
            self.disconnect(conn, channel)


# Global singleton
ws_manager = ConnectionManager()
