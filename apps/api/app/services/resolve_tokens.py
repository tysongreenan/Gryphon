"""
Short-lived signed tokens for human resolve links (Slack buttons).

Token format: ``{expires_unix}.{hex_hmac}``
Signed payload: ``{escalation_id}:{expires_unix}``
"""

from __future__ import annotations

import hashlib
import hmac
import time
from typing import Optional

from app.config import get_settings


def create_resolve_token(
    escalation_id: str,
    *,
    ttl_seconds: Optional[int] = None,
    secret_key: Optional[str] = None,
) -> str:
    settings = get_settings()
    ttl = ttl_seconds if ttl_seconds is not None else settings.resolve_token_ttl_seconds
    secret = secret_key if secret_key is not None else settings.secret_key
    expires = int(time.time()) + int(ttl)
    signature = _sign(escalation_id, expires, secret)
    return f"{expires}.{signature}"


def verify_resolve_token(
    escalation_id: str,
    token: str,
    *,
    secret_key: Optional[str] = None,
) -> bool:
    """Return True if token is valid and not expired for this escalation."""
    if not token or "." not in token:
        return False

    settings = get_settings()
    secret = secret_key if secret_key is not None else settings.secret_key

    try:
        exp_str, signature = token.split(".", 1)
        expires = int(exp_str)
    except (ValueError, TypeError):
        return False

    if expires < int(time.time()):
        return False

    expected = _sign(escalation_id, expires, secret)
    return hmac.compare_digest(expected, signature)


def _sign(escalation_id: str, expires: int, secret: str) -> str:
    payload = f"{escalation_id}:{expires}".encode("utf-8")
    return hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
