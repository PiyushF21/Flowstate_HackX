from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import Issue
from data_store import data_store

router = APIRouter(prefix="/api/issues", tags=["Issues"])

@router.get("/", response_model=List[Issue])
async def get_issues(status: Optional[str] = None, severity: Optional[str] = None):
    """
    Retrieve issues. Optional filters for status or severity.
    """
    filters = {}
    if status:
        filters["status"] = status
    if severity:
        filters["severity"] = severity
        
    issues = await data_store.list_issues(filters)
    return issues

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
    await data_store.create_issue(issue)
    return issue

