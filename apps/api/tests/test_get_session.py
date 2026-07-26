"""
Phase 2: get_session happy path + needs_auth + isolation.
"""

from __future__ import annotations

from httpx import AsyncClient

from app.services.resolve_tokens import create_resolve_token


async def test_get_session_needs_auth_then_ready(
    client: AsyncClient, auth_headers: dict
):
    # First call: no context → needs_auth + escalation
    first = await client.post(
        "/v1/sessions/get",
        headers=auth_headers,
        json={"site": "LinkedIn"},
    )
    assert first.status_code == 200, first.text
    body = first.json()
    assert body["status"] == "needs_auth"
    assert body["site"] == "linkedin"
    esc_id = body["escalation_id"]
    assert esc_id

    # Re-call reuses same pending escalation
    again = await client.post(
        "/v1/sessions/get",
        headers=auth_headers,
        json={"site": "linkedin"},
    )
    assert again.status_code == 200
    assert again.json()["escalation_id"] == esc_id

    # Human open resolve page → provisions fake BB context + live view
    token = create_resolve_token(esc_id)
    page = await client.get(
        f"/v1/escalations/{esc_id}/human-resolve",
        params={"token": token},
    )
    assert page.status_code == 200
    assert "Mark resolved" in page.text
    assert "Live View" in page.text or "live" in page.text.lower()

    # Confirm resolve (uses provisioned bb_context_id)
    submit = await client.post(
        f"/v1/escalations/{esc_id}/human-resolve",
        data={"token": token},
    )
    assert submit.status_code == 200
    assert "resolved" in submit.text.lower()

    # Escalation has resolved_context_id
    esc = await client.get(f"/v1/escalations/{esc_id}", headers=auth_headers)
    assert esc.status_code == 200
    assert esc.json()["status"] == "resolved"
    assert esc.json()["resolved_context_id"]
    assert esc.json()["bb_context_id"]

    # get_session now ready with connect_url from fake BB
    ready = await client.post(
        "/v1/sessions/get",
        headers=auth_headers,
        json={"site": "linkedin"},
    )
    assert ready.status_code == 200, ready.text
    r = ready.json()
    assert r["status"] == "ready"
    assert r["site"] == "linkedin"
    assert r["context_id"] == esc.json()["resolved_context_id"]
    assert r["session_id"]
    assert r["connect_url"]
    assert r["persist"] is False


async def test_get_session_programmatic_resolve_stores_context(
    client: AsyncClient, auth_headers: dict
):
    first = await client.post(
        "/v1/sessions/get",
        headers=auth_headers,
        json={"site": "gmail"},
    )
    esc_id = first.json()["escalation_id"]

    resolved = await client.post(
        f"/v1/escalations/{esc_id}/resolve",
        headers=auth_headers,
        json={"resolved_context_id": "ctx_manual_gmail"},
    )
    assert resolved.status_code == 200
    assert resolved.json()["resolved_context_id"] == "ctx_manual_gmail"

    ready = await client.post(
        "/v1/sessions/get",
        headers=auth_headers,
        json={"site": "gmail"},
    )
    assert ready.json()["status"] == "ready"
    assert ready.json()["context_id"] == "ctx_manual_gmail"


async def test_get_session_isolation(client: AsyncClient, auth_headers: dict):
    from app.config import get_settings
    from app.db import session as db_session
    from app.services.api_keys import create_user_with_api_key

    # User A resolves linkedin
    a = await client.post(
        "/v1/sessions/get",
        headers=auth_headers,
        json={"site": "linkedin"},
    )
    esc_a = a.json()["escalation_id"]
    await client.post(
        f"/v1/escalations/{esc_a}/resolve",
        headers=auth_headers,
        json={"resolved_context_id": "ctx_a_only"},
    )

    async with db_session.async_session_factory() as session:
        _u, _k, raw_b = await create_user_with_api_key(
            session,
            email="bob-session@example.com",
            name="Bob",
            settings=get_settings(),
        )
        await session.commit()

    bob = {"X-API-Key": raw_b}
    b = await client.post(
        "/v1/sessions/get",
        headers=bob,
        json={"site": "linkedin"},
    )
    assert b.json()["status"] == "needs_auth"
    assert b.json()["escalation_id"] != esc_a


async def test_get_session_requires_api_key(client: AsyncClient):
    resp = await client.post("/v1/sessions/get", json={"site": "x"})
    assert resp.status_code == 401


