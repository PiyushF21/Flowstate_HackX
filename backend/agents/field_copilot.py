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
    
    # Determine category from issue or infer from message
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
    
    if not settings.has_xai_key:
        # Smart rule-based response using the knowledge base
        msg_lower = user_message.lower()
        if "fix" in msg_lower or "repair" in msg_lower or "how" in msg_lower or "complete" in msg_lower:
            reply = f"For this {cat.replace('_', ' ')} task: {knowledge[0]} Make sure to document before/after with photos."
        elif "safety" in msg_lower or "precaution" in msg_lower or "danger" in msg_lower:
            reply = f"Safety protocol for {cat.replace('_', ' ')}: {safety}"
        elif "material" in msg_lower or "tool" in msg_lower or "equipment" in msg_lower or "need" in msg_lower:
            reply = f"For {cat.replace('_', ' ')} repairs, ensure you have the standard toolkit. {knowledge[-1] if len(knowledge) > 1 else knowledge[0]}"
        else:
            reply = f"I can help with this {cat.replace('_', ' ')} task. {knowledge[0]} Ask me about repair steps, safety tips, or required materials."
        
        return CopilotResponse(reply=reply, safety_warning=safety)
        
    try:
        llm = ChatXAI(xai_api_key=settings.XAI_API_KEY, model="grok-3-fast", temperature=0.1)
        llm_with_struct = llm.with_structured_output(CopilotResponse)
        
        prompt = PromptTemplate.from_template(COPILOT_PROMPT)
        chain = prompt | llm_with_struct
        
        res = await chain.ainvoke({
            "category": cat,
            "subcategory": subcategory,
            "status": status,
            "procedure": procedure,
            "knowledge": str(knowledge),
            "safety": safety,
            "user_message": user_message
        })
        
        return res
    except Exception as e:
        print(f"[FIELD_COPILOT] LLM error: {e}")
        return CopilotResponse(
            reply=f"For this {cat.replace('_', ' ')} task: {knowledge[0]} Document your progress with photos.",
            safety_warning=safety
        )
