"""Public waitlist endpoint tests."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_join_waitlist_creates_signup(client: AsyncClient):
    res = await client.post(
        "/v1/waitlist/",
        json={
            "email": "Builder@Example.com",
            "use_case": "LinkedIn outreach agents",
            "source": "landing",
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["ok"] is True
    assert body["email"] == "builder@example.com"
    assert body["created"] is True
    assert "created_at" in body


@pytest.mark.asyncio
async def test_join_waitlist_is_idempotent(client: AsyncClient):
    first = await client.post(
        "/v1/waitlist/",
        json={"email": "same@example.com", "source": "landing"},
    )
    second = await client.post(
        "/v1/waitlist/",
        json={"email": "same@example.com", "use_case": "later note"},
    )
    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["created"] is True
    assert second.json()["created"] is False
    assert second.json()["email"] == "same@example.com"


@pytest.mark.asyncio
async def test_join_waitlist_rejects_bad_email(client: AsyncClient):
    res = await client.post(
        "/v1/waitlist/",
        json={"email": "not-an-email"},
    )
    assert res.status_code == 422
    detail = res.json()["detail"]
    assert detail["code"] == "validation_error"


@pytest.mark.asyncio
async def test_join_waitlist_no_api_key_required(client: AsyncClient):
    """Confirm the route is public (no X-API-Key)."""
    res = await client.post(
        "/v1/waitlist/",
        json={"email": "public@example.com"},
    )
    assert res.status_code == 200
    assert res.json()["created"] is True


@pytest.mark.asyncio
async def test_list_waitlist_requires_api_key(client: AsyncClient):
    res = await client.get("/v1/waitlist/")
    assert res.status_code == 401
    assert res.json()["detail"]["code"] == "missing_api_key"


@pytest.mark.asyncio
async def test_list_waitlist_rejects_bad_key(client: AsyncClient):
    res = await client.get(
        "/v1/waitlist/",
        headers={"X-API-Key": "definitely-wrong"},
    )
    assert res.status_code == 401
    assert res.json()["detail"]["code"] == "invalid_api_key"


@pytest.mark.asyncio
async def test_list_waitlist_returns_signups(
    client: AsyncClient,
    auth_headers: dict[str, str],
):
    await client.post(
        "/v1/waitlist/",
        json={"email": "first@example.com", "use_case": "outreach", "source": "landing"},
    )
    await client.post(
        "/v1/waitlist/",
        json={"email": "second@example.com", "source": "closing"},
    )

    res = await client.get("/v1/waitlist/", headers=auth_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["ok"] is True
    assert body["total"] == 2
    assert body["count"] == 2
    emails = [item["email"] for item in body["items"]]
    # Newest first
    assert emails[0] == "second@example.com"
    assert emails[1] == "first@example.com"
    assert body["items"][1]["use_case"] == "outreach"


@pytest.mark.asyncio
async def test_list_waitlist_pagination(
    client: AsyncClient,
    auth_headers: dict[str, str],
):
    for i in range(3):
        await client.post(
            "/v1/waitlist/",
            json={"email": f"user{i}@example.com"},
        )

    page = await client.get(
        "/v1/waitlist/",
        params={"limit": 2, "offset": 1},
        headers=auth_headers,
    )
    assert page.status_code == 200
    body = page.json()
    assert body["total"] == 3
    assert body["count"] == 2
    assert body["limit"] == 2
    assert body["offset"] == 1


@pytest.mark.asyncio
async def test_waitlist_admin_page_is_public_shell(client: AsyncClient):
    res = await client.get("/v1/waitlist/admin")
    assert res.status_code == 200
    assert "text/html" in res.headers["content-type"]
    assert "Waitlist" in res.text
    assert "X-API-Key" in res.text
