"""FIELD_COPILOT Router — Multilingual Voice AI Assistant endpoints."""
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from agents.field_copilot import (
    get_advice, CopilotResponse, CopilotChatRequest,
    TTSRequest, TTSResponse, synthesize_speech,
    translate_text,
    SUPPORTED_LANGUAGES
)

router = APIRouter(prefix="/api/field-copilot", tags=["FIELD_COPILOT"])


class LegacyCopilotRequest(BaseModel):
    worker_id: str
    issue_id: str
    message: str


class TranslateRequest(BaseModel):
    text: str
    target_language: str
    source_language: str = "en"


@router.post("/translate")
async def api_copilot_translate(req: TranslateRequest):
    """Translate text using Sarvam AI."""
    try:
        translated = await translate_text(req.text, req.source_language, req.target_language)
        return {"translated_text": translated}
    except Exception as e:
        print(f"[FIELD_COPILOT Translate] Error: {e}")
        return JSONResponse(status_code=500, content={"error": f"Translation failed: {str(e)}"})


@router.post("/chat", response_model=CopilotResponse)
async def api_copilot_chat(req: CopilotChatRequest):
    """Multilingual chat with FIELD_COPILOT. Accepts optional `language` field."""
    res = await get_advice(req.worker_id, req.issue_id, req.message, req.language)
    return res


@router.post("/tts")
async def api_copilot_tts(req: TTSRequest):
    """Convert text to speech using Sarvam AI TTS in any supported Indian language."""
    try:
        result = await synthesize_speech(req.text, req.language)
        return result
    except ValueError as e:
        return JSONResponse(status_code=400, content={"error": str(e)})
    except Exception as e:
        print(f"[FIELD_COPILOT TTS] Error: {e}")
        return JSONResponse(status_code=500, content={"error": f"TTS failed: {str(e)}"})


@router.get("/languages")
async def api_list_languages():
    """List all supported languages for FIELD_COPILOT."""
    return {
        "languages": [
            {"code": code, **info}
            for code, info in SUPPORTED_LANGUAGES.items()
        ]
    }
