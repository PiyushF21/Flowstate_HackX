from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, Field
from typing import List, Optional
from langchain_core.prompts import PromptTemplate
from langchain_xai import ChatXAI

from config import settings
from data_store import data_store
from models import Issue, Worker, Assignment

SLA_HOURS = {
    "CRITICAL": 4,
    "HIGH": 12,
    "MEDIUM": 48,
    "LOW": 168
}

WEIGHTS = {
    "expertise": 0.35,
    "proximity": 0.25,
    "workload": 0.20,
    "shift": 0.10,
    "performance": 0.10
}

class ProcedureOutput(BaseModel):
    steps: List[str] = Field(description="List of ordered procedure steps")
    materials: List[str] = Field(description="List of required materials")

def score_worker(worker: Worker, issue: Issue) -> float:
    score = 0.0
    
    # 1. Expertise (0 or 1)
    if not issue.category or any(issue.category.lower() in spec.lower() for spec in worker.specializations):
        score += WEIGHTS["expertise"]
        
    # 2. Proximity (mocked base on same city/ward for now as distance calc is heavy)
    if worker.mc == issue.location.city if issue.location else "":
        score += WEIGHTS["proximity"]
        
    # 3. Workload (higher if currently free)
    if worker.status == "available":
        score += WEIGHTS["workload"]
        
    # 4. Shift (naive check)
    score += WEIGHTS["shift"]
    
    # 5. Performance
    perf = worker.performance.rating if worker.performance else 4.0
    score += WEIGHTS["performance"] * (perf / 5.0)
    
    return score

async def find_best_worker(issue: Issue) -> Optional[Worker]:
    workers = await data_store.list_workers()
    # Filter out workers already on a task if it's not CRITICAL
    if issue.severity != "CRITICAL":
        workers = [w for w in workers if w.status == "available"]
        
    if not workers:
        return None
        
    best_worker = max(workers, key=lambda w: score_worker(w, issue))
    return best_worker

async def generate_action_plan(issue: Issue) -> ProcedureOutput:
    if not settings.has_xai_key:
        return ProcedureOutput(
            steps=["1. Assess site", "2. Execute standard repair", "3. Upload proof"],
            materials=["Safety gear", "Standard tools"]
        )
        
    llm = ChatXAI(xai_api_key=settings.XAI_API_KEY, model="grok-beta", temperature=0.1)
    llm_with_struct = llm.with_structured_output(ProcedureOutput)
    
    prompt = PromptTemplate.from_template(
        "You are an expert infrastructure engineer. Generate a repair procedure and materials list for:\n"
        "Category: {category}, Subcategory: {subcategory}, Description: {desc}, Severity: {sev}"
    )
    
    chain = prompt | llm_with_struct
    res = await chain.ainvoke({
        "category": issue.category,
        "subcategory": issue.subcategory,
        "desc": issue.description,
        "sev": issue.severity
    })
    return res

async def assign_issue(issue: Issue) -> Issue:
    worker = await find_best_worker(issue)
    if not worker:
        return issue # Leave unassigned for GUARDIAN to catch
        
    plan = await generate_action_plan(issue)
    
    # Generate SLA deadline
    hours = SLA_HOURS.get(issue.severity, 48)
    deadline = datetime.now(timezone.utc) + timedelta(hours=hours)
    
    issue.assigned_to = Assignment(
        worker_id=worker.worker_id,
        worker_name=worker.name,
        assigned_at=datetime.now(timezone.utc).isoformat()
    )
    issue.procedure = plan.steps
    issue.materials_required = plan.materials
    issue.deadline = deadline.isoformat()
    issue.status = "assigned"
    
    # Lock worker status
    await data_store.update_worker(worker.worker_id, {"status": "on_task", "current_task_id": issue.issue_id})
    return issue
