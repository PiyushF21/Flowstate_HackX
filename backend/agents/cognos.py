import json
import logging
from typing import Any
from langchain_core.prompts import PromptTemplate
from langchain_xai import ChatXAI
from pydantic import BaseModel, Field

from config import settings
from data_store import data_store
from models import Issue, AIClassification, AgentEvent, Location

logger = logging.getLogger("cognos")

FAULT_CODES = {
    "RD-001": "Pothole detected \u2014 road surface cavity",
    "RD-002": "Road cave-in \u2014 subsurface collapse",
    "RD-003": "Missing manhole cover",
    "RD-004": "Broken footpath / pavement damage",
    "OB-001": "Fallen road divider / barrier",
    "OB-002": "Debris / construction waste on road",
    "WT-001": "Water pipeline burst",
    "EL-001": "Street light malfunction",
    "ST-001": "Structural crack \u2014 building / wall",
}

class CognosLLMOutput(BaseModel):
    category: str = Field(description="Issue category (e.g., roads, water_pipeline)")
    subcategory: str = Field(description="Issue subcategory")
    severity: str = Field(description="CRITICAL, HIGH, MEDIUM, or LOW")
    fault_code: str = Field(description="Matched fault code from infrastructure list")
    description: str = Field(description="Natural language summary of the issue")
    confidence: float = Field(description="Confidence from 0.0 to 1.0")

def score_sensor_data_rule(data: dict, nearby_count: int) -> dict:
    speed = data.get("speed_kmh", 0)
    accel = data.get("accelerometer", {"y": 0.0})
    jolt_y = abs(accel.get("y", 0.0))
    
    if speed < 20:
        return {"severity": "LOW", "score": 10, "confidence": "Minor Jolt"}
        
    if jolt_y > 4.0:
        score = 80
    elif jolt_y > 2.5:
        score = 55
    elif jolt_y > 2.0:
        score = 30
    else:
        score = 10
        
    if nearby_count >= 3:
        score = min(score + 20, 100)
        
    if score >= 70: sev = "CRITICAL"
    elif score >= 40: sev = "HIGH"
    elif score >= 15: sev = "MEDIUM"
    else: sev = "LOW"
    
    return {"severity": sev, "score": score, "confidence": "CONFIRMED" if nearby_count >=3 else "PROBABLE"}

async def llm_analyze(raw_data: dict, source: str) -> CognosLLMOutput:
    if not settings.has_xai_key:
        if source == "manual_complaint":
            return CognosLLMOutput(
                category=raw_data.get("category", "roads"),
                subcategory=raw_data.get("subcategory", "pothole"),
                severity=raw_data.get("severity", "MEDIUM"),
                fault_code="RD-001",
                description=raw_data.get("description", "Mock LLM Description due to missing API key."),
                confidence=0.9
            )
        return CognosLLMOutput(
            category="unknown", subcategory="unknown",
            severity="MEDIUM", fault_code="RD-001",
            description="Mock LLM Description due to missing API key.", confidence=0.5
        )
        
    llm = ChatXAI(xai_api_key=settings.XAI_API_KEY, model="grok-2-latest", temperature=0.2)
    llm_with_struct = llm.with_structured_output(CognosLLMOutput)
    
    prompt = PromptTemplate.from_template(
        "Analyze the following {source} data and classify the infrastructure issue.\n"
        "Fault codes to choose from: {fault_codes}\n"
        "Data: {data}\n"
    )
    
    chain = prompt | llm_with_struct
    res = await chain.ainvoke({
        "source": source,
        "fault_codes": json.dumps(FAULT_CODES),
        "data": json.dumps(raw_data)
    })
    return res

async def fuse_classifications(rule_result: dict, llm_result: CognosLLMOutput) -> str:
    # Always take the higher severity safely
    weights = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}
    rule_sev = rule_result.get("severity", "LOW")
    llm_sev = llm_result.severity
    if weights.get(llm_sev, 1) > weights.get(rule_sev, 1):
        return llm_sev
    return rule_sev

async def process_cognos(issue_id: str, raw_data: dict, source: str, lat: float, lng: float) -> dict:
    # 1. Broad cross-validation check
    nearby = await data_store.list_issues_near(lat, lng, 10.0)
    
    # 2. Rule Engine
    rule_res = score_sensor_data_rule(raw_data, len(nearby))
    
    # 3. LLM Engine
    llm_res = await llm_analyze(raw_data, source)
    
    # 4. Fusion
    final_sev = await fuse_classifications(rule_res, llm_res)
    
    return {
        "final_severity": final_sev,
        "category": llm_res.category,
        "subcategory": llm_res.subcategory,
        "confidence": llm_res.confidence,
        "description": llm_res.description,
        "fault_code": llm_res.fault_code
    }
