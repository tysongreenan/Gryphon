"""
Async SQLAlchemy engine and session helpers.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import get_settings
from app.db.base import Base

engine: AsyncEngine
async_session_factory: async_sessionmaker[AsyncSession]


def configure_engine(database_url: str | None = None) -> None:
    """(Re)create the global engine and session factory. Used by app startup and tests."""
    global engine, async_session_factory
    settings = get_settings()
    url = database_url or settings.database_url
    engine = create_async_engine(url, echo=False)
    async_session_factory = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )


configure_engine()


async def init_db() -> None:
    """Create tables if they do not exist and apply lightweight SQLite patches."""
    # Import models so metadata is populated
    from app.db import models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(_sqlite_add_missing_columns)


def _sqlite_add_missing_columns(sync_conn) -> None:
    """
    SQLite create_all does not ALTER existing tables.
    Add known new columns when upgrading an older local gryphon.db.
    """
    if engine.dialect.name != "sqlite":
        return

    def column_names(table: str) -> set[str]:
        rows = sync_conn.exec_driver_sql(f"PRAGMA table_info({table})").fetchall()
        return {row[1] for row in rows}

    tables = sync_conn.exec_driver_sql(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()
    table_names = {row[0] for row in tables}

    if "escalations" in table_names:
        cols = column_names("escalations")
        patches = {
            "expires_at": "ALTER TABLE escalations ADD COLUMN expires_at DATETIME",
            "bb_context_id": "ALTER TABLE escalations ADD COLUMN bb_context_id VARCHAR(256)",
            "bb_session_id": "ALTER TABLE escalations ADD COLUMN bb_session_id VARCHAR(256)",
            "live_view_url": "ALTER TABLE escalations ADD COLUMN live_view_url TEXT",
        }
        for col, sql in patches.items():
            if col not in cols:
                sync_conn.exec_driver_sql(sql)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
