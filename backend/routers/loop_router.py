from fastapi import APIRouter
from pydantic import BaseModel
from agents.loop import submit_proof, verify_completion, submit_feedback

router = APIRouter(prefix="/api/loop", tags=["LOOP"])

class ProofRequest(BaseModel):
    issue_id: str
    images: list[str]
    notes: str = ""

class VerifyRequest(BaseModel):
    issue_id: str
    verifier_id: str
    approved: bool
    rejection_reason: str = ""

class FeedbackRequest(BaseModel):
    issue_id: str
    reporter_id: str
    rating: int
    comment: str = ""

@router.post("/verify")
async def api_verify(req: VerifyRequest):
    res = await verify_completion(req.issue_id, req.verifier_id, req.approved, req.rejection_reason)
    return res

@router.post("/proof")
async def api_proof(req: ProofRequest):
    res = await submit_proof(req.issue_id, req.images, req.notes)
    return res

@router.post("/feedback")
async def api_feedback(req: FeedbackRequest):
    res = await submit_feedback(req.issue_id, req.reporter_id, req.rating, req.comment)
    return res
