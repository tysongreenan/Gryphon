"""
Site catalog — login URLs for onboarding (no secrets).
"""

from __future__ import annotations

from fastapi import APIRouter

from app.services.site_urls import ONBOARDING_SITES, SITE_START_URLS

router = APIRouter()


@router.get("/catalog")
async def site_catalog():
    """
    Public list of known sites with login URLs for the dashboard connect UI.
    """
    return {
        "sites": ONBOARDING_SITES,
        "aliases": SITE_START_URLS,
    }
