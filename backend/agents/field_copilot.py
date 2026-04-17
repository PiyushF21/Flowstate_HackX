# ==============================================================================
# FIELD_COPILOT Draft — Pure Python Prompts & Dicts
# ==============================================================================

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

from langchain_core.prompts import PromptTemplate
from langchain_xai import ChatXAI
from pydantic import BaseModel, Field

from config import settings
from data_store import data_store

COPILOT_PROMPT = """You are FIELD_COPILOT, an AI technical assistant for municipal infrastructure workers.
A worker in the field has encountered a problem and has asked you a question.

Here is the context of their task:
Category: {category}
Subcategory: {subcategory}
Current Status: {status}
Given Procedure: {procedure}

Relevant Repair Knowledge: {knowledge}
Required Safety Protocols: {safety}

Worker's Message: "{user_message}"

Provide a concise, direct, and technically accurate answer to help the worker solve their issue.
Respond in exactly 1-3 sentences.
"""

class CopilotResponse(BaseModel):
    reply: str = Field(description="The 1-3 sentence advice for the worker")
    safety_warning: str = Field(description="Any critical safety warning to flash on screen")

async def get_advice(worker_id: str, issue_id: str, user_message: str) -> CopilotResponse:
    worker = await data_store.get_worker(worker_id)
    issue = await data_store.get_issue(issue_id)
    
    if not worker or not issue:
        return CopilotResponse(reply="Entity not found context.", safety_warning="")
        
    cat = issue.category or "general"
    knowledge = REPAIR_KNOWLEDGE.get(cat, ["No specific knowledge loaded."])
    safety = SAFETY_PROTOCOLS.get(cat, "Standard safety protocols apply.")
    procedure = " ".join(issue.procedure) if issue.procedure else "None"
    
    if not settings.has_xai_key:
        return CopilotResponse(
            reply=f"MOCK: To resolve {cat}, please follow standard protocol. {knowledge[0]}",
            safety_warning=f"MOCK WARNING: {safety}"
        )
        
    llm = ChatXAI(xai_api_key=settings.XAI_API_KEY, model="grok-beta", temperature=0.1)
    llm_with_struct = llm.with_structured_output(CopilotResponse)
    
    prompt = PromptTemplate.from_template(COPILOT_PROMPT)
    chain = prompt | llm_with_struct
    
    res = await chain.ainvoke({
        "category": cat,
        "subcategory": issue.subcategory,
        "status": issue.status,
        "procedure": procedure,
        "knowledge": str(knowledge),
        "safety": safety,
        "user_message": user_message
    })
    
    return res
