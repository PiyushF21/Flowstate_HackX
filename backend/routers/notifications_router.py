"""Notifications Router -- Citizen and worker notification endpoints."""
from fastapi import APIRouter
from typing import Optional
from data_store import data_store

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("/")
async def get_notifications(user_id: Optional[str] = None):
    """Retrieve notifications for a user or all notifications."""
    notifications = await data_store.get_notifications(user_id)
    return {"notifications": notifications, "count": len(notifications)}


@router.post("/read/{notification_id}")
async def mark_read(notification_id: str):
    """Mark a notification as read."""
    # In-memory store doesn't track read state per notification yet
    return {"status": "ok", "notification_id": notification_id}
