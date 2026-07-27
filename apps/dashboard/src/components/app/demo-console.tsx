"use client";

import { useEffect, useState } from "react";

type EscalationMode = "one open" | "queue" | "all clear";

const RESOLVED = [
  {
    title: "Gmail · device confirmation",
    by: "Mara · 38s",
    when: "3h ago",
    meta: "pipeline-sync · run #86",
  },
  {
    title: "LinkedIn · checkpoint puzzle",
    by: "you · 1m 04s",
    when: "1d ago",
    meta: "outreach-v3 · run #39",
  },
  {
    title: "Stripe · session expired, re-login",
    by: "you · 47s",
    when: "3d ago",
    meta: "books-nightly · run #08",
  },
];

const QUEUE = [
  {
    title: "Gmail · device confirmation",
    meta: "agent pipeline-sync · run #92 · sent to #agents-alerts",
    for: "2:10",
  },
  {
    title: "LinkedIn · checkpoint puzzle",
    meta: "agent outreach-v3 · run #44 · sent to #agents-alerts",
    for: "5:33",
  },
];

type SiteRow = {
  name: string;
  initial: string;
  brand: string;
  sub: string;
  subFg: string;
  status: string;
  fg: string;
  dot: string;
  anim: boolean;
  used: string;
  usedFg: string;
  action: string;
  actionFg: string;
  bg: string;
  edge: boolean;
};

const BASE_SITES: SiteRow[] = [
  {
    name: "Stripe",
    initial: "S",
    brand: "#635BFF",
    sub: "waiting on you",
    subFg: "#B45309",
    status: "Needs auth",
    fg: "#B45309",
    dot: "#D97706",
    anim: true,
    used: "now",
    usedFg: "#B45309",
    action: "live view →",
    actionFg: "#B45309",
    bg: "rgba(180,83,9,.05)",
    edge: true,
  },
  {
    name: "LinkedIn",
    initial: "in",
    brand: "#0A66C2",
    sub: "bb_ctx_4a9c",
    subFg: "#B9BCC3",
    status: "Ready",
    fg: "#15803D",
    dot: "#22C55E",
    anim: false,
    used: "4m",
    usedFg: "#A6A9AF",
    action: "details",
    actionFg: "#B9BCC3",
    bg: "transparent",
    edge: false,
  },
  {
    name: "Gmail",
    initial: "M",
    brand: "#C5221F",
    sub: "bb_ctx_1d02",
    subFg: "#B9BCC3",
    status: "Ready",
    fg: "#15803D",
    dot: "#22C55E",
    anim: false,
    used: "2h",
    usedFg: "#A6A9AF",
    action: "details",
    actionFg: "#B9BCC3",
    bg: "transparent",
    edge: false,
  },
  {
    name: "Shopify",
    initial: "S",
    brand: "#5A8E3F",
    sub: "bb_ctx_77b1",
    subFg: "#B9BCC3",
    status: "Ready",
    fg: "#15803D",
    dot: "#22C55E",
    anim: false,
    used: "1d",
    usedFg: "#A6A9AF",
    action: "details",
    actionFg: "#B9BCC3",
    bg: "transparent",
    edge: false,
  },
  {
    name: "Zendesk",
    initial: "Z",
    brand: "#03363D",
    sub: "bb_ctx_c210",
    subFg: "#B9BCC3",
    status: "Ready",
    fg: "#15803D",
    dot: "#22C55E",
    anim: false,
    used: "3d",
    usedFg: "#A6A9AF",
    action: "details",
    actionFg: "#B9BCC3",
    bg: "transparent",
    edge: false,
  },
  {
    name: "Notion",
    initial: "N",
    brand: "#191919",
    sub: "bb_ctx_e884",
    subFg: "#B9BCC3",
    status: "Ready",
    fg: "#15803D",
    dot: "#22C55E",
    anim: false,
    used: "6d",
    usedFg: "#A6A9AF",
    action: "details",
    actionFg: "#B9BCC3",
    bg: "transparent",
    edge: false,
  },
];

