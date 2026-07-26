"""Unit tests for signed resolve tokens."""

from __future__ import annotations

from app.services.resolve_tokens import create_resolve_token, verify_resolve_token


def test_token_roundtrip():
    esc_id = "abc-123"
    token = create_resolve_token(esc_id, ttl_seconds=60, secret_key="s")
    assert verify_resolve_token(esc_id, token, secret_key="s")


def test_token_wrong_escalation():
    token = create_resolve_token("a", ttl_seconds=60, secret_key="s")
    assert not verify_resolve_token("b", token, secret_key="s")


def test_token_wrong_secret():
    token = create_resolve_token("a", ttl_seconds=60, secret_key="s1")
    assert not verify_resolve_token("a", token, secret_key="s2")


def test_token_expired():
    token = create_resolve_token("a", ttl_seconds=-10, secret_key="s")
    assert not verify_resolve_token("a", token, secret_key="s")


def test_token_malformed():
    assert not verify_resolve_token("a", "", secret_key="s")
    assert not verify_resolve_token("a", "noperiod", secret_key="s")
    assert not verify_resolve_token("a", "x.sig", secret_key="s")
