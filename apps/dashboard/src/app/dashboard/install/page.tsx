"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { CopyBlock } from "@/components/app/copy-block";
import {
  LOCAL_API_URL,
  PROD_API_URL,
  hasApiKey,
  readSetupState,
  writeApiKey,
  writeApiUrl,
  writeInstallDone,
} from "@/lib/setup";
import { cn } from "@/lib/utils";

type Tab = "mcp" | "rest" | "contract";

const AGENT_CONTRACT = `## Auth reliability (Gryphon MCP)

You have Gryphon MCP tools for logged-in browser sessions. Use them for any site
that requires login (especially WordPress).

### Tools

- \`get_session(site)\` — primary entry. Call before acting on a site that needs auth.
- \`request_human_auth(site, reason)\` — login wall mid-task.
- \`get_escalation_status(escalation_id)\` — poll after needs_auth.

### Rules

1. **Always** call \`get_session\` first for authenticated sites. Do not scrape or invent cookies.
2. Use stable site keys. For WordPress use **wordpress** (unless the user specifies another key).
3. If \`status=ready\`:
   - Use \`connect_url\` with browser automation (Playwright CDP / Stagehand / Browserbase).
   - \`connect_url\` is short-lived — call \`get_session\` again for a new run; do not hardcode old URLs.
4. If \`status=needs_auth\`:
   - Stop site actions.
   - Tell the human auth is required (escalation_id / resolve path).
   - Poll \`get_session\` or \`get_escalation_status\` until ready, then continue.
5. If you hit a login wall mid-task, call \`request_human_auth\` with a clear reason, then pause and poll.
6. **Never** treat test cookies (e.g. WordPress \`wordpress_test_cookie\`) as proof of login.
7. Gryphon only provides auth sessions. You still perform the actual site work (edit posts, etc.).`;

function mcpConfig(repo: string, apiUrl: string, apiKey: string) {
  const root = repo.replace(/\/$/, "") || "/absolute/path/to/Gryphon";
  return JSON.stringify(
    {
      mcpServers: {
        gryphon: {
          command: `${root}/apps/mcp-server/.venv/bin/python`,
          args: [`${root}/apps/mcp-server/server.py`],
          env: {
            GRYPHON_API_URL: apiUrl,
            GRYPHON_API_KEY: apiKey,
          },
        },
      },
    },
    null,
    2,
  );
}

