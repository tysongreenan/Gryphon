"""
API models for get_session / site sessions.
"""

from __future__ import annotations

from enum import Enum
from typing import Literal, Optional, Union

from pydantic import BaseModel, Field


class GetSessionRequest(BaseModel):
    site: str = Field(..., description="Site key (e.g. 'linkedin', 'gmail')")
    # When true and a stored context exists, create a Browserbase session for the agent
    create_browser_session: bool = Field(
        True,
        description="If true, create a fresh Browserbase Session from the stored context",
    )
    # Used when needs_auth provisions Live View — open this URL for the human
    start_url: Optional[str] = Field(
        None,
        description="Login/start URL for human Live View (e.g. https://site.com/login)",
    )


class SessionStatus(str, Enum):
    READY = "ready"
    NEEDS_AUTH = "needs_auth"


class SessionReady(BaseModel):
    status: Literal["ready"] = "ready"
    site: str
    context_id: str
    session_id: Optional[str] = None
    connect_url: Optional[str] = None
    selenium_remote_url: Optional[str] = None
    signing_key: Optional[str] = None
    persist: bool = False
    message: str = "Authenticated session ready"


class SessionNeedsAuth(BaseModel):
    status: Literal["needs_auth"] = "needs_auth"
    site: str
    escalation_id: str
    # Short-lived signed link for the human to open Live View and log in
    resolve_url: Optional[str] = None
    message: str = (
        "No authenticated context for this site. "
        "Open resolve_url to log in, then poll get_session until ready."
    )


GetSessionResponse = Union[SessionReady, SessionNeedsAuth]
