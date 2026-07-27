"""
Map Gryphon site keys → login / start URLs for human Live View.

Humans should never type a URL. Agents pass a site key; we open the login page.
"""

from __future__ import annotations

from typing import Optional
from urllib.parse import urlparse

from app.services.site_sessions import normalize_site

# Known product keys → where the human should sign in
SITE_START_URLS: dict[str, str] = {
    "websitefeedback": "https://websitefeedback.ca/login",
    "websitefeedback.ca": "https://websitefeedback.ca/login",
    "websitefeedback.com": "https://websitefeedback.com/login",
    "wordpress": "https://wordpress.com/log-in",
    "wp": "https://wordpress.com/log-in",
    "linkedin": "https://www.linkedin.com/login",
    "gmail": "https://accounts.google.com/ServiceLogin?service=mail",
    "google": "https://accounts.google.com/ServiceLogin",
    "stripe": "https://dashboard.stripe.com/login",
    "github": "https://github.com/login",
    "slack": "https://slack.com/signin",
    "shopify": "https://accounts.shopify.com/store-login",
    "notion": "https://www.notion.so/login",
    "zendesk": "https://www.zendesk.com/login/",
    "x": "https://x.com/i/flow/login",
    "twitter": "https://x.com/i/flow/login",
    "facebook": "https://www.facebook.com/login",
    "instagram": "https://www.instagram.com/accounts/login/",
    "hubspot": "https://app.hubspot.com/login",
    "salesforce": "https://login.salesforce.com/",
    "atlassian": "https://id.atlassian.com/login",
    "jira": "https://id.atlassian.com/login",
    "figma": "https://www.figma.com/login",
    "linear": "https://linear.app/login",
    "vercel": "https://vercel.com/login",
    "railway": "https://railway.com/login",
    "aws": "https://console.aws.amazon.com/",
    "azure": "https://portal.azure.com/",
}

# Curated list for dashboard onboarding (label + key + login url)
ONBOARDING_SITES: list[dict[str, str]] = [
    {
        "key": "websitefeedback",
        "label": "Website Feedback",
        "start_url": "https://websitefeedback.ca/login",
    },
    {
        "key": "gmail",
        "label": "Gmail",
        "start_url": "https://accounts.google.com/ServiceLogin?service=mail",
    },
    {
        "key": "linkedin",
        "label": "LinkedIn",
        "start_url": "https://www.linkedin.com/login",
    },
    {
        "key": "stripe",
        "label": "Stripe",
        "start_url": "https://dashboard.stripe.com/login",
    },
    {
        "key": "github",
        "label": "GitHub",
        "start_url": "https://github.com/login",
    },
    {
        "key": "wordpress",
        "label": "WordPress.com",
        "start_url": "https://wordpress.com/log-in",
    },
    {
        "key": "slack",
        "label": "Slack",
        "start_url": "https://slack.com/signin",
    },
    {
        "key": "notion",
        "label": "Notion",
        "start_url": "https://www.notion.so/login",
    },
    {
        "key": "shopify",
        "label": "Shopify",
        "start_url": "https://accounts.shopify.com/store-login",
    },
]


def resolve_start_url(
    site: str,
    *,
    explicit_url: Optional[str] = None,
    agent_metadata: Optional[dict] = None,
) -> Optional[str]:
    """
    Prefer explicit URL from the agent, then catalog, then hostname heuristic.
    """
    if explicit_url and _looks_like_url(explicit_url):
        return explicit_url.strip()

    if agent_metadata:
        for key in ("start_url", "login_url", "url", "site_url"):
            val = agent_metadata.get(key)
            if isinstance(val, str) and _looks_like_url(val):
                return val.strip()

    site_key = normalize_site(site)
    if site_key in SITE_START_URLS:
        return SITE_START_URLS[site_key]

    # Aliases / punctuation
    compact = site_key.replace(" ", "").replace("_", "").replace("-", "")
    for key, url in SITE_START_URLS.items():
        if key.replace("-", "").replace(".", "") == compact:
            return url

    # site key that is already a hostname
    if "." in site_key and " " not in site_key:
        host = site_key.removeprefix("www.")
        return f"https://{host}/login"
    return None


def _looks_like_url(value: str) -> bool:
    v = value.strip()
    if not v.startswith("http://") and not v.startswith("https://"):
        return False
    try:
        p = urlparse(v)
        return bool(p.netloc)
    except Exception:
        return False
