# Gryphon MCP Server

Agent-facing MCP tools for Gryphon (auth sessions + human escalation).

## Tools

| Tool | Purpose |
|------|---------|
| `get_session` | Primary entry: ready Browserbase session or `needs_auth` |
| `request_human_auth` | Explicit mid-task escalation |
| `get_escalation_status` | Poll an escalation until `resolved` |

## Agent flow

1. Call `get_session(site="linkedin")`
2. If `status=ready` → connect with `connect_url` / use `context_id`
3. If `status=needs_auth` → pause; human resolves via Slack/Live View
4. Poll `get_session` (or `get_escalation_status`) until ready

## Requirements

- Python **3.10+** (MCP SDK). Use 3.12 if available.
- Gryphon API running (default `http://localhost:8000`)

## Setup

```bash
cd apps/mcp-server
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Env

```bash
export GRYPHON_API_URL=http://localhost:8000
export GRYPHON_API_KEY=dev-api-key
```

## Run (stdio)

```bash
python server.py
```

## Example Claude Desktop / Cursor config

```json
{
  "mcpServers": {
    "gryphon": {
      "command": "/path/to/Gryphon/apps/mcp-server/.venv/bin/python",
      "args": ["/path/to/Gryphon/apps/mcp-server/server.py"],
      "env": {
        "GRYPHON_API_URL": "http://localhost:8000",
        "GRYPHON_API_KEY": "dev-api-key"
      }
    }
  }
}
```
