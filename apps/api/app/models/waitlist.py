"""
Waitlist API models — public marketing signups.
"""

from __future__ import annotations

import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class WaitlistCreate(BaseModel):
    email: str = Field(..., max_length=254, description="Signup email")
    use_case: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional agent / product use case",
    )
    source: Optional[str] = Field(
        None,
        max_length=80,
        description="Landing surface or campaign (e.g. landing, concepts-b)",
    )

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        email = value.strip().lower()
        if not email or len(email) > 254 or not _EMAIL_RE.match(email):
            raise ValueError("A valid email address is required")
        return email


class WaitlistResult(BaseModel):
    ok: bool = True
    email: str
    created: bool = Field(
        ...,
        description="True if this email was newly stored; False if already on the list",
    )
    created_at: datetime
