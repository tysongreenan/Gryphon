"""
API key authentication.

Validates X-API-Key against hashed keys in the database and returns the owning user id.
"""

from __future__ import annotations

from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.api_keys import authenticate_api_key


async def require_api_key(
    x_api_key: Optional[str] = Header(default=None, alias="X-API-Key"),
    db: AsyncSession = Depends(get_db),
) -> str:
    """
    Validate the API key and return the authenticated user id.

    Escalations created with this dependency are scoped to that user.
    """
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "missing_api_key",
                "message": "Missing X-API-Key header",
            },
            headers={"WWW-Authenticate": "ApiKey"},
        )

    principal = await authenticate_api_key(db, x_api_key)
    if principal is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "invalid_api_key",
                "message": "Invalid or revoked API key",
            },
            headers={"WWW-Authenticate": "ApiKey"},
        )
    return principal.user_id
