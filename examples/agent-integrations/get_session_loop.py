#!/usr/bin/env python3
"""
Phase 2 end-to-end demo: get_session → needs_auth → resolve → get_session ready.

Usage:
  # Terminal 1: start the API (with BROWSERBASE_USE_FAKE=true for local without BB keys)
  cd apps/api && source .venv/bin/activate
  export BROWSERBASE_USE_FAKE=true
  uvicorn app.main:app --reload --port 8000

  # Terminal 2:
  cd apps/api && source .venv/bin/activate
  python ../../examples/agent-integrations/get_session_loop.py

Env:
  GRYPHON_API_URL   default http://localhost:8000
  GRYPHON_API_KEY   default dev-api-key
"""

from __future__ import annotations

import os
import sys

import httpx

BASE_URL = os.getenv("GRYPHON_API_URL", "http://localhost:8000").rstrip("/")
API_KEY = os.getenv("GRYPHON_API_KEY", "dev-api-key")
HEADERS = {"X-API-Key": API_KEY, "Content-Type": "application/json"}
SITE = os.getenv("GRYPHON_DEMO_SITE", "linkedin")


def main() -> int:
    print("=== Gryphon Phase 2 get_session loop ===")
    print(f"API: {BASE_URL}  site={SITE}")

    with httpx.Client(base_url=BASE_URL, headers=HEADERS, timeout=30.0) as client:
        health = client.get("/health")
        health.raise_for_status()
        print(f"[ok] health: {health.json()}")

        print(f"\n[1] POST /v1/sessions/get  site={SITE}")
        r1 = client.post("/v1/sessions/get", json={"site": SITE})
        r1.raise_for_status()
        body1 = r1.json()
        print(f"    status={body1['status']}")

        if body1["status"] == "ready":
            print(
                f"    already ready context_id={body1.get('context_id')} "
                f"session_id={body1.get('session_id')}"
            )
            print("\n=== SUCCESS: context already stored for this site ===")
            return 0

        assert body1["status"] == "needs_auth", body1
        esc_id = body1["escalation_id"]
        print(f"    escalation_id={esc_id}")

        # Simulate human resolve with a durable context id
        # (In production: Slack → Live View → login → Mark resolved)
        print(f"\n[2] POST /v1/escalations/{esc_id}/resolve  (simulate human)")
        resolve = client.post(
            f"/v1/escalations/{esc_id}/resolve",
            json={"resolved_context_id": f"ctx_demo_{SITE}"},
        )
        resolve.raise_for_status()
        print(
            f"    status={resolve.json()['status']} "
            f"resolved_context_id={resolve.json().get('resolved_context_id')}"
        )

        print(f"\n[3] POST /v1/sessions/get  site={SITE}  (should be ready)")
        r2 = client.post("/v1/sessions/get", json={"site": SITE})
        r2.raise_for_status()
        body2 = r2.json()
        print(
            f"    status={body2['status']} context_id={body2.get('context_id')} "
            f"session_id={body2.get('session_id')}"
        )
        assert body2["status"] == "ready", body2
        assert body2["context_id"] == f"ctx_demo_{SITE}"
        # With fake or real BB, session details may be present
        print(f"    connect_url={body2.get('connect_url')}")

        print("\n=== SUCCESS: needs_auth → resolve → ready get_session ===")
        return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except httpx.ConnectError:
        print(
            "Could not connect to API. Start it with:\n"
            "  cd apps/api && source .venv/bin/activate && "
            "BROWSERBASE_USE_FAKE=true uvicorn app.main:app --port 8000",
            file=sys.stderr,
        )
        raise SystemExit(1)
