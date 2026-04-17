from datetime import datetime, timezone
from models import Issue, Completion, AgentEvent
from data_store import data_store
from ws_manager import ws_manager

async def broadcast_event(action: str, issue_id: str, data: dict):
    event = AgentEvent(
        agent="LOOP",
        action=action,
        issue_id=issue_id,
        data=data,
        portal="backend",
        timestamp=datetime.now(timezone.utc).isoformat()
    )
    await data_store.add_agent_event(event)
    await ws_manager.broadcast("agent_events", event.model_dump())

async def submit_proof(issue_id: str, images: list[str], notes: str) -> dict:
    issue = await data_store.get_issue(issue_id)
    if not issue: return {"error": "not found"}
    
    issue.status = "pending_verification"
    issue.completion = Completion(proof_images=images)
    await data_store.update_issue(issue_id, issue.model_dump())
    
    await broadcast_event("proof_submitted", issue_id, {"images_count": len(images)})
    return {"status": "success", "issue": issue.model_dump()}

async def verify_completion(issue_id: str, verifier_id: str, approved: bool, rejection_reason: str = "") -> dict:
    issue = await data_store.get_issue(issue_id)
    if not issue: return {"error": "not found"}
    
    if not approved:
        issue.status = "in_progress"
        await data_store.update_issue(issue_id, issue.model_dump())
        await broadcast_event("proof_rejected", issue_id, {"reason": rejection_reason})
        return {"status": "rejected", "issue": issue.model_dump()}
        
    completed_at = datetime.now(timezone.utc)
    issue.status = "resolved"
    issue.completion.verified_by = verifier_id
    issue.completion.verified_at = completed_at.isoformat()
    
    # SLA Calculation
    if issue.deadline:
        deadline = datetime.fromisoformat(issue.deadline)
        issue.sla_met = completed_at <= deadline
        diff = completed_at - datetime.fromisoformat(issue.created_at)
        issue.resolution_time_hours = diff.total_seconds() / 3600.0
        
    # Free up worker
    if issue.assigned_to:
        await data_store.update_worker(issue.assigned_to.worker_id, {"status": "available", "current_task_id": None})
        
    await data_store.update_issue(issue_id, issue.model_dump())
    await notify_citizen(issue)
    
    await broadcast_event("proof_approved", issue_id, {"sla_met": issue.sla_met})
    return {"status": "resolved", "issue": issue.model_dump()}

async def notify_citizen(issue: Issue):
    if not issue.reporter or issue.reporter.reporter_id == "SENSOR-AUTO":
        return
        
    notification = {
        "user_id": issue.reporter.reporter_id,
        "message": f"Your reported issue ({issue.category}) has been resolved!",
        "issue_id": issue.issue_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await data_store.add_notification(notification)
    issue.citizen_notified = True
    await data_store.update_issue(issue.issue_id, {"citizen_notified": True})
    await ws_manager.broadcast("notifications", notification)

async def submit_feedback(issue_id: str, reporter_id: str, rating: int, comment: str) -> dict:
    issue = await data_store.get_issue(issue_id)
    if not issue: return {"error": "not found"}
    
    # Save feedback (mocked into issue object for now)
    
    # Update worker rating
    if issue.assigned_to:
        worker = await data_store.get_worker(issue.assigned_to.worker_id)
        if worker and worker.performance:
            old_rating = worker.performance.rating
            # Simple average mock
            new_rating = (old_rating * 5 + rating) / 6.0
            worker.performance.rating = new_rating
            await data_store.update_worker(worker.worker_id, {"performance": worker.performance.model_dump()})
            
    await broadcast_event("feedback_received", issue_id, {"rating": rating})
    return {"status": "success"}

