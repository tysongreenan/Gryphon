"""
Escalation API models.

An Escalation represents a request from an agent for human help with authentication.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class EscalationStatus(str, Enum):
    PENDING = "pending"
    RESOLVED = "resolved"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class EscalationCreate(BaseModel):
    site: str = Field(..., description="The site that needs authentication (e.g. 'linkedin')")
    reason: str = Field(..., description="Why the agent needs help")
    screenshot_url: Optional[str] = None
    current_context_id: Optional[str] = None
    # Optional login URL so Live View opens on the right page
    start_url: Optional[str] = Field(
        None,
        description="URL to open in Live View (login page). e.g. https://site.com/login",
    )
    agent_metadata: Optional[dict[str, Any]] = None


class EscalationResolve(BaseModel):
    """Body for human or programmatic resolution of an escalation."""

    resolved_context_id: Optional[str] = Field(
        None,
        description=(
            "Browserbase context id after the human finished auth. "
            "If omitted, uses the context provisioned on the resolve page when available."
        ),
    )


class Escalation(BaseModel):
    id: str
    user_id: str
    site: str
    reason: str
    status: EscalationStatus = EscalationStatus.PENDING
    screenshot_url: Optional[str] = None
    current_context_id: Optional[str] = None
    resolved_context_id: Optional[str] = None
    bb_context_id: Optional[str] = None
    bb_session_id: Optional[str] = None
    live_view_url: Optional[str] = None
    created_at: datetime
    expires_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    agent_metadata: Optional[dict[str, Any]] = None

    model_config = {"from_attributes": True}
