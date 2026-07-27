# Gryphon agent contract

Paste this into an agent system prompt, project rule, or first message when the
agent should use Gryphon for authenticated web access.

---

## Auth reliability (Gryphon MCP)

You have Gryphon MCP tools for logged-in browser sessions. Use them for any site
that requires login (especially WordPress).

### Tools

- `get_session(site)` — primary entry. Call before acting on a site that needs auth.
- `request_human_auth(site, reason)` — login wall mid-task.
- `get_escalation_status(escalation_id)` — poll after needs_auth.

### Rules

1. **Always** call `get_session` first for authenticated sites. Do not scrape or invent cookies.
2. Use stable site keys. For WordPress use **`wordpress`** (unless the user specifies another key).
3. If `status=ready`:
   - Use `connect_url` with browser automation (Playwright CDP / Stagehand / Browserbase).
   - `connect_url` is short-lived — call `get_session` again for a new run; do not hardcode old URLs.
4. If `status=needs_auth`:
   - Stop site actions.
   - Tell the human auth is required (escalation_id / resolve path).
   - Poll `get_session` or `get_escalation_status` until ready, then continue.
5. If you hit a login wall mid-task, call `request_human_auth` with a clear reason, then pause and poll.
6. **Never** treat test cookies (e.g. WordPress `wordpress_test_cookie`) as proof of login.
7. Gryphon only provides auth sessions. You still perform the actual site work (edit posts, etc.).

### WordPress example

```
get_session(site="wordpress")
→ ready → connect_over_cdp(connect_url) → open /wp-admin/ → do work
→ needs_auth → ask human to resolve Live View → poll until ready
```

### Failure behavior

- API down → report that Gryphon is unreachable; do not pretend to be logged in.
- Wrong site key → user may need to re-auth under the correct key.

---