async def test_stale_context_falls_back_to_needs_auth(
    client: AsyncClient, auth_headers: dict
):
    """
    Stored (user, site) context that fails Browserbase session create must not
    return status=ready. Mark site session stale and escalate for re-auth.
    """
    from app.db import session as db_session
    from app.db.models import SiteSession
    from app.services.browserbase import (
        FakeBrowserbaseClient,
        set_browserbase_client_override,
    )
    from sqlalchemy import select

    # Seed a durable site session as if a prior human resolve succeeded
    stale_context_id = "ctx_stale_dead_context"
    site = "linkedin"
    async with db_session.async_session_factory() as session:
        from app.config import get_settings

        settings = get_settings()
        session.add(
            SiteSession(
                id="ss_stale_test",
                user_id=settings.default_user_id,
                site=site,
                browserbase_context_id=stale_context_id,
                status="active",
            )
        )
        await session.commit()

    # Fake BB rejects create_session for this context (expired/deleted)
    fake = FakeBrowserbaseClient()
    fake.fail_create_session_for.add(stale_context_id)
    set_browserbase_client_override(fake)

    resp = await client.post(
        "/v1/sessions/get",
        headers=auth_headers,
        json={"site": site},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["status"] == "needs_auth"
    assert body["site"] == site
    assert body["escalation_id"]
    assert "no longer valid" in body["message"].lower() or "re-auth" in body[
        "message"
    ].lower()

    # Bad context must not remain active (would fail again immediately)
    async with db_session.async_session_factory() as session:
        result = await session.execute(
            select(SiteSession).where(SiteSession.id == "ss_stale_test")
        )
        record = result.scalar_one()
        assert record.status == "stale"
        assert record.browserbase_context_id == stale_context_id

    # Second get_session reuses the same pending escalation (no new one)
    again = await client.post(
        "/v1/sessions/get",
        headers=auth_headers,
        json={"site": site},
    )
    assert again.status_code == 200
    assert again.json()["status"] == "needs_auth"
    assert again.json()["escalation_id"] == body["escalation_id"]

    # Escalation reason should mention stale / unusable context
    esc = await client.get(
        f"/v1/escalations/{body['escalation_id']}", headers=auth_headers
    )
    assert esc.status_code == 200
    esc_body = esc.json()
    assert esc_body["status"] == "pending"
    assert "no longer usable" in esc_body["reason"].lower() or "re-auth" in esc_body[
        "reason"
    ].lower()
    assert esc_body["current_context_id"] == stale_context_id


async def test_stale_context_reuses_existing_pending_escalation(
    client: AsyncClient, auth_headers: dict
):
    """If a pending escalation already exists for user+site, stale fallback reuses it."""
    from app.config import get_settings
    from app.db import session as db_session
    from app.db.models import SiteSession
    from app.services.browserbase import (
        FakeBrowserbaseClient,
        set_browserbase_client_override,
    )

    site = "gmail"

    # Open a pending escalation first (no stored context yet)
    first = await client.post(
        "/v1/sessions/get",
        headers=auth_headers,
        json={"site": site},
    )
    pending_id = first.json()["escalation_id"]

    # Simulate a race-ish state: active site session exists while escalation
    # is still pending (e.g. partial resolve / concurrent agent calls)
    stale_ctx = "ctx_stale_while_pending"
    async with db_session.async_session_factory() as session:
        settings = get_settings()
        session.add(
            SiteSession(
                id="ss_stale_pending",
                user_id=settings.default_user_id,
                site=site,
                browserbase_context_id=stale_ctx,
                status="active",
            )
        )
        await session.commit()

    fake = FakeBrowserbaseClient()
    fake.fail_create_session_for.add(stale_ctx)
    set_browserbase_client_override(fake)

    resp = await client.post(
        "/v1/sessions/get",
        headers=auth_headers,
        json={"site": site},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "needs_auth"
    assert body["escalation_id"] == pending_id


async def test_live_view_provision_failure_shows_graceful_page(
    client: AsyncClient, auth_headers: dict
):
    """Human resolve page remains usable when Live View cannot be provisioned."""
    from app.services.browserbase import (
        FakeBrowserbaseClient,
        set_browserbase_client_override,
    )
    from app.services.resolve_tokens import create_resolve_token

    fake = FakeBrowserbaseClient()
    fake.fail_live_view = True
    set_browserbase_client_override(fake)

    first = await client.post(
        "/v1/sessions/get",
        headers=auth_headers,
        json={"site": "notion"},
    )
    esc_id = first.json()["escalation_id"]
    token = create_resolve_token(esc_id)

    page = await client.get(
        f"/v1/escalations/{esc_id}/human-resolve",
        params={"token": token},
    )
    assert page.status_code == 200
    text = page.text
    assert "Mark resolved" in text
    # Clear failure message, not a hard error page
    assert "Live View could not" in text or "could not be provisioned" in text.lower()
    # Manual context id fallback present
    assert "resolved_context_id" in text or "context id" in text.lower()
