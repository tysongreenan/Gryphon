"""
Core escalation loop tests + auth / multi-user edge cases.
"""

from __future__ import annotations

from httpx import AsyncClient

from app.config import get_settings
from app.db import session as db_session
from app.services.api_keys import create_user_with_api_key
from app.services.resolve_tokens import create_resolve_token


async def test_health(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["service"] == "gryphon-api"


async def test_missing_api_key_401(client: AsyncClient):
    resp = await client.post(
        "/v1/escalations/",
        json={"site": "linkedin", "reason": "login wall"},
    )
    assert resp.status_code == 401
    detail = resp.json()["detail"]
    assert detail["code"] == "missing_api_key"


async def test_bad_api_key_401(client: AsyncClient):
    resp = await client.post(
        "/v1/escalations/",
        headers={"X-API-Key": "totally-wrong"},
        json={"site": "linkedin", "reason": "login wall"},
    )
    assert resp.status_code == 401
    detail = resp.json()["detail"]
    assert detail["code"] == "invalid_api_key"


async def test_create_resolve_poll_happy_path(client: AsyncClient, auth_headers: dict):
    create = await client.post(
        "/v1/escalations/",
        headers=auth_headers,
        json={
            "site": "linkedin",
            "reason": "2FA prompt",
            "current_context_id": "bb_ctx_old",
            "agent_metadata": {"agent": "test"},
        },
    )
    assert create.status_code == 201, create.text
    esc = create.json()
    esc_id = esc["id"]
    assert esc["status"] == "pending"
    assert esc["user_id"] == "user_test"
    assert esc["expires_at"] is not None

    polled = await client.get(f"/v1/escalations/{esc_id}", headers=auth_headers)
    assert polled.status_code == 200
    assert polled.json()["status"] == "pending"

    resolved = await client.post(
        f"/v1/escalations/{esc_id}/resolve",
        headers=auth_headers,
        json={"resolved_context_id": "bb_ctx_fresh"},
    )
    assert resolved.status_code == 200
    body = resolved.json()
    assert body["status"] == "resolved"
    assert body["resolved_context_id"] == "bb_ctx_fresh"
    assert body["resolved_at"] is not None

    final = await client.get(f"/v1/escalations/{esc_id}", headers=auth_headers)
    assert final.status_code == 200
    assert final.json()["status"] == "resolved"
    assert final.json()["resolved_context_id"] == "bb_ctx_fresh"


async def test_double_resolve_409(client: AsyncClient, auth_headers: dict):
    create = await client.post(
        "/v1/escalations/",
        headers=auth_headers,
        json={"site": "gmail", "reason": "captcha"},
    )
    esc_id = create.json()["id"]

    first = await client.post(
        f"/v1/escalations/{esc_id}/resolve",
        headers=auth_headers,
        json={},
    )
    assert first.status_code == 200

    second = await client.post(
        f"/v1/escalations/{esc_id}/resolve",
        headers=auth_headers,
        json={},
    )
    assert second.status_code == 409
    assert second.json()["detail"]["code"] == "escalation_not_pending"


async def test_not_found_404(client: AsyncClient, auth_headers: dict):
    missing = "00000000-0000-0000-0000-000000000000"
    get_resp = await client.get(f"/v1/escalations/{missing}", headers=auth_headers)
    assert get_resp.status_code == 404
    assert get_resp.json()["detail"]["code"] == "escalation_not_found"

    resolve_resp = await client.post(
        f"/v1/escalations/{missing}/resolve",
        headers=auth_headers,
        json={},
    )
    assert resolve_resp.status_code == 404


async def test_multi_user_isolation(client: AsyncClient, auth_headers: dict):
    """User B cannot see or resolve User A's escalations."""
    create = await client.post(
        "/v1/escalations/",
        headers=auth_headers,
        json={"site": "linkedin", "reason": "owned by A"},
    )
    assert create.status_code == 201
    esc_id = create.json()["id"]
    owner_id = create.json()["user_id"]

    async with db_session.async_session_factory() as session:
        _user, _key, raw_b = await create_user_with_api_key(
            session,
            email="bob@example.com",
            name="Bob",
            key_name="bob-key",
            settings=get_settings(),
        )
        await session.commit()

    bob_headers = {"X-API-Key": raw_b}

    # Bob creates their own escalation
    bob_create = await client.post(
        "/v1/escalations/",
        headers=bob_headers,
        json={"site": "github", "reason": "owned by B"},
    )
    assert bob_create.status_code == 201
    assert bob_create.json()["user_id"] != owner_id

    # Bob cannot read A's escalation
    leak = await client.get(f"/v1/escalations/{esc_id}", headers=bob_headers)
    assert leak.status_code == 404

    # Bob cannot resolve A's escalation
    steal = await client.post(
        f"/v1/escalations/{esc_id}/resolve",
        headers=bob_headers,
        json={"resolved_context_id": "stolen"},
    )
    assert steal.status_code == 404

    # Owner can still resolve
    ok = await client.post(
        f"/v1/escalations/{esc_id}/resolve",
        headers=auth_headers,
        json={"resolved_context_id": "legit"},
    )
    assert ok.status_code == 200
    assert ok.json()["resolved_context_id"] == "legit"


async def test_human_resolve_signed_link(client: AsyncClient, auth_headers: dict):
    create = await client.post(
        "/v1/escalations/",
        headers=auth_headers,
        json={"site": "linkedin", "reason": "human path"},
    )
    esc_id = create.json()["id"]
    token = create_resolve_token(esc_id)

    page = await client.get(
        f"/v1/escalations/{esc_id}/human-resolve",
        params={"token": token},
    )
    assert page.status_code == 200
    assert "Mark resolved" in page.text
    assert "linkedin" in page.text

    # Bad token
    bad = await client.get(
        f"/v1/escalations/{esc_id}/human-resolve",
        params={"token": "0.deadbeef"},
    )
    assert bad.status_code == 401

    # Submit form
    submit = await client.post(
        f"/v1/escalations/{esc_id}/human-resolve",
        data={
            "token": token,
            "resolved_context_id": "bb_from_human",
        },
    )
    assert submit.status_code == 200
    assert "resolved" in submit.text.lower()

    polled = await client.get(f"/v1/escalations/{esc_id}", headers=auth_headers)
    assert polled.json()["status"] == "resolved"
    assert polled.json()["resolved_context_id"] == "bb_from_human"


async def test_human_resolve_double_submit_conflict(
    client: AsyncClient, auth_headers: dict
):
    create = await client.post(
        "/v1/escalations/",
        headers=auth_headers,
        json={"site": "x", "reason": "double"},
    )
    esc_id = create.json()["id"]
    token = create_resolve_token(esc_id)

    first = await client.post(
        f"/v1/escalations/{esc_id}/human-resolve",
        data={"token": token},
    )
    assert first.status_code == 200

    second = await client.post(
        f"/v1/escalations/{esc_id}/human-resolve",
        data={"token": token},
    )
    assert second.status_code == 409