export default function InstallPage() {
  const [tab, setTab] = useState<Tab>("mcp");
  const [apiUrl, setApiUrl] = useState(PROD_API_URL);
  const [apiKey, setApiKey] = useState("");
  const [repoPath, setRepoPath] = useState("");
  const [host, setHost] = useState<"cursor" | "claude">("cursor");
  const [showLocal, setShowLocal] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [marked, setMarked] = useState(false);

  useEffect(() => {
    const s = readSetupState();
    setApiUrl(s.apiUrl || PROD_API_URL);
    setApiKey(s.apiKey);
    setMarked(s.installDone);
    setHydrated(true);
  }, []);

  const keyReady = hasApiKey({
    apiKey,
    apiUrl,
    installDone: marked,
    siteDone: false,
  });

  const displayKey = keyReady ? apiKey.trim() : "YOUR_API_KEY";
  const displayUrl = (apiUrl || PROD_API_URL).replace(/\/$/, "");

  const configJson = useMemo(
    () => mcpConfig(repoPath.trim(), displayUrl, displayKey),
    [repoPath, displayUrl, displayKey],
  );

  const curlGetSession = `curl -sS -X POST "${displayUrl}/v1/sessions/get" \\
  -H "X-API-Key: ${displayKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"site":"wordpress"}' | jq`;

  function persistKey(next: string) {
    setApiKey(next);
    writeApiKey(next);
  }

  function persistUrl(next: string) {
    setApiUrl(next);
    writeApiUrl(next);
  }

  function markInstalled() {
    writeInstallDone(true);
    setMarked(true);
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[720px] px-5 py-8 sm:px-8">
        <div className="h-8 w-56 animate-pulse rounded bg-gryphon-ink/6" />
        <div className="mt-6 h-32 animate-pulse rounded-lg bg-gryphon-ink/5" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
      <p className="m-0 font-mono text-[11px] tracking-[0.08em] text-gryphon-ghost uppercase">
        Manual install
      </p>
      <h1 className="mt-2 m-0 text-2xl tracking-[-0.03em]">Wire MCP yourself</h1>
      <p className="mt-2 max-w-[48ch] text-[14px] leading-relaxed text-gryphon-muted">
        Prefer the easy path?{" "}
        <Link
          href="/dashboard"
          className="font-medium text-gryphon-blue hover:opacity-80"
        >
          Copy the agent prompt on Home
        </Link>{" "}
        and paste it into Cursor. This page is for JSON / curl.
      </p>

      {/* 1. Your connection — first, required */}
      <section className="mt-7 rounded-lg border border-gryphon-ink/12 bg-white p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="m-0 text-[15px] font-medium tracking-[-0.015em]">
            1. Your connection
          </h2>
          {keyReady ? (
            <span className="font-mono text-[10px] tracking-[0.06em] text-gryphon-green uppercase">
              Key set
            </span>
          ) : (
            <span className="font-mono text-[10px] tracking-[0.06em] text-gryphon-amber uppercase">
              Required
            </span>
          )}
        </div>
        <p className="mt-1.5 mb-0 text-[13px] text-gryphon-faint">
          Snippets below use these values. Key stays in this browser only.
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <span className="font-mono text-[10.5px] text-gryphon-ghost">
              API base URL
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Chip
                active={apiUrl === PROD_API_URL}
                onClick={() => persistUrl(PROD_API_URL)}
              >
                Production
              </Chip>
              <Chip
                active={apiUrl === LOCAL_API_URL}
                onClick={() => {
                  persistUrl(LOCAL_API_URL);
                  setShowLocal(true);
                }}
              >
                Local :8000
              </Chip>
            </div>
            <input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              onBlur={() => persistUrl(apiUrl)}
              className="mt-2 w-full rounded-md border border-gryphon-ink/12 bg-gryphon-paper px-3 py-2 font-mono text-[12.5px] outline-none focus:border-gryphon-blue"
            />
          </div>
          <div>
            <span className="font-mono text-[10.5px] text-gryphon-ghost">
              API key
            </span>
            <div className="mt-1 flex gap-2">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onBlur={() => persistKey(apiKey)}
                placeholder="Paste your key"
                autoComplete="off"
                className="min-w-0 flex-1 rounded-md border border-gryphon-ink/12 bg-gryphon-paper px-3 py-2 font-mono text-[12.5px] outline-none focus:border-gryphon-blue"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="shrink-0 rounded-md border border-gryphon-ink/12 px-3 text-[12px] text-gryphon-muted"
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
            {!keyReady && (
              <p className="mt-2 mb-0 text-[12px] text-gryphon-faint">
                No key yet?{" "}
                <Link
                  href="/dashboard"
                  className="font-medium text-gryphon-blue hover:opacity-80"
                >
                  Add it on Home
                </Link>{" "}
                or paste here. Local:{" "}
                <code className="font-mono text-[11px]">
                  apps/api/.env → GRYPHON_API_KEY
                </code>
                .
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["mcp", "MCP (recommended)"],
            ["rest", "REST"],
            ["contract", "Agent contract"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "h-8 rounded-md border px-3 text-[12.5px] font-medium transition-colors",
              tab === id
                ? "border-gryphon-ink/20 bg-gryphon-ink/5 text-gryphon-ink"
                : "border-transparent text-gryphon-faint hover:border-gryphon-ink/12 hover:text-gryphon-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "mcp" && (
        <div className="mt-5 space-y-6">
          <section>
            <h2 className="m-0 text-[15px] font-medium tracking-[-0.015em]">
              2. Host config
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip active={host === "cursor"} onClick={() => setHost("cursor")}>
                Cursor
              </Chip>
              <Chip active={host === "claude"} onClick={() => setHost("claude")}>
                Claude Desktop
              </Chip>
            </div>

            <p className="mt-3 mb-0 text-[13px] leading-relaxed text-gryphon-muted">
              {host === "cursor" ? (
                <>
                  Paste into{" "}
                  <code className="font-mono text-[12px]">.cursor/mcp.json</code>{" "}
                  (project or user). Paths must be absolute. Restart Cursor
                  after saving.
                </>
              ) : (
                <>
                  Merge into{" "}
                  <code className="font-mono text-[12px]">
                    ~/Library/Application
                    Support/Claude/claude_desktop_config.json
                  </code>
                  . Fully quit and reopen Claude Desktop.
                </>
              )}
            </p>

            <label className="mt-3 block">
              <span className="font-mono text-[10.5px] text-gryphon-ghost">
                Gryphon repo absolute path (stdio MCP)
              </span>
              <input
                value={repoPath}
                onChange={(e) => setRepoPath(e.target.value)}
                placeholder="/Users/you/Gryphon"
                className="mt-1 w-full rounded-md border border-gryphon-ink/12 bg-white px-3 py-2 font-mono text-[12.5px] outline-none focus:border-gryphon-blue"
              />
            </label>

            <CopyBlock
              className="mt-3"
              label={
                host === "cursor"
                  ? ".cursor/mcp.json"
                  : "claude_desktop_config.json"
              }
              code={configJson}
            />

            {!keyReady && (
              <p className="mt-2 mb-0 text-[12px] text-gryphon-amber">
                Snippet shows YOUR_API_KEY until you save a real key above.
              </p>
            )}

            <p className="mt-3 mb-0 text-[13px] text-gryphon-muted">
              Confirm tools:{" "}
              <code className="font-mono text-[12px]">get_session</code>,{" "}
              <code className="font-mono text-[12px]">request_human_auth</code>,{" "}
              <code className="font-mono text-[12px]">
                get_escalation_status
              </code>
              .
            </p>
          </section>

          <section>
            <h2 className="m-0 text-[15px] font-medium tracking-[-0.015em]">
              3. Agent loop
            </h2>
            <CopyBlock
              className="mt-3"
              label="flow"
              code={`1. get_session(site="wordpress")
2. if ready → connect to connect_url → do work
3. if needs_auth → human resolves Live View → poll until ready
4. login wall mid-task → request_human_auth → poll → reconnect`}
            />
          </section>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gryphon-ink/9 bg-white px-4 py-3.5">
            <button
              type="button"
              onClick={markInstalled}
              disabled={!keyReady}
              className="inline-flex h-9 items-center rounded-md bg-gryphon-ink px-4 text-[13px] font-medium text-white transition-colors hover:bg-gryphon-blue disabled:cursor-not-allowed disabled:opacity-40"
            >
              {marked ? "Marked installed" : "I've installed it"}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center rounded-md border border-gryphon-ink/14 px-3.5 text-[13px] font-medium text-gryphon-muted hover:border-gryphon-ink/30 hover:text-gryphon-ink"
            >
              Back to home
            </Link>
            {marked && (
              <span className="font-mono text-[11px] text-gryphon-green">
                Step 2 complete
              </span>
            )}
          </div>

          {/* Local monorepo — under the fold */}
          <div className="border-t border-gryphon-ink/8 pt-5">
            <button
              type="button"
              onClick={() => setShowLocal((v) => !v)}
              className="flex w-full items-center justify-between text-left text-[13px] font-medium text-gryphon-muted hover:text-gryphon-ink"
            >
              Running this monorepo locally
              <span className="font-mono text-[11px] text-gryphon-ghost">
                {showLocal ? "−" : "+"}
              </span>
            </button>
            {showLocal && (
              <div className="mt-3 space-y-3">
                <p className="m-0 text-[13px] leading-relaxed text-gryphon-muted">
                  Only if you develop Gryphon itself. Production users can ignore
                  this.
                </p>
                <CopyBlock
                  label="setup"
                  code={`cd /path/to/Gryphon
./scripts/setup_mcp.sh
# Start API: cd apps/api && uvicorn app.main:app --reload --port 8000
./scripts/smoke_mcp.sh`}
                />
              </div>
            )}
          </div>

          <Troubleshooting />
        </div>
      )}

      {tab === "rest" && (
        <div className="mt-5 space-y-5">
          <p className="m-0 text-[13.5px] leading-relaxed text-gryphon-muted">
            Any runtime that can HTTP POST. Auth:{" "}
            <code className="font-mono text-[12px]">X-API-Key</code>. Entry:{" "}
            <code className="font-mono text-[12px]">POST /v1/sessions/get</code>.
          </p>
          <CopyBlock label="curl" code={curlGetSession} />
          <div className="grid gap-3 sm:grid-cols-2">
            <ResponseCard
              title="ready"
              tone="green"
              body={`{ "status": "ready", "connect_url": "wss://..." }`}
            />
            <ResponseCard
              title="needs_auth"
              tone="amber"
              body={`{ "status": "needs_auth", "escalation_id": "..." }`}
            />
          </div>
        </div>
      )}

      {tab === "contract" && (
        <div className="mt-5 space-y-3">
          <p className="m-0 text-[13.5px] text-gryphon-muted">
            Paste into agent rules or the first chat message.
          </p>
          <CopyBlock label="agent contract" code={AGENT_CONTRACT} />
        </div>
      )}
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-7 rounded border px-2.5 font-mono text-[11px] transition-colors",
        active
          ? "border-gryphon-ink/20 bg-gryphon-ink/5 text-gryphon-ink"
          : "border-gryphon-ink/10 text-gryphon-faint hover:border-gryphon-ink/16",
      )}
    >
      {children}
    </button>
  );
}

