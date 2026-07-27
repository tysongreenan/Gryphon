# Gryphon MCP Server

Agent-facing MCP tools for Gryphon (auth sessions + human escalation).

## Tools

| Tool | Purpose |
|------|---------|
| `get_session` | Primary entry: ready Browserbase session or `needs_auth` |
| `request_human_auth` | Explicit mid-task escalation |
| `get_escalation_status` | Poll an escalation until `resolved` |

## Agent flow

1. Call `get_session(site="wordpress")` (or your site key)
2. If `status=ready` → connect with `connect_url` / use `context_id`
3. If `status=needs_auth` → pause; human resolves via Slack/Live View
4. Poll `get_session` (or `get_escalation_status`) until ready

Full host setup: **[`docs/MCP_AGENT_SETUP.md`](../../docs/MCP_AGENT_SETUP.md)**  
Agent prompt: **[`docs/AGENT_CONTRACT.md`](../../docs/AGENT_CONTRACT.md)**

## Requirements

- Python **3.10+** (MCP SDK). Use 3.12 if available.
- Gryphon API running (default `http://127.0.0.1:8000`)

## Quick setup

From repo root:

```bash
./scripts/setup_mcp.sh
./scripts/smoke_mcp.sh   # API must be up
```

Manual:

```bash
cd apps/mcp-server
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Env

```bash
# apps/mcp-server/.env or MCP host env block
GRYPHON_API_URL=http://127.0.0.1:8000
GRYPHON_API_KEY=dev-api-key
```

## Run (stdio)

```bash
source .venv/bin/activate
python server.py
```

Hosts (Cursor, Claude Desktop) start this process for you via MCP config.

## Cursor

This monorepo ships:

```
.cursor/mcp.json
```

Restart Cursor / reload MCP. Also see `configs/cursor.mcp.json`.

## Claude Desktop

Merge `configs/claude_desktop.snippet.json` into:

```
~/Library/Application Support/Claude/claude_desktop_config.json
```

Quit and reopen Claude Desktop.

## Example config

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
