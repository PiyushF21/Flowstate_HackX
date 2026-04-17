"""VIRA Router -- Citizen chat/voice endpoints."""
from fastapi import APIRouter
from models import ChatMessage, VoiceMessage
from agents import vira

router = APIRouter(prefix="/api/vira", tags=["VIRA"])


@router.post("/chat")
async def vira_chat(msg: ChatMessage):
    """Text message from citizen."""
    return await vira.chat(msg.user_id, msg.message)


@router.post("/voice")
async def vira_voice(msg: VoiceMessage):
    """Voice input (transcribed + processed)."""
    return await vira.chat(msg.user_id, msg.transcribed_text)
