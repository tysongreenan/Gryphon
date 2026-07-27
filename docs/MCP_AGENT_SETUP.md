# Gryphon MCP — agent setup

Hook any MCP-capable agent (Cursor, Claude Desktop, etc.) into Gryphon so it can
**tool-call** for authenticated browser sessions.

## Prerequisites

1. **Gryphon API running** (local default):

   ```bash
   cd apps/api && source .venv/bin/activate
   # apps/api/.env should have real Browserbase keys for Live View
   uvicorn app.main:app --reload --port 8000 --host 127.0.0.1
   ```

2. **MCP server installed** (one-time):

   ```bash
   ./scripts/setup_mcp.sh
   # or manually:
   cd apps/mcp-server && python3.12 -m venv .venv
   source .venv/bin/activate && pip install -r requirements.txt
   cp .env.example .env   # edit if API URL/key differ
   ```

3. Smoke test (no MCP host required):

   ```bash
   ./scripts/smoke_mcp.sh
   ```

## Tools the agent gets

| Tool | When to call |
|------|----------------|
| `get_session(site)` | **First** step before acting on a logged-in site |
| `request_human_auth(site, reason)` | Login wall mid-task |
| `get_escalation_status(escalation_id)` | Poll after `needs_auth` |

### Return shapes

**Ready**

```json
{
  "status": "ready",
  "site": "wordpress",
  "context_id": "...",
  "session_id": "...",
  "connect_url": "wss://connect...browserbase.com/...",
  "message": "Authenticated session ready"
}
```

Agent: attach browser automation to `connect_url` (Playwright `connect_over_cdp`, Stagehand, etc.).

**Needs auth**

```json
{
  "status": "needs_auth",
  "site": "wordpress",
  "escalation_id": "...",
  "message": "..."
}
```

Agent: pause, tell the human, poll until ready. Human opens resolve page / Slack Live View, logs in, marks resolved.

## Cursor (this repo)

Project config is already at:

```
.cursor/mcp.json
```

1. Keep Gryphon API on `:8000`
2. Restart Cursor (or reload MCP servers)
3. Confirm tools: `get_session`, `request_human_auth`, `get_escalation_status`
4. Paste the agent contract from [`AGENT_CONTRACT.md`](./AGENT_CONTRACT.md) into the chat or project rules

### Other project (Cursor)

Copy the `gryphon` block from `.cursor/mcp.json` into that project's `.cursor/mcp.json` or your user MCP config. Absolute paths to this monorepo's venv/python are required.

## Claude Desktop

Merge into `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gryphon": {
      "command": "/Users/tyson/Gryphon/apps/mcp-server/.venv/bin/python",
      "args": ["/Users/tyson/Gryphon/apps/mcp-server/server.py"],
      "env": {
        "GRYPHON_API_URL": "http://127.0.0.1:8000",
        "GRYPHON_API_KEY": "dev-api-key"
      }
    }
  }
}
```

Fully quit and reopen Claude Desktop after editing. Ready-to-merge snippet: `apps/mcp-server/configs/claude_desktop.snippet.json`.

## Env

| Variable | Default | Meaning |
|----------|---------|---------|
| `GRYPHON_API_URL` | `http://127.0.0.1:8000` | Gryphon API base URL |
| `GRYPHON_API_KEY` | `dev-api-key` | `X-API-Key` for agent routes |

Set in:

- MCP host config `env` (preferred for Cursor/Claude), or
- `apps/mcp-server/.env`

## Site keys

Sessions are scoped by `(user, site string)`. Use a **stable** key:

| Site | Recommended key |
|------|-----------------|
| WordPress (already resolved locally) | `wordpress` |
| LinkedIn | `linkedin` |
| Custom | hostname or short name, same every time |

## Agent loop (copy this)

```
1. get_session(site="wordpress")
2. if ready → connect to connect_url → do work
3. if needs_auth → tell human to resolve → poll get_session / get_escalation_status
4. if login wall mid-task → request_human_auth → poll → reconnect
```

Full prompt text: [`AGENT_CONTRACT.md`](./AGENT_CONTRACT.md).

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| MCP tools missing | Restart host; check python path in mcp.json exists |
| Connection refused | Start API on `:8000` |
| `invalid_api_key` | Match `GRYPHON_API_KEY` to API bootstrap key |
| Always `needs_auth` | Human resolve not done, or wrong `site` key |
| `ready` but not logged in | Re-resolve via Live View; prior context may be empty/wrong site |
| Fake Browserbase | API log should say `browserbase=live` for real WP login |

## Architecture

```
Agent (Cursor / Claude / …)
  └─ MCP tools: get_session | request_human_auth | get_escalation_status
       └─ apps/mcp-server/server.py (stdio)
            └─ HTTP → Gryphon API :8000
                 └─ Browserbase context / connect_url
```
