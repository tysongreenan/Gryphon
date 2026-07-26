"""
Slack notification adapter.

If SLACK_BOT_TOKEN / channel are not configured, logs the notification so local
development and the E2E script still work without real Slack credentials.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Optional

import httpx

from app.config import get_settings

logger = logging.getLogger("gryphon.slack")


async def send_escalation_notification(
    channel: str,
    escalation_id: str,
    site: str,
    reason: str,
    screenshot_url: Optional[str] = None,
    resolve_url: Optional[str] = None,
    expires_at: Optional[datetime] = None,
) -> bool:
    """
    Send a rich Slack message notifying the human that an agent needs auth help.

    Returns True if Slack accepted the message, False if we only logged it.
    """
    settings = get_settings()
    token = settings.slack_bot_token

    blocks = _build_blocks(
        escalation_id=escalation_id,
        site=site,
        reason=reason,
        screenshot_url=screenshot_url,
        resolve_url=resolve_url,
        expires_at=expires_at,
    )
    fallback_text = f"Gryphon: agent needs auth help for {site} — {reason}"

    if not token or not channel:
        logger.warning(
            "slack.skipped escalation_id=%s site=%s has_resolve_link=%s reason=%s",
            escalation_id,
            site,
            bool(resolve_url),
            reason[:200] if reason else "",
        )
        if resolve_url:
            # Log resolve URL so local E2E / manual testing still works
            logger.info("slack.resolve_url escalation_id=%s url=%s", escalation_id, resolve_url)
        return False

    payload = {
        "channel": channel,
        "text": fallback_text,
        "blocks": blocks,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            "https://slack.com/api/chat.postMessage",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json; charset=utf-8",
            },
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()
        if not data.get("ok"):
            # Do not fail the whole escalation if Slack rejects the message
            logger.error(
                "slack.post_failed escalation_id=%s error=%s",
                escalation_id,
                data.get("error"),
            )
            return False

    logger.info(
        "slack.sent escalation_id=%s channel=%s",
        escalation_id,
        channel,
    )
    return True


def _build_blocks(
    *,
    escalation_id: str,
    site: str,
    reason: str,
    screenshot_url: Optional[str],
    resolve_url: Optional[str],
    expires_at: Optional[datetime],
) -> list[dict]:
    expiry_line = ""
    if expires_at is not None:
        # Slack-friendly relative hint + UTC timestamp
        expiry_line = f"\n*Expires*\n`{expires_at.strftime('%Y-%m-%d %H:%M UTC')}`"

    blocks: list[dict] = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "Gryphon: Auth help needed",
                "emoji": True,
            },
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": (
                    f"An agent hit an authentication wall and is waiting on you.\n\n"
                    f"*Site:* `{site}`\n"
                    f"*Why:* {reason}"
                ),
            },
        },
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Escalation ID*\n`{escalation_id}`"},
                {
                    "type": "mrkdwn",
                    "text": f"*Status*\n`pending`{expiry_line}",
                },
            ],
        },
    ]

    if screenshot_url:
        blocks.append(
            {
                "type": "image",
                "image_url": screenshot_url,
                "alt_text": f"Screenshot for {site} auth escalation",
            }
        )

    if resolve_url:
        blocks.append(
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": (
                        "*What to do*\n"
                        "1. Complete the login / 2FA / CAPTCHA in the browser\n"
                        "2. Click *Mark resolved* below so the agent can continue"
                    ),
                },
            }
        )
        blocks.append(
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Mark resolved",
                            "emoji": True,
                        },
                        "style": "primary",
                        "url": resolve_url,
                        "action_id": "resolve_escalation",
                    }
                ],
            }
        )
        blocks.append(
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": (
                            "Link is signed and short-lived. "
                            "No API key required — opens a confirmation page."
                        ),
                    }
                ],
            }
        )

    return blocks
