"""
Session routes — get_session for agents.
"""

from __future__ import annotations

from typing import Union

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import require_api_key
from app.db.session import get_db
from app.models.session import GetSessionRequest, SessionNeedsAuth, SessionReady
from app.services.session_service import SessionService

router = APIRouter()


@router.post(
    "/get",
    response_model=Union[SessionReady, SessionNeedsAuth],
    responses={
        200: {
            "description": "Either a ready session or needs_auth with escalation_id",
        }
    },
)
async def get_session(
    payload: GetSessionRequest,
    user_id: str = Depends(require_api_key),
    db: AsyncSession = Depends(get_db),
):
    """
    Get an authenticated Browserbase session for a site.

    - If a durable context exists for this user+site: create a short-lived
      session (persist=false) and return connect details.
    - Otherwise: create a human escalation and return needs_auth.
    """
    service = SessionService(db)
    return await service.get_session(
        user_id=user_id,
        site=payload.site,
        create_browser_session=payload.create_browser_session,
    )
