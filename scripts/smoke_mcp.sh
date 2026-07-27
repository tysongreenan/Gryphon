#!/usr/bin/env bash
# Smoke-test Gryphon MCP tool functions against the live API.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MCP_DIR="$ROOT/apps/mcp-server"

if [[ ! -x "$MCP_DIR/.venv/bin/python" ]]; then
  echo "MCP venv missing. Run: ./scripts/setup_mcp.sh" >&2
  exit 1
fi

export GRYPHON_API_URL="${GRYPHON_API_URL:-http://127.0.0.1:8000}"
export GRYPHON_API_KEY="${GRYPHON_API_KEY:-dev-api-key}"
export GRYPHON_DEMO_SITE="${GRYPHON_DEMO_SITE:-wordpress}"

cd "$MCP_DIR"
# shellcheck disable=SC1091
source .venv/bin/activate

echo "API: $GRYPHON_API_URL  site=$GRYPHON_DEMO_SITE"
python - <<'PY'
import os
from server import get_session, get_escalation_status

site = os.environ.get("GRYPHON_DEMO_SITE", "wordpress")
print(f"[1] get_session({site!r})")
r = get_session(site)
print(f"    status={r.get('status')}")
for k in ("context_id", "session_id", "escalation_id", "message"):
    if r.get(k):
        val = r[k]
        if k == "message" and len(str(val)) > 100:
            val = str(val)[:100] + "..."
        print(f"    {k}={val}")

assert r.get("status") in ("ready", "needs_auth"), r

if r.get("status") == "ready":
    assert r.get("context_id"), "ready without context_id"
    print(f"[ok] ready session (connect_url present={bool(r.get('connect_url'))})")
else:
    eid = r.get("escalation_id")
    assert eid, "needs_auth without escalation_id"
    s = get_escalation_status(eid)
    print(f"[2] get_escalation_status → status={s.get('status')}")
    print("[ok] needs_auth path works — human resolve required")

print("SMOKE_OK")
PY
