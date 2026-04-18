# ==============================================================================
# FIELD_COPILOT — Multilingual Voice AI Assistant for Field Workers
# Powered by: Grok (xAI) for chat + Sarvam AI for TTS/Translation
# ==============================================================================

import httpx
import base64
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_xai import ChatXAI
from pydantic import BaseModel, Field

from config import settings
from data_store import data_store

# =============================================================================
# KNOWLEDGE BASE
# =============================================================================

REPAIR_KNOWLEDGE = {
    "roads": [
        "For potholes deeper than 15cm, always lay a compacted aggregate base first before cold-mix asphalt.",
        "Ensure the edges of the pothole are cut straight down to prevent the patch from popping out under traffic."
    ],
    "water_pipeline": [
        "Before excavating near a burst pipe, ensure the upstream valve is shut entirely to prevent trench flooding.",
        "Use PVC primer before applying PVC cement to ensure a continuous bond that resists municipal water pressure."
    ],
    "electrical": [
        "Never approach a sparking transformer without confirming local grid isolation.",
        "Use Class 2 electrical safety gloves for anything above 500V."
    ],
    "sanitation": [
        "Manholes must be allowed to vent for at least 15 minutes before entry to clear toxic gases (H2S).",
        "Use high-pressure jetting for fat-berg blockages."
    ],
    "structural": [
        "Retaining wall cracks wider than 3mm indicate active soil failure; shore immediately before repair."
    ],
    "traffic": [
        "Always replace traffic signal controllers during off-peak hours unless it is a total blackout."
    ]
}

SAFETY_PROTOCOLS = {
    "roads": "High-visibility vest, traffic cones positioned 50m upstream.",
    "water_pipeline": "Trench shoring required if deeper than 1.5m.",
    "electrical": "Lock-out/tag-out (LOTO) procedure must be completed. Insulated gloves mandatory.",
    "sanitation": "H2S gas detector and harness required for manhole entry.",
    "structural": "Hard hats and safety boots mandatory within drop zone.",
    "traffic": "High-visibility vest and traffic police assistance required."
}

# =============================================================================
# SUPPORTED LANGUAGES
# =============================================================================

SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "sarvam_code": "en-IN", "speech_code": "en-IN"},
    "hi": {"name": "Hindi", "sarvam_code": "hi-IN", "speech_code": "hi-IN"},
    "mr": {"name": "Marathi", "sarvam_code": "mr-IN", "speech_code": "mr-IN"},
    "ta": {"name": "Tamil", "sarvam_code": "ta-IN", "speech_code": "ta-IN"},
    "te": {"name": "Telugu", "sarvam_code": "te-IN", "speech_code": "te-IN"},
    "kn": {"name": "Kannada", "sarvam_code": "kn-IN", "speech_code": "kn-IN"},
    "bn": {"name": "Bengali", "sarvam_code": "bn-IN", "speech_code": "bn-IN"},
    "gu": {"name": "Gujarati", "sarvam_code": "gu-IN", "speech_code": "gu-IN"},
    "ml": {"name": "Malayalam", "sarvam_code": "ml-IN", "speech_code": "ml-IN"},
    "pa": {"name": "Punjabi", "sarvam_code": "pa-IN", "speech_code": "pa-IN"},
    "od": {"name": "Odia", "sarvam_code": "od-IN", "speech_code": "or-IN"},
}

# =============================================================================
# PROMPTS
# =============================================================================

COPILOT_PROMPT_MULTILINGUAL = """You are FIELD_COPILOT, an AI technical assistant for municipal infrastructure workers in India.
A field worker has asked you a question about their current repair task.

TASK CONTEXT:
- Category: {category}
- Subcategory: {subcategory}
- Current Status: {status}
- Repair Procedure: {procedure}

KNOWLEDGE BASE:
{knowledge}

SAFETY PROTOCOLS:
{safety}

LANGUAGE INSTRUCTION: You MUST respond in {language_name}. If the language is not English, respond naturally in that language using the native script. Keep technical terms in English if there is no common local equivalent.

Worker's Message: "{user_message}"

Provide a concise, direct, and technically accurate answer in 2-4 sentences. Focus on practical, actionable guidance. Always mention relevant safety precautions.
"""

# =============================================================================
# RESPONSE MODELS
# =============================================================================

class CopilotResponse(BaseModel):
    reply: str = Field(description="The advice for the worker in the requested language")
    safety_warning: str = Field(description="Any critical safety warning to flash on screen")

class CopilotChatRequest(BaseModel):
    worker_id: str
    issue_id: str
    message: str
    language: str = "en"  # Language code

class TTSRequest(BaseModel):
    text: str
    language: str = "en"  # Language code

class TTSResponse(BaseModel):
    audio_base64: str
    content_type: str = "audio/wav"

# =============================================================================
# SARVAM AI TTS
# =============================================================================

