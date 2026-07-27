"""
Gryphon API — Main entrypoint

Reliable authenticated sessions + human-in-the-loop recovery for AI agents.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import get_settings
from app.db.session import async_session_factory, init_db
from app.routers import escalations, sessions, waitlist
from app.services.api_keys import seed_bootstrap_credentials

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("gryphon")

APP_VERSION = "0.2.0"


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    # Never log secret_key or raw API keys
    bb_mode = (
        "live"
        if settings.browserbase_api_key
        else ("fake" if settings.browserbase_use_fake else "off")
    )
    logger.info(
        "api.starting env=%s db_dialect=%s public_base_url=%s browserbase=%s",
        settings.environment,
        settings.database_url.split(":")[0],
        settings.public_base_url,
        bb_mode,
    )
    await init_db()
    async with async_session_factory() as session:
        await seed_bootstrap_credentials(session, settings)
        await session.commit()
    logger.info("api.ready")
    yield


app = FastAPI(
    title="Gryphon",
    description="Reliable authenticated sessions + human-in-the-loop recovery for AI agents",
    version=APP_VERSION,
    lifespan=lifespan,
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Normalize HTTP errors to { detail: { code, message } } when possible."""
    detail = exc.detail
    if isinstance(detail, dict) and "code" in detail and "message" in detail:
        body = {"detail": detail}
    elif isinstance(detail, str):
        body = {"detail": {"code": "http_error", "message": detail}}
    else:
        body = {"detail": detail}
    return JSONResponse(
        status_code=exc.status_code,
        content=body,
        headers=getattr(exc, "headers", None),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Pydantic may put raw Exception instances in error ctx — make JSON-safe
    errors = []
    for err in exc.errors():
        safe = dict(err)
        ctx = safe.get("ctx")
        if isinstance(ctx, dict):
            safe["ctx"] = {
                k: (str(v) if isinstance(v, BaseException) else v) for k, v in ctx.items()
            }
        errors.append(safe)
    return JSONResponse(
        status_code=422,
        content={
            "detail": {
                "code": "validation_error",
                "message": "Request validation failed",
                "errors": errors,
            }
        },
    )


@app.get("/health")
async def health():
    return {"status": "ok", "service": "gryphon-api", "version": APP_VERSION}


app.include_router(escalations.router, prefix="/v1/escalations", tags=["escalations"])
app.include_router(sessions.router, prefix="/v1/sessions", tags=["sessions"])
app.include_router(waitlist.router, prefix="/v1/waitlist", tags=["waitlist"])
