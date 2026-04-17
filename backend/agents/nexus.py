import json
from typing import TypedDict, Optional, List
from datetime import datetime, timezone
from langgraph.graph import StateGraph, END

from models import Issue, Location, AgentEvent, Reporter
from data_store import data_store
from ws_manager import ws_manager
from agents.cognos import process_cognos
from agents.commander import assign_issue
from agents.sentinel import process_sentinel

class AgentState(TypedDict):
    issue_id: str
    source: str
    raw_data: dict
    classification: dict
    severity: str
    location: dict
    mc: str
    assignment: dict
    worker_id: str
    procedure: List[str]
    deadline: str
    status: str
    execution_steps: List[str]
    role: str

async def broadcast_event(state: AgentState, action: str):
    event = AgentEvent(
        agent="NEXUS",
        action=action,
        issue_id=state.get("issue_id"),
        data={"source": state.get("source"), "status": state.get("status")},
        portal="backend",
        timestamp=datetime.now(timezone.utc).isoformat()
    )
    await data_store.add_agent_event(event)
    await ws_manager.broadcast("agent_events", event.model_dump())

async def node_classify_source(state: AgentState):
    """Initial ingestion node."""
    state["execution_steps"].append("classify_source")
    await broadcast_event(state, "ingested_raw_data")
    return state

async def node_cognos(state: AgentState):
    """Calls COGNOS to classify the issue."""
    loc = state.get("location", {"lat": 19.0, "lng": 72.8})
    res = await process_cognos(
        state["issue_id"], 
        state["raw_data"], 
        state["source"],
        loc.get("lat"), loc.get("lng")
    )
    state["classification"] = res
    state["severity"] = res["final_severity"]
    state["execution_steps"].append("COGNOS")
    await broadcast_event(state, "cognos_classification_complete")
    return state

async def node_sentinel(state: AgentState):
    """Calls SENTINEL to verify action."""
    res = await process_sentinel(state["issue_id"], state.get("role", "system"))
    if not res.get("sentinel_passed"):
        state["status"] = "cancelled"
    state["execution_steps"].append("SENTINEL")
    await broadcast_event(state, "sentinel_verification")
    return state

async def node_commander(state: AgentState):
    """Calls COMMANDER to assign issue to worker."""
    if state["status"] == "cancelled":
        return state
        
    reporter = None
    if state["source"] == "manual_complaint":
        rid = state["raw_data"].get("user_id") or state["raw_data"].get("reporter_id") or "anon"
        rname = state["raw_data"].get("reporter_name", rid)
        reporter = Reporter(reporter_id=rid, reporter_name=rname)

    issue = Issue(
        issue_id=state["issue_id"],
        source=state["source"],
        category=state["classification"].get("category", ""),
        subcategory=state["classification"].get("subcategory", ""),
        severity=state["severity"],
        description=state["classification"].get("description", ""),
        location=Location(**state["location"]),
        reporter=reporter,
        created_at=datetime.now(timezone.utc).isoformat(),
        updated_at=datetime.now(timezone.utc).isoformat()
    )
    
    assigned_issue = await assign_issue(issue)
    await data_store.create_issue(assigned_issue)
    
    state["status"] = assigned_issue.status
    if assigned_issue.assigned_to:
        state["assignment"] = assigned_issue.assigned_to.model_dump()
        state["worker_id"] = assigned_issue.assigned_to.worker_id
        state["procedure"] = assigned_issue.procedure
        state["deadline"] = assigned_issue.deadline
        
    state["execution_steps"].append("COMMANDER")
    await broadcast_event(state, "commander_assigned")
    return state

async def node_guardian(state: AgentState):
    """Hooks GUARDIAN explicitly for CRITICAL monitoring."""
    state["execution_steps"].append("GUARDIAN_MONITOR")
    await broadcast_event(state, "guardian_hooked")
    return state

def severity_router(state: AgentState) -> str:
    """Conditional edge based on COGNOS output."""
    if state["status"] == "cancelled":
        return "END"
    if state["severity"] == "CRITICAL":
        return "GUARDIAN"
    return "END"

# ---------------------------------------------------------
# Build Graph
# ---------------------------------------------------------
workflow = StateGraph(AgentState)

workflow.add_node("classify_source", node_classify_source)
workflow.add_node("cognos", node_cognos)
workflow.add_node("sentinel", node_sentinel)
workflow.add_node("commander", node_commander)
workflow.add_node("guardian_monitor", node_guardian)

workflow.set_entry_point("classify_source")
workflow.add_edge("classify_source", "cognos")
workflow.add_edge("cognos", "sentinel")
workflow.add_edge("sentinel", "commander")

# Conditional routing out of commander
workflow.add_conditional_edges(
    "commander",
    severity_router,
    {
        "GUARDIAN": "guardian_monitor",
        "END": END
    }
)
workflow.add_edge("guardian_monitor", END)

nexus_app = workflow.compile()

async def process_issue(raw_data: dict, source: str, location: dict, role: str = "system") -> dict:
    """Main entry point for NEXUS to process an issue."""
    issue_id = data_store.generate_issue_id(location.get("city", "UNK"))
    
    initial_state = AgentState(
        issue_id=issue_id,
        source=source,
        raw_data=raw_data,
        location=location,
        role=role,
        status="reported",
        execution_steps=[],
        classification={},
        severity="",
        mc="",
        assignment={},
        worker_id="",
        procedure=[],
        deadline=""
    )
    
    # Run the graph
    result = await nexus_app.ainvoke(initial_state)
    return result