/** Sample ops console — vision UI only. Not the signed-in user's data. */
export function DemoConsole({ onExit }: { onExit: () => void }) {
  const [mode, setMode] = useState<EscalationMode>("one open");
  const [nowLabel, setNowLabel] = useState("");
  const [pausedFor, setPausedFor] = useState("0:42");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNowLabel(
        d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      );
      const s = 42 + (d.getSeconds() % 18);
      setPausedFor(`0:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const hasOpen = mode !== "all clear";
  const queue = mode === "queue" ? QUEUE : [];
  const resolved =
    mode === "all clear"
      ? [
          {
            title: "Stripe · 2FA verification code",
            by: "you · 54s",
            when: "2h ago",
            meta: "outreach-v3 · run #41",
          },
          ...RESOLVED,
        ]
      : RESOLVED;

  const sites = BASE_SITES.map((site, i) => {
    if (i === 0 && !hasOpen) {
      return {
        ...site,
        sub: "bb_ctx_8f31",
        subFg: "#B9BCC3",
        status: "Ready",
        fg: "#15803D",
        dot: "#22C55E",
        anim: false,
        used: "1m",
        usedFg: "#A6A9AF",
        action: "details",
        actionFg: "#B9BCC3",
        bg: "transparent",
        edge: false,
      };
    }
    return site;
  });

  return (
    <div className="mx-auto max-w-[880px] px-5 py-6 sm:px-8 sm:py-7 lg:px-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gryphon-amber/30 bg-[#FDF6EC] px-3.5 py-2.5">
        <p className="m-0 text-[13px] leading-snug text-[#7C3E06]">
          <strong className="font-medium">Sample console</strong>
          {" — "}
          not your account. Buttons here don&apos;t control real sessions.
        </p>
        <button
          type="button"
          onClick={onExit}
          className="shrink-0 rounded-md border border-[#B45309]/35 bg-white px-3 py-1.5 text-[12.5px] font-medium text-[#7C3E06] transition-colors hover:border-[#B45309]/55"
        >
          ← Back to my setup
        </button>
      </div>

      <div className="flex items-baseline justify-between gap-3.5">
        <h1 className="m-0 text-2xl tracking-[-0.03em]">Escalations</h1>
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-gryphon-faint">
          <span className="size-1.5 rounded-full bg-[#22C55E]" />
          sample · {nowLabel}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-5 font-mono text-xs text-gryphon-faint">
        <span>
          <strong className="font-medium text-gryphon-ink">51s</strong> median
          rescue
        </span>
        <span>
          <strong className="font-medium text-gryphon-ink">27</strong> runs saved
        </span>
        <span>
          <strong className="font-medium text-gryphon-ink">4m 12s</strong> human
          time this week
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ["one open", "One open"],
            ["queue", "Queue"],
            ["all clear", "All clear"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={
              mode === value
                ? "h-7 rounded border border-gryphon-ink/20 bg-gryphon-ink/5 px-2.5 font-mono text-[11px]"
                : "h-7 rounded border border-transparent px-2.5 font-mono text-[11px] text-gryphon-faint hover:border-gryphon-ink/12"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {!hasOpen ? (
        <div className="mt-[22px] flex items-center gap-3 rounded-lg border border-gryphon-ink/9 bg-white p-4">
          <span className="size-2 shrink-0 rounded-full bg-[#22C55E]" />
          <span className="min-w-0 flex-1 text-[13.5px] leading-normal text-gryphon-muted">
            <strong className="font-medium text-gryphon-ink">
              All sessions healthy.
            </strong>{" "}
            Nothing needs you — escalations will land here and in{" "}
            <span className="font-mono text-xs">#agents-alerts</span> the moment
            auth breaks.
          </span>
          <span className="shrink-0 font-mono text-[11px] text-[#A6A9AF]">
            last escalation 2h ago
          </span>
        </div>
      ) : (
        <>
          <div className="mt-[22px] overflow-hidden rounded-lg border border-[rgba(180,83,9,.4)] bg-white shadow-[0_18px_44px_-32px_rgba(180,83,9,.5)]">
            <div className="flex items-center gap-2.5 border-b border-[rgba(180,83,9,.25)] bg-[#FDF6EC] px-4 py-2.5">
              <span className="size-2 shrink-0 animate-gpulse rounded-full bg-[#D97706]" />
              <span className="text-[13px] font-medium text-[#7C3E06]">
                Needs you now
              </span>
              <span className="ml-auto font-mono text-[11.5px] text-gryphon-amber">
                paused {pausedFor}
              </span>
            </div>
            <div className="flex flex-col gap-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3.5">
                <div className="min-w-0">
                  <div className="text-base font-medium leading-snug tracking-[-0.01em]">
                    Stripe · 2FA verification code
                  </div>
                  <div className="mt-1 font-mono text-xs leading-[1.6] text-gryphon-faint">
                    agent <span className="text-[#3A3D44]">outreach-v3</span> ·
                    run #41 · sent to{" "}
                    <span className="text-[#3A3D44]">#agents-alerts</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    className="inline-flex h-[34px] cursor-pointer items-center rounded-[5px] bg-gryphon-ink px-4 text-[13px] font-medium text-white transition-colors hover:bg-gryphon-blue"
                  >
                    Open Live View
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("all clear")}
                    className="inline-flex h-[34px] cursor-pointer items-center rounded-[5px] border border-gryphon-ink/16 px-4 text-[13px] font-medium transition-colors hover:border-gryphon-ink/40"
                  >
                    Mark resolved
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-gryphon-ink/7 bg-[#FAFAF9] px-3 py-2 text-xs leading-normal text-gryphon-muted">
                <span className="size-3.5 shrink-0 rounded-[3px] border-[1.4px] border-[#A6A9AF]" />
                The run is holding, not failed — the session stays warm while you
                clear the wall.
              </div>
            </div>
          </div>

          {queue.map((q) => (
            <div
              key={q.title}
              className="mt-2.5 grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-lg border border-gryphon-ink/10 bg-white px-4 py-3"
            >
              <span className="size-[7px] animate-gpulse rounded-full bg-[#D97706]" />
              <span className="min-w-0">
                <span className="block text-[13.5px] font-medium leading-tight">
                  {q.title}
                </span>
                <span className="mt-0.5 block font-mono text-[10.5px] leading-snug text-[#A6A9AF]">
                  {q.meta}
                </span>
              </span>
              <span className="font-mono text-[11px] text-gryphon-amber">
                paused {q.for}
              </span>
              <span className="cursor-pointer font-mono text-xs text-gryphon-faint hover:text-gryphon-blue">
                live view →
              </span>
            </div>
          ))}
        </>
      )}

      <div className="mt-6 flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-sm font-medium tracking-[-0.01em] text-gryphon-muted">
          Resolved
        </h2>
        <span className="font-mono text-[11px] text-[#A6A9AF]">last 7 days</span>
      </div>
      <div className="mt-2.5 border-t border-gryphon-ink/10">
        {resolved.map((esc) => (
          <div
            key={esc.title + esc.when}
            className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-1.5 border-b border-gryphon-ink/6 py-3"
          >
            <span className="min-w-0 text-[13.5px] leading-snug">
              {esc.title}
            </span>
            <span className="font-mono text-[11px] text-gryphon-faint">
              {esc.by}
            </span>
            <span className="min-w-[52px] text-right font-mono text-[11px] text-[#A6A9AF]">
              {esc.when}
            </span>
            <span className="col-span-full font-mono text-[10.5px] leading-snug text-[#B9BCC3]">
              {esc.meta}
            </span>
          </div>
        ))}
      </div>

      <div
        id="sessions"
        className="mt-8 flex items-baseline justify-between gap-3"
      >
        <h2 className="m-0 text-xl tracking-[-0.025em]">Sessions</h2>
        <span className="font-mono text-[11px] text-[#A6A9AF]">
          one authenticated context per site · synced 12s ago
        </span>
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-gryphon-ink/9 bg-white">
        <div className="grid grid-cols-[1fr_130px_70px_90px] gap-2.5 border-b border-gryphon-ink/8 px-4 pt-2 pb-1.5 font-mono text-[10px] tracking-[0.1em] text-[#B9BCC3]">
          <span>SITE</span>
          <span>STATUS</span>
          <span className="text-right">LAST USED</span>
          <span />
        </div>
        {sites.map((site) => (
          <div
            key={site.name}
            className="grid grid-cols-[1fr_130px_70px_90px] items-center gap-2.5 border-b border-gryphon-ink/5 px-4 py-2.5 last:border-0 hover:bg-gryphon-ink/[0.02]"
            style={{
              background: site.bg,
              boxShadow: site.edge ? "inset 2px 0 0 #B45309" : undefined,
            }}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-[5px] text-[10px] font-medium text-white"
                style={{ background: site.brand }}
              >
                {site.initial}
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] leading-tight">
                  {site.name}
                </span>
                <span
                  className="block font-mono text-[9.5px] leading-normal"
                  style={{ color: site.subFg }}
                >
                  {site.sub}
                </span>
              </span>
            </span>
            <span
              className="inline-flex items-center gap-1.5 text-xs"
              style={{ color: site.fg }}
            >
              <span
                className={`size-1.5 rounded-full ${site.anim ? "animate-gpulse" : ""}`}
                style={{ background: site.dot }}
              />
              {site.status}
            </span>
            <span
              className="text-right font-mono text-[11px]"
              style={{ color: site.usedFg }}
            >
              {site.used}
            </span>
            <span
              className="cursor-pointer text-right font-mono text-[11.5px] hover:text-gryphon-blue!"
              style={{ color: site.actionFg }}
            >
              {site.action}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-2 bg-[#FAFAF9] px-4 py-2.5 font-mono text-[11px] text-[#A6A9AF]">
          <span>
            {hasOpen ? "6 sites · 1 needs you" : "6 sites · all healthy"}
          </span>
          <span className="cursor-pointer text-gryphon-faint hover:text-gryphon-blue">
            + connect a site
          </span>
        </div>
      </div>
    </div>
  );
}
