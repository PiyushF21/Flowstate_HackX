"""
InfraLens — Image Upload Router

Handles image uploads from:
  - Citizen App (base64 from camera capture)
  - Worker App (file upload for proof photos)

Stores files in backend/uploads/ and returns public URLs.
"""

import os
import uuid
import base64
from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel

router = APIRouter(prefix="/api/upload", tags=["Upload"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")


class Base64Upload(BaseModel):
    image_base64: str
    filename_hint: str = ""


@router.post("/base64")
async def upload_base64(req: Base64Upload):
    """
    Accept a base64-encoded image string and persist it to disk.
    Returns the public URL path for referencing the image.
    """
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    ext = "jpg"
    if req.image_base64.startswith("/9j/"):
        ext = "jpg"
    elif req.image_base64.startswith("iVBOR"):
        ext = "png"

    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    image_bytes = base64.b64decode(req.image_base64)
    with open(filepath, "wb") as f:
        f.write(image_bytes)

    url = f"/uploads/{filename}"
    return {"url": url, "filename": filename}


@router.post("/file")
async def upload_file(file: UploadFile = File(...)):
    """
    Accept a multipart file upload (used by Worker ProofUpload component).
    Returns the public URL path for referencing the image.
    """
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    contents = await file.read()
    with open(filepath, "wb") as f:
        f.write(contents)

    url = f"/uploads/{filename}"
    return {"url": url, "filename": filename}
