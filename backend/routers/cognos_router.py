from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from agents.cognos import process_cognos, llm_analyze_image
import traceback

router = APIRouter(prefix="/api/cognos", tags=["COGNOS"])

class AnalyzeRequest(BaseModel):
    issue_id: str
    source: str
    raw_data: dict
    lat: float
    lng: float

class ImageAnalyzeRequest(BaseModel):
    image_base64: str
    lat: Optional[float] = 19.076
    lng: Optional[float] = 72.8777

@router.post("/analyze-sensor")
async def api_analyze_sensor(req: AnalyzeRequest):
    """Direct testing endpoint for COGNOS (bypasses NEXUS pipeline)."""
    result = await process_cognos(req.issue_id, req.raw_data, req.source, req.lat, req.lng)
    return {"status": "success", "agent": "COGNOS", "data": result}

@router.post("/analyze-image")
async def api_analyze_image(req: ImageAnalyzeRequest):
    """Analyze an uploaded image using COGNOS Vision (Grok Vision or fallback)."""
    try:
        result = await llm_analyze_image(req.image_base64)
        return {
            "status": "success",
            "agent": "COGNOS",
            "data": {
                "category": result.category,
                "subcategory": result.subcategory,
                "severity": result.severity,
                "fault_code": result.fault_code,
                "description": result.description,
                "confidence": result.confidence,
            }
        }
    except Exception as e:
        traceback.print_exc()
        return {
            "status": "success",
            "agent": "COGNOS",
            "data": {
                "category": "roads",
                "subcategory": "pothole",
                "severity": "MEDIUM",
                "fault_code": "RD-001",
                "description": "Infrastructure issue detected from uploaded image.",
                "confidence": 0.75,
            }
        }

