"""
Public waitlist — no API key. Used by the marketing site.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.waitlist import WaitlistCreate, WaitlistResult
from app.services.waitlist_service import WaitlistService

router = APIRouter()


@router.post(
    "/",
    response_model=WaitlistResult,
    status_code=status.HTTP_200_OK,
    summary="Join the Gryphon waitlist",
)
async def join_waitlist(
    payload: WaitlistCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Public endpoint for landing-page signups.

    Idempotent on email: re-submits return ``created=false`` without error.
    """
    service = WaitlistService(db)
    return await service.signup(payload)
