import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from app.services.gemini_service import gemini_service

logger = logging.getLogger("vidai.invitations")

router = APIRouter()


class InvitationRequest(BaseModel):
    essentials: Dict[str, Any]
    style: Dict[str, Any]
    tone: str
    userId: str


@router.post("/generate")
async def generate_invitation(request: InvitationRequest):
    try:
        content = await gemini_service.generate_invitation_content(
            request.essentials,
            request.style,
            request.tone,
        )
        return {
            "success": True,
            "data": {"generatedContent": content},
        }
    except Exception as e:
        # Never surface the raw error to the client
        logger.error("Invitation generation failed: %r", e)
        raise HTTPException(
            status_code=502,
            detail="Invitation generation failed. Please try again.",
        ) from e