function ResponseCard({
  title,
  tone,
  body,
}: {
  title: string;
  tone: "green" | "amber";
  body: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gryphon-ink/9 bg-white">
      <div className="flex items-center gap-2 border-b border-gryphon-ink/7 px-3 py-2">
        <span
          className={cn(
            "size-1.5 rounded-full",
            tone === "green" ? "bg-[#22C55E]" : "bg-[#D97706]",
          )}
        />
        <span
          className={cn(
            "font-mono text-[11px] font-medium",
            tone === "green" ? "text-gryphon-green" : "text-gryphon-amber",
          )}
        >
          {title}
        </span>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-gryphon-muted whitespace-pre">
        {body}
      </pre>
    </div>
  );
}

function Troubleshooting() {
  const rows = [
    ["MCP tools missing", "Restart host; check python path exists"],
    ["Connection refused", "API running? Check URL"],
    ["invalid_api_key", "Key must match a non-revoked Gryphon key"],
    ["Always needs_auth", "Resolve Live View, or fix site key"],
  ] as const;

  return (
    <section>
      <h2 className="m-0 text-[15px] font-medium tracking-[-0.015em]">
        Troubleshooting
      </h2>
      <div className="mt-3 overflow-hidden rounded-lg border border-gryphon-ink/9 bg-white">
        <table className="w-full text-left text-[13px]">
          <tbody className="text-gryphon-muted">
            {rows.map(([symptom, fix], i) => (
              <tr
                key={symptom}
                className={
                  i < rows.length - 1 ? "border-b border-gryphon-ink/6" : undefined
                }
              >
                <td className="px-3.5 py-2.5 text-gryphon-ink">{symptom}</td>
                <td className="px-3.5 py-2.5">{fix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
