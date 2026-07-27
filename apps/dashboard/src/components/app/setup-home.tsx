"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { buildAgentPrompt } from "@/lib/agent-prompt";
import {
  PROD_API_URL,
  hasApiKey,
  readSetupState,
  writeApiKey,
  writeApiUrl,
  writeInstallDone,
  writeSiteDone,
  type SetupState,
} from "@/lib/setup";
import { ONBOARDING_SITES, type CatalogSite } from "@/lib/sites";
import { cn } from "@/lib/utils";

type SetupHomeProps = {
  onPreviewDemo: () => void;
};

type ConnectStatus =
  | { kind: "idle" }
  | { kind: "loading"; site: string }
  | { kind: "opened"; site: string; resolveUrl: string }
  | { kind: "ready"; site: string }
  | { kind: "error"; message: string };

export function SetupHome({ onPreviewDemo }: SetupHomeProps) {
  const { user } = useUser();
  const firstName =
    user?.firstName ||
    user?.fullName?.split(" ")[0] ||
    user?.username ||
    "there";

  const [state, setState] = useState<SetupState | null>(null);
  const [keyDraft, setKeyDraft] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connect, setConnect] = useState<ConnectStatus>({ kind: "idle" });
  const [customOpen, setCustomOpen] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  const refresh = useCallback(() => {
    const next = readSetupState();
    setState(next);
    setKeyDraft(next.apiKey);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const prompt = useMemo(
    () => (state ? buildAgentPrompt(state) : ""),
    [state],
  );

  async function copyPrompt() {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      writeInstallDone(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  function saveKey() {
    writeApiKey(keyDraft);
    if (state) writeApiUrl(state.apiUrl || PROD_API_URL);
    refresh();
  }

  async function connectSite(site: CatalogSite) {
    if (!state) return;
    const apiUrl = (state.apiUrl || PROD_API_URL).replace(/\/$/, "");
    const apiKey = state.apiKey.trim();

    if (!hasApiKey(state)) {
      setShowAdvanced(true);
      setConnect({
        kind: "error",
        message: "Add your API key first (below), then tap a site.",
      });
      return;
    }

    setConnect({ kind: "loading", site: site.label });
    try {
      const res = await fetch(`${apiUrl}/v1/sessions/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({
          site: site.key,
          start_url: site.start_url,
          create_browser_session: true,
        }),
      });
      const data = (await res.json()) as {
        status?: string;
        resolve_url?: string;
        message?: string;
        detail?: { message?: string };
      };

      if (!res.ok) {
        throw new Error(
          data.detail?.message || data.message || `HTTP ${res.status}`,
        );
      }

      if (data.status === "ready") {
        writeSiteDone(true);
        setConnect({ kind: "ready", site: site.label });
        return;
      }

      if (data.status === "needs_auth" && data.resolve_url) {
        window.open(data.resolve_url, "_blank", "noopener");
        setConnect({
          kind: "opened",
          site: site.label,
          resolveUrl: data.resolve_url,
        });
        return;
      }

      throw new Error(data.message || "Unexpected response from Gryphon");
    } catch (err) {
      setConnect({
        kind: "error",
        message:
          err instanceof Error
            ? err.message
            : "Could not start connect flow",
      });
    }
  }

  function connectCustom() {
    const key = customKey.trim().toLowerCase().replace(/\s+/g, "");
    let url = customUrl.trim();
    if (!key) {
      setConnect({ kind: "error", message: "Enter a short site key." });
      return;
    }
    if (url && !/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    if (!url) {
      setConnect({
        kind: "error",
        message: "Paste the login page URL once (we’ll open it for you next time).",
      });
      return;
    }
    void connectSite({ key, label: key, start_url: url });
  }

  if (!state) {
    return (
      <div className="mx-auto max-w-[560px] px-5 py-10 sm:px-8">
        <div className="h-8 w-48 animate-pulse rounded bg-gryphon-ink/6" />
        <div className="mt-6 h-48 animate-pulse rounded-lg bg-gryphon-ink/5" />
      </div>
    );
  }

  const keyReady = hasApiKey(state);

  return (
    <div className="mx-auto max-w-[560px] px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
      <h1 className="m-0 text-[clamp(28px,4.5vw,36px)] leading-[1.08] tracking-[-0.04em]">
        Hey {firstName}.
      </h1>
      <p className="mt-3 m-0 text-[16px] leading-relaxed text-gryphon-muted">
        Connect a site once — Live View opens on the login page. You sign in;
        agents reuse the session. No typing URLs. No password vault.
      </p>

      {/* Primary: connect a site */}
      <section className="mt-8 overflow-hidden rounded-xl border border-gryphon-ink/12 bg-white shadow-[0_20px_50px_-36px_rgba(12,13,16,.55)]">
        <div className="border-b border-gryphon-ink/8 px-4 py-3">
          <h2 className="m-0 text-[15px] font-medium tracking-[-0.02em]">
            Connect a site
          </h2>
          <p className="mt-1 mb-0 text-[13px] text-gryphon-faint">
            Tap a site. We open Live View already on the login page.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
          {ONBOARDING_SITES.map((site) => {
            const loading =
              connect.kind === "loading" && connect.site === site.label;
            return (
              <button
                key={site.key}
                type="button"
                disabled={loading}
                onClick={() => void connectSite(site)}
                className={cn(
                  "rounded-lg border px-3 py-3 text-left transition-colors",
                  "border-gryphon-ink/10 hover:border-gryphon-ink/25 hover:bg-gryphon-ink/[0.02]",
                  loading && "opacity-60",
                )}
              >
                <span className="block text-[13.5px] font-medium text-gryphon-ink">
                  {site.label}
                </span>
                <span className="mt-0.5 block font-mono text-[10px] text-gryphon-ghost">
                  {site.key}
                </span>
              </button>
            );
          })}
        </div>

        <div className="border-t border-gryphon-ink/8 px-4 py-3">
          <button
            type="button"
            onClick={() => setCustomOpen((v) => !v)}
            className="text-[13px] font-medium text-gryphon-blue hover:opacity-80"
          >
            {customOpen ? "− Hide custom site" : "+ Other site (paste login URL once)"}
          </button>
          {customOpen && (
            <div className="mt-3 space-y-2">
              <input
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="Site key (e.g. myapp)"
                className="w-full rounded-md border border-gryphon-ink/12 px-3 py-2 font-mono text-[12.5px] outline-none focus:border-gryphon-blue"
              />
              <input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/login"
                className="w-full rounded-md border border-gryphon-ink/12 px-3 py-2 font-mono text-[12.5px] outline-none focus:border-gryphon-blue"
              />
              <button
                type="button"
                onClick={connectCustom}
                className="h-9 rounded-md bg-gryphon-ink px-4 text-[13px] font-medium text-white hover:bg-gryphon-blue"
              >
                Connect custom site
              </button>
            </div>
          )}
        </div>

        {connect.kind === "loading" && (
          <p className="m-0 border-t border-gryphon-ink/8 px-4 py-3 text-[13px] text-gryphon-muted">
            Opening {connect.site}…
          </p>
        )}
        {connect.kind === "opened" && (
          <div className="border-t border-gryphon-ink/8 bg-[#F3FAF5] px-4 py-3 text-[13px] leading-relaxed text-gryphon-muted">
            <strong className="font-medium text-gryphon-ink">
              Live View opened for {connect.site}.
            </strong>{" "}
            Sign in fully, wait a few seconds on the logged-in page, then click{" "}
            <strong className="text-gryphon-ink">Mark resolved</strong> on the
            Gryphon page.{" "}
            <a
              href={connect.resolveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gryphon-blue"
            >
              Re-open link
            </a>
          </div>
        )}
        {connect.kind === "ready" && (
          <p className="m-0 border-t border-gryphon-ink/8 bg-[#F3FAF5] px-4 py-3 text-[13px] text-gryphon-muted">
            <strong className="font-medium text-gryphon-ink">
              {connect.site} is already connected.
            </strong>{" "}
            Agents can call get_session for that site.
          </p>
        )}
        {connect.kind === "error" && (
          <p className="m-0 border-t border-gryphon-ink/8 bg-[#FDF6EC] px-4 py-3 text-[13px] text-[#7C3E06]">
            {connect.message}
          </p>
        )}
      </section>

      {/* API key — required for connect */}
      <div className="mt-5">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-gryphon-ink/9 bg-white px-3.5 py-3 text-left text-[13.5px] text-gryphon-muted transition-colors hover:border-gryphon-ink/16"
        >
          <span>
            {keyReady ? (
              <>
                <span className="font-medium text-gryphon-ink">API key set</span>
                <span className="text-gryphon-faint"> · ready to connect</span>
              </>
            ) : (
              <>
                <span className="font-medium text-gryphon-ink">
                  1. Add API key
                </span>
                <span className="text-gryphon-faint">
                  {" "}
                  · required to connect sites
                </span>
              </>
            )}
          </span>
          <span className="font-mono text-[12px] text-gryphon-ghost">
            {showAdvanced || !keyReady ? "−" : "+"}
          </span>
        </button>

        {(showAdvanced || !keyReady) && (
          <div className="mt-2 space-y-3 rounded-lg border border-gryphon-ink/9 bg-white p-3.5">
            <label className="block">
              <span className="font-mono text-[10.5px] text-gryphon-ghost">
                API URL
              </span>
              <input
                value={state.apiUrl}
                onChange={(e) => setState({ ...state, apiUrl: e.target.value })}
                onBlur={() => {
                  writeApiUrl(state.apiUrl);
                  refresh();
                }}
                className="mt-1 w-full rounded-md border border-gryphon-ink/12 px-3 py-2 font-mono text-[12.5px] outline-none focus:border-gryphon-blue"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10.5px] text-gryphon-ghost">
                API key
              </span>
              <div className="mt-1 flex gap-2">
                <input
                  type={showKey ? "text" : "password"}
                  value={keyDraft}
                  onChange={(e) => setKeyDraft(e.target.value)}
                  placeholder="Production or local Gryphon key"
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-md border border-gryphon-ink/12 px-3 py-2 font-mono text-[12.5px] outline-none focus:border-gryphon-blue"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="rounded-md border border-gryphon-ink/12 px-3 text-[12px] text-gryphon-muted"
                >
                  {showKey ? "Hide" : "Show"}
                </button>
              </div>
            </label>
            <button
              type="button"
              onClick={saveKey}
              className="h-9 rounded-md bg-gryphon-ink px-4 text-[13px] font-medium text-white hover:bg-gryphon-blue"
            >
              Save key
            </button>
          </div>
        )}
      </div>

      {/* Secondary: agent prompt */}
      <div className="mt-5 overflow-hidden rounded-xl border border-gryphon-ink/10 bg-white">
        <div className="flex items-center justify-between gap-2 border-b border-gryphon-ink/8 px-4 py-2.5">
          <span className="text-[13.5px] font-medium text-gryphon-ink">
            Give your agent a prompt
          </span>
          <span className="font-mono text-[10.5px] text-gryphon-ghost">
            optional
          </span>
        </div>
        <pre className="max-h-[140px] overflow-auto px-4 py-3 font-mono text-[11px] leading-relaxed text-gryphon-muted whitespace-pre-wrap">
          {prompt}
        </pre>
        <div className="border-t border-gryphon-ink/8 px-4 py-3">
          <button
            type="button"
            onClick={copyPrompt}
            className={cn(
              "flex h-10 w-full cursor-pointer items-center justify-center rounded-md text-[13.5px] font-medium text-white transition-colors",
              copied
                ? "bg-gryphon-green"
                : "bg-gryphon-ink hover:bg-gryphon-blue",
            )}
          >
            {copied ? "Copied" : "Copy agent prompt"}
          </button>
        </div>
      </div>

      <p className="mt-8 mb-0 text-center text-[13px] text-gryphon-faint">
        <Link
          href="/dashboard/install"
          className="font-medium text-gryphon-blue hover:opacity-80"
        >
          Manual install
        </Link>
        {" · "}
        <button
          type="button"
          onClick={onPreviewDemo}
          className="font-medium text-gryphon-blue hover:opacity-80"
        >
          Preview sample console
        </button>
      </p>
    </div>
  );
}
