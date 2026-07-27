#!/usr/bin/env python3
"""
Connect to a Gryphon-ready WordPress session via Playwright CDP.

Prerequisites:
  - Gryphon API running with a resolved site context for SITE
  - pip install httpx playwright && playwright install chromium

Usage:
  export GRYPHON_API_URL=http://127.0.0.1:8000
  export GRYPHON_API_KEY=dev-api-key
  export WP_ADMIN_URL=https://example.com/wp-admin/   # optional
  python wordpress_playwright.py
"""

from __future__ import annotations

import os
import sys

import httpx

API = os.getenv("GRYPHON_API_URL", "http://127.0.0.1:8000").rstrip("/")
KEY = os.getenv("GRYPHON_API_KEY", "dev-api-key")
SITE = os.getenv("GRYPHON_DEMO_SITE", "wordpress")
WP_ADMIN_URL = os.getenv("WP_ADMIN_URL", "").strip()


def get_session(site: str) -> dict:
    r = httpx.post(
        f"{API}/v1/sessions/get",
        headers={"X-API-Key": KEY, "Content-Type": "application/json"},
        json={"site": site},
        timeout=30.0,
    )
    r.raise_for_status()
    return r.json()


def main() -> int:
    print(f"get_session(site={SITE!r}) via {API}")
    session = get_session(SITE)
    if session.get("status") != "ready":
        print("Not ready:", session)
        print("Resolve human auth in Gryphon, then re-run.")
        return 1

    connect_url = session.get("connect_url")
    if not connect_url:
        print("ready but no connect_url — is Browserbase live on the API?")
        return 1

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Install: pip install playwright && playwright install chromium")
        return 1

    print(f"Connecting CDP… context_id={session.get('context_id')}")
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(connect_url)
        context = browser.contexts[0] if browser.contexts else browser.new_context()
        page = context.pages[0] if context.pages else context.new_page()
        if WP_ADMIN_URL:
            page.goto(WP_ADMIN_URL, wait_until="domcontentloaded")
            print("title:", page.title())
            print("url:", page.url)
        else:
            print("Connected. Set WP_ADMIN_URL to open wp-admin.")
            print("current url:", page.url if page.url else "(none)")
        # Leave browser open briefly so you can inspect via Browserbase dashboard
        page.wait_for_timeout(3000)
    print("done")
    return 0


if __name__ == "__main__":
    sys.exit(main())
