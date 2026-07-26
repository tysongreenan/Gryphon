#!/usr/bin/env python3
"""
Gryphon MCP Server

Agent-facing tools:
  - get_session
  - request_human_auth
  - get_escalation_status

Talks to the Gryphon REST API over HTTP.
"""

from __future__ import annotations

import os
from typing import Any, Optional

import httpx
from mcp.server.fastmcp import FastMCP

API_URL = os.getenv("GRYPHON_API_URL", "http://localhost:8000").rstrip("/")
API_KEY = os.getenv("GRYPHON_API_KEY", "dev-api-key")

mcp = FastMCP(
    "gryphon",
    instructions=(
        "Gryphon provides authenticated session reliability for AI agents. "
        "Prefer get_session(site) at the start of a task. "
        "If status is needs_auth, pause and poll get_session or get_escalation_status "
        "until ready, then use connect_url / context_id. "
        "Use request_human_auth if you hit a login wall mid-task with an existing session."
    ),
)


def _client() -> httpx.Client:
    return httpx.Client(
        base_url=API_URL,
        headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
        timeout=30.0,
    )


@mcp.tool()
def get_session(site: str, create_browser_session: bool = True) -> dict[str, Any]:
    """
    Get an authenticated browser session for a site.

    Call this before acting on a site that needs login. Returns either:
    - status=ready with context_id and optional connect_url (Browserbase)
    - status=needs_auth with escalation_id (human notified — poll until ready)

    Args:
        site: Site key (e.g. 'linkedin', 'gmail').
        create_browser_session: If true, create a short-lived Browserbase Session
            from the stored context (persist=false).
    """
    payload = {"site": site, "create_browser_session": create_browser_session}
    with _client() as client:
        resp = client.post("/v1/sessions/get", json=payload)
        resp.raise_for_status()
        data = resp.json()

    if data.get("status") == "ready":
        return {
            "status": "ready",
            "site": data["site"],
            "context_id": data.get("context_id"),
            "session_id": data.get("session_id"),
            "connect_url": data.get("connect_url"),
            "selenium_remote_url": data.get("selenium_remote_url"),
            "signing_key": data.get("signing_key"),
            "persist": data.get("persist", False),
            "message": data.get("message", "Authenticated session ready"),
        }

    return {
        "status": "needs_auth",
        "site": data.get("site", site),
        "escalation_id": data.get("escalation_id"),
        "message": data.get(
            "message",
            "Human auth required. Poll get_session or get_escalation_status until ready.",
        ),
    }


@mcp.tool()
def request_human_auth(
    site: str,
    reason: str,
    screenshot_url: Optional[str] = None,
    current_context_id: Optional[str] = None,
) -> dict[str, Any]:
    """
    Request human help with authentication for a site.

    Prefer get_session for the normal path. Use this when you hit a login wall
    mid-task and need an explicit escalation.

    Args:
        site: Site that needs auth (e.g. 'linkedin', 'gmail').
        reason: Short description of what blocked you.
        screenshot_url: Optional URL of a screenshot of the auth wall.
        current_context_id: Optional Browserbase context id currently in use.
    """
    payload = {
        "site": site,
        "reason": reason,
        "screenshot_url": screenshot_url,
        "current_context_id": current_context_id,
        "agent_metadata": {"source": "mcp"},
    }
    with _client() as client:
        resp = client.post("/v1/escalations/", json=payload)
        resp.raise_for_status()
        data = resp.json()
    return {
        "escalation_id": data["id"],
        "status": data["status"],
        "site": data["site"],
        "message": (
            "Escalation created. Pause and poll get_escalation_status or get_session "
            "until status is resolved/ready, then continue with context_id / connect_url."
        ),
    }


@mcp.tool()
def get_escalation_status(escalation_id: str) -> dict[str, Any]:
    """
    Check the status of a human auth escalation.

    Poll this after needs_auth / request_human_auth. When status is 'resolved',
    call get_session(site) again for a live agent session.

    Args:
        escalation_id: Id returned by get_session or request_human_auth.
    """
    with _client() as client:
        resp = client.get(f"/v1/escalations/{escalation_id}")
        resp.raise_for_status()
        data = resp.json()
    return {
        "escalation_id": data["id"],
        "status": data["status"],
        "site": data["site"],
        "resolved_context_id": data.get("resolved_context_id"),
        "resolved_at": data.get("resolved_at"),
        "reason": data.get("reason"),
        "live_view_url": data.get("live_view_url"),
    }


def main() -> None:
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
