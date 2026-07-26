"""
SQLAlchemy ORM models.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class User(Base):
    """Application user that owns escalations and API keys."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    email: Mapped[Optional[str]] = mapped_column(String(320), unique=True, nullable=True)
    name: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    # Optional per-user Slack destination (channel id or user id)
    slack_channel: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class ApiKey(Base):
    """
    API key belonging to a user.

    Only a hash is stored. The raw key is shown once at creation.
    """

    __tablename__ = "api_keys"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), index=True, nullable=False
    )
    # First 8 chars of the raw key for log-friendly identification (not secret alone)
    key_prefix: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    key_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False, default="default")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class SiteSession(Base):
    """
    Durable authenticated Browserbase Context for a (user, site) pair.

    Agents call get_session(site); Gryphon spawns a short-lived Session from this context.
    """

    __tablename__ = "site_sessions"
    __table_args__ = (
        UniqueConstraint("user_id", "site", name="uq_site_sessions_user_site"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    site: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    browserbase_context_id: Mapped[str] = mapped_column(String(256), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="active", index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    last_used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class EscalationRecord(Base):
    __tablename__ = "escalations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    site: Mapped[str] = mapped_column(String(128), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="pending", index=True)
    screenshot_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    current_context_id: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    resolved_context_id: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    # Browserbase resources provisioned for the human login flow
    bb_context_id: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    bb_session_id: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    live_view_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # JSON stored as text for SQLite simplicity in MVP
    agent_metadata_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
