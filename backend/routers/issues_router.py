from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import Issue
from data_store import data_store
from datetime import datetime, timezone

router = APIRouter(prefix="/api/issues", tags=["Issues"])

@router.get("/", response_model=List[Issue])
async def get_issues(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    category: Optional[str] = None,
    source: Optional[str] = None,
    mc: Optional[str] = None,
    reporter_id: Optional[str] = None,
    limit: Optional[int] = None,
):
    """
    Retrieve issues. Optional filters for status, severity, category, source, mc.
    """
    filters = {}
    if status:
        filters["status"] = status
    if severity:
        filters["severity"] = severity
    if category:
        filters["category"] = category
    if source:
        filters["source"] = source
    if mc:
        filters["mc"] = mc
    if reporter_id:
        filters["reporter_id"] = reporter_id
    if limit:
        filters["limit"] = limit
        
    issues = await data_store.list_issues(filters)
    return issues


@router.get("/assigned/{worker_id}")
async def get_worker_tasks(worker_id: str):
    """
    Retrieve all issues assigned to a specific worker.
    Used by Worker TasksPage.
    """
    all_issues = await data_store.list_issues()
    worker_issues = [
        i for i in all_issues
        if i.assigned_to and i.assigned_to.worker_id == worker_id
    ]
    return worker_issues


@router.get("/{issue_id}", response_model=Issue)
async def get_issue(issue_id: str):
    """
    Retrieve details of a single issue.
    """
    issue = await data_store.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


@router.post("/", response_model=Issue)
async def create_issue(issue: Issue):
    """
    Directly create an issue (Though primarily handled by COGNOS/NEXUS agents).
    """
    if not issue.issue_id:
        city = issue.location.city if issue.location else "GEN"
        issue.issue_id = data_store.generate_issue_id(city)
    if not issue.created_at:
        issue.created_at = datetime.now(timezone.utc).isoformat()
    if not issue.updated_at:
        issue.updated_at = datetime.now(timezone.utc).isoformat()
    await data_store.create_issue(issue)
    return issue

