#!/usr/bin/env python3
"""
Phase 1 end-to-end demo: create → (simulate human resolve) → poll.

Usage:
  # Terminal 1: start the API
  cd apps/api && source .venv/bin/activate
  uvicorn app.main:app --reload --port 8000

  # Terminal 2: run this script
  cd apps/api && source .venv/bin/activate
  python ../../examples/agent-integrations/escalation_loop.py

Env:
  GRYPHON_API_URL   default http://localhost:8000
  GRYPHON_API_KEY   default dev-api-key
"""

from __future__ import annotations

import os
import sys
import time

import httpx

BASE_URL = os.getenv("GRYPHON_API_URL", "http://localhost:8000").rstrip("/")
API_KEY = os.getenv("GRYPHON_API_KEY", "dev-api-key")
HEADERS = {"X-API-Key": API_KEY, "Content-Type": "application/json"}


def main() -> int:
    print("=== Gryphon Phase 1 escalation loop ===")
    print(f"API: {BASE_URL}")

    with httpx.Client(base_url=BASE_URL, headers=HEADERS, timeout=15.0) as client:
        # 0. Health
        health = client.get("/health")
        health.raise_for_status()
        print(f"[ok] health: {health.json()}")

        # 1. Agent hits auth wall → request human help
        create_payload = {
            "site": "linkedin",
            "reason": "Login wall with 2FA prompt during connection request flow",
            "screenshot_url": None,
            "current_context_id": "bb_ctx_stale_example",
            "agent_metadata": {"agent": "e2e-demo", "task": "connection-request"},
        }
        print("\n[1] POST /v1/escalations  (agent requests human auth)")
        created = client.post("/v1/escalations/", json=create_payload)
        if created.status_code >= 400:
            print(created.status_code, created.text)
            created.raise_for_status()
        esc = created.json()
        esc_id = esc["id"]
        print(f"    id={esc_id} status={esc['status']}")
        assert esc["status"] == "pending", esc

        # 2. Agent polls while waiting
        print("\n[2] GET /v1/escalations/{id}  (agent polls — still pending)")
        polled = client.get(f"/v1/escalations/{esc_id}")
        polled.raise_for_status()
        assert polled.json()["status"] == "pending"
        print(f"    status={polled.json()['status']}")

        # 3. Human resolves (in real life: Slack → login → this call)
        print("\n[3] POST /v1/escalations/{id}/resolve  (human finished auth)")
        resolve_payload = {"resolved_context_id": "bb_ctx_fresh_after_2fa"}
        resolved = client.post(f"/v1/escalations/{esc_id}/resolve", json=resolve_payload)
        resolved.raise_for_status()
        res_body = resolved.json()
        print(
            f"    status={res_body['status']} "
            f"resolved_context_id={res_body.get('resolved_context_id')}"
        )
        assert res_body["status"] == "resolved"
        assert res_body["resolved_context_id"] == "bb_ctx_fresh_after_2fa"

        # 4. Agent polls and continues with new session
        print("\n[4] GET /v1/escalations/{id}  (agent resumes with new context)")
        final = client.get(f"/v1/escalations/{esc_id}")
        final.raise_for_status()
        final_body = final.json()
        print(
            f"    status={final_body['status']} "
            f"resolved_context_id={final_body.get('resolved_context_id')}"
        )
        assert final_body["status"] == "resolved"
        assert final_body["resolved_context_id"] == "bb_ctx_fresh_after_2fa"

        # 5. Double-resolve should conflict
        print("\n[5] POST resolve again  (expect 409)")
        again = client.post(f"/v1/escalations/{esc_id}/resolve", json={})
        assert again.status_code == 409, again.text
        print(f"    status_code={again.status_code}")

    print("\n=== SUCCESS: create → notify → resolve → poll loop works ===")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except httpx.ConnectError:
        print(
            "Could not connect to API. Start it with:\n"
            "  cd apps/api && source .venv/bin/activate && "
            "uvicorn app.main:app --port 8000",
            file=sys.stderr,
        )
        raise SystemExit(1)
