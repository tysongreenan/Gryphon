"""
Gryphon API — Main entrypoint

This is a skeleton. Implement the real application following docs/PRD.md and docs/ARCHITECTURE.md.
"""

from fastapi import FastAPI

app = FastAPI(
    title="Gryphon",
    description="Reliable authenticated sessions + human-in-the-loop recovery for AI agents",
    version="0.1.0",
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "gryphon-api"}


# TODO: Include routers for sessions and escalations
# from app.routers import sessions, escalations
# app.include_router(sessions.router, prefix="/v1/sessions", tags=["sessions"])
# app.include_router(escalations.router, prefix="/v1/escalations", tags=["escalations"])
