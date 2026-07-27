#!/usr/bin/env bash
# One-time setup for Gryphon MCP server (agent tool-calling).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MCP_DIR="$ROOT/apps/mcp-server"

echo "==> Gryphon MCP setup"
echo "    root: $MCP_DIR"

if command -v python3.12 >/dev/null 2>&1; then
  PY=python3.12
elif command -v python3 >/dev/null 2>&1; then
  PY=python3
else
  echo "error: need python3.10+ (python3.12 preferred)" >&2
  exit 1
fi

echo "==> Using $PY ($($PY --version))"
cd "$MCP_DIR"
if [[ ! -d .venv ]]; then
  "$PY" -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -q -U pip
pip install -q -r requirements.txt

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "==> Wrote apps/mcp-server/.env from .env.example"
else
  echo "==> apps/mcp-server/.env already exists"
fi

echo "==> Import check"
python -c "import mcp, httpx; import server; print('ok')"

echo ""
echo "Done."
echo "  Cursor:  project .cursor/mcp.json (restart Cursor / reload MCP)"
echo "  Claude:  merge apps/mcp-server/configs/claude_desktop.snippet.json"
echo "  Smoke:   ./scripts/smoke_mcp.sh"
echo "  Docs:    docs/MCP_AGENT_SETUP.md"
echo ""
echo "API must be running: cd apps/api && uvicorn app.main:app --reload --port 8000"