async def synthesize_speech(text: str, language: str = "en") -> TTSResponse:
    """Convert text to speech using Sarvam AI TTS API."""
    lang_config = SUPPORTED_LANGUAGES.get(language, SUPPORTED_LANGUAGES["en"])
    sarvam_code = lang_config["sarvam_code"]
    
    if not settings.has_sarvam_key:
        raise ValueError("Sarvam AI API key not configured")
    
    # Chunk text if it's too long (Sarvam has a ~500 char limit per request)
    max_chars = 480
    if len(text) > max_chars:
        text = text[:max_chars]
    
    url = "https://api.sarvam.ai/text-to-speech"
    payload = {
        "inputs": [text],
        "target_language_code": sarvam_code,
        "speaker": "meera",
        "model": "bulbul:v1",
    }
    headers = {
        "api-subscription-key": settings.SARVAM_API_KEY,
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        # Sarvam returns base64-encoded audio in the 'audios' array
        audio_b64 = data.get("audios", [None])[0]
        if not audio_b64:
            raise ValueError("No audio returned from Sarvam AI")
        
        return TTSResponse(audio_base64=audio_b64, content_type="audio/wav")


# =============================================================================
# SARVAM AI TRANSLATE
# =============================================================================

async def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """Translate text using Sarvam AI Translate API."""
    if source_lang == target_lang:
        return text
    
    if not settings.has_sarvam_key:
        return text  # Return untranslated
    
    source_config = SUPPORTED_LANGUAGES.get(source_lang, SUPPORTED_LANGUAGES["en"])
    target_config = SUPPORTED_LANGUAGES.get(target_lang, SUPPORTED_LANGUAGES["en"])
    
    url = "https://api.sarvam.ai/translate"
    payload = {
        "input": text,
        "source_language_code": source_config["sarvam_code"],
        "target_language_code": target_config["sarvam_code"],
        "model": "mayura:v1",
        "mode": "classic-colloquial",
    }
    headers = {
        "api-subscription-key": settings.SARVAM_API_KEY,
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data.get("translated_text", text)
    except Exception as e:
        print(f"[FIELD_COPILOT] Sarvam translate error: {e}")
        return text


# =============================================================================
# MAIN CHAT FUNCTION
# =============================================================================

async def get_advice(worker_id: str, issue_id: str, user_message: str, language: str = "en") -> CopilotResponse:
    """Get AI-powered technical advice for the field worker, in the requested language."""
    worker = await data_store.get_worker(worker_id)
    issue = await data_store.get_issue(issue_id)
    
    # Determine context from issue
    cat = "roads"
    subcategory = "general"
    status = "assigned"
    procedure = "Follow standard repair protocol."
    
    if issue:
        cat = issue.category or "roads"
        subcategory = issue.subcategory or "general"
        status = issue.status or "assigned"
        procedure = " ".join(issue.procedure) if issue.procedure else "Follow standard repair protocol."
        
    knowledge = REPAIR_KNOWLEDGE.get(cat, ["Follow standard safety and repair procedures."])
    safety = SAFETY_PROTOCOLS.get(cat, "Standard safety protocols apply.")
    lang_config = SUPPORTED_LANGUAGES.get(language, SUPPORTED_LANGUAGES["en"])
    
    # --- If the user spoke in a non-English language, translate to English first for context ---
    english_message = user_message
    if language != "en" and settings.has_sarvam_key:
        try:
            english_message = await translate_text(user_message, language, "en")
        except Exception:
            english_message = user_message
    
    # ---- GROK LLM PATH ----
    try:
        llm = ChatXAI(
            xai_api_key=settings.XAI_API_KEY,
            model="grok-4-1-fast-reasoning",
            temperature=0.3,
        )
        
        # Build a rich system prompt with all context
        system_prompt = f"""You are FIELD_COPILOT, a highly intelligent and practical AI technical assistant for municipal field workers.

CURRENT TASK CONTEXT (For Background Only):
- Category: {cat}
- Assigned Procedure: {procedure}
- Recommended Safety: {safety}

CRITICAL RULES:
1. YOU MUST ANSWER THE WORKER'S ACTUAL QUESTION. Do not rigidly adhere to the "Task Context" if the worker is asking about something else entirely.
2. If the user asks a general question, answers it directly based on your massive knowledge of civic infrastructure, repair techniques, and equipment.
3. Your primary goal is to be helpful, relevant, and accurate to exactly what they just asked.
4. Keep responses concise and actionable (2-4 sentences max).
5. Always speak professionally and safely.

LANGUAGE INSTRUCTION:
You MUST respond entirely in {lang_config['name']} (using the native script). Exception: Keep universally known English technical terms in English."""

        human_msg = user_message

        result = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_msg),
        ])
        
        reply_text = result.content if hasattr(result, 'content') else str(result)
        
        # Clean up any thinking tags if present (reasoning models sometimes include them)
        if '<think>' in reply_text:
            # Remove everything between <think> and </think>
            import re
            reply_text = re.sub(r'<think>.*?</think>', '', reply_text, flags=re.DOTALL).strip()
        
        # Generate safety warning in the requested language
        safety_warning = safety
        if language != "en" and settings.has_sarvam_key:
            try:
                safety_warning = await translate_text(safety, "en", language)
            except Exception:
                pass
        
        return CopilotResponse(reply=reply_text, safety_warning=safety_warning)
        
    except Exception as e:
        print(f"[FIELD_COPILOT] LLM error: {e}")
        import traceback
        traceback.print_exc()
        reply = f"For this {cat.replace('_', ' ')} task: {knowledge[0]} Document your progress with photos."
        if language != "en" and settings.has_sarvam_key:
            try:
                reply = await translate_text(reply, "en", language)
            except Exception:
                pass
        return CopilotResponse(
            reply=reply,
            safety_warning=safety
        )

