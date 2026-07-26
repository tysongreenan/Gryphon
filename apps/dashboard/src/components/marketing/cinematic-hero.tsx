"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { GryphonMark } from "@/components/brand/gryphon-mark";
import { WaitlistInline } from "@/components/marketing/waitlist-inline";
import { cn } from "@/lib/utils";

/**
 * Phase of the Gryphon loop shown in the hero demos.
 * 0 idle → 1 agent asks → 2 needs_auth → 3 human notified → 4 resolving → 5 ready
 */
const PHASE_MS = [1600, 1800, 2200, 2400, 2000, 2800] as const;

const SITES = [
  { name: "LinkedIn", status: "ready" as const, ctx: "bb_ctx_4a9c" },
  { name: "Gmail", status: "ready" as const, ctx: "bb_ctx_1d02" },
  { name: "Stripe", status: "auth" as const, ctx: "waiting on you" },
  { name: "Shopify", status: "ready" as const, ctx: "bb_ctx_77b1" },
];

export function CinematicHero() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setTimeout(
      () => setPhase((p) => (p + 1) % PHASE_MS.length),
      PHASE_MS[phase],
    );
    return () => clearTimeout(t);
  }, [phase]);

  const paused = phase >= 2 && phase <= 4;
  const resolved = phase === 5;
  const slackOn = phase === 3 || phase === 4;
  const agentStatus = resolved
    ? { label: "running", color: "#4ADE80" }
    : paused
      ? { label: "paused · needs_auth", color: "#F59E0B" }
      : phase === 0
        ? { label: "starting", color: "#60A5FA" }
        : { label: "running", color: "#4ADE80" };

  const stripeStatus =
    phase <= 1 ? "ready" : phase === 5 ? "ready" : "auth";

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#07080A]">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/brand/hero-cinematic.jpg"
          alt=""
          fill
          priority
          className="object-cover object-[78%_center] scale-[1.02]"
          sizes="100vw"
        />
        {/* Readability washes — keep gryphon visible on the right */}
        <div className="absolute inset-0 bg-linear-to-r from-[#07080A] via-[#07080A]/92 to-[#07080A]/35 sm:via-[#07080A]/88 sm:to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-[#07080A] via-[#07080A]/20 to-[#07080A]/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_55%,rgba(29,78,216,0.18),transparent_55%)]" />
      </div>

      {/* Nav */}
      <header className="relative z-30">
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link href="/concepts" className="inline-flex items-center gap-2.5">
            <GryphonMark
              className="size-8 brightness-0 invert"
              priority
              alt=""
            />
            <span className="text-lg font-medium tracking-[-0.03em] text-white">
              Gryphon
            </span>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <span className="hidden font-mono text-[11px] tracking-wide text-white/40 sm:inline">
              concept b · cinematic
            </span>
            <a
              href="#join"
              className="rounded-full bg-white px-5 py-2.5 text-[13.5px] font-medium text-black transition-colors hover:bg-[#93C5FD]"
            >
              Request access
            </a>
          </nav>
        </div>
      </header>

      {/* Content grid */}
      <div className="relative z-20 mx-auto grid min-h-[calc(100svh-72px)] max-w-[1320px] items-center gap-10 px-4 pb-16 pt-6 sm:px-6 sm:pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-8 lg:px-10 lg:pb-24 lg:pt-4">
        {/* Copy column */}
        <div className="relative max-w-[540px] lg:pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
            <span className="size-1.5 animate-gpulse rounded-full bg-[#60A5FA]" />
            <span className="font-mono text-[11px] tracking-[0.08em] text-[#93C5FD]">
              RELIABILITY FOR BROWSER AGENTS
            </span>
          </div>

          <h1 className="mt-6 text-[clamp(40px,5.8vw,72px)] leading-[0.98] tracking-[-0.035em] text-white text-balance">
            Agents that never die on a login.
          </h1>

          <p className="mt-5 max-w-[40ch] text-[clamp(15.5px,1.5vw,18px)] leading-[1.55] text-white/68 text-pretty">
            Gryphon holds the authenticated session — and pulls a human the
            moment auth breaks. Runs pause for a minute instead of dying
            overnight.
          </p>

          {/* Idea chips — static product truths */}
          <div className="mt-7 flex flex-wrap gap-2">
            {[
              { t: "Persistent sessions", c: "border-white/12 bg-white/5 text-white/75" },
              { t: "Human-in-the-loop", c: "border-amber-500/25 bg-amber-500/10 text-amber-100/90" },
              { t: "Clean handback", c: "border-emerald-500/20 bg-emerald-500/10 text-emerald-100/90" },
            ].map((chip) => (
              <span
                key={chip.t}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12.5px] tracking-tight backdrop-blur-sm",
                  chip.c,
                )}
              >
                {chip.t}
              </span>
            ))}
          </div>

          <div className="mt-8 max-w-[460px]">
            <WaitlistInline
              source="concept-b-hero"
              submitLabel="Join the waitlist →"
              className="[&_input]:rounded-full [&_input]:border-white/15 [&_input]:bg-white/8 [&_input]:text-white [&_input]:placeholder:text-white/35 [&_input]:backdrop-blur-md [&_button]:rounded-full [&_button]:bg-white [&_button]:text-black [&_button:hover]:bg-[#93C5FD]"
            />
            <p className="mt-3 text-[12.5px] text-white/38">
              Free during beta · MCP + REST · Browserbase-native
            </p>
          </div>
        </div>

        {/* Visual demo stage */}
        <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none lg:justify-self-end">
          <div className="relative aspect-[4/5] w-full sm:aspect-[5/4] lg:aspect-[11/12] lg:min-h-[520px]">
            {/* Glow under demos */}
            <div className="pointer-events-none absolute top-[42%] right-[8%] size-[55%] rounded-full bg-[#1D4ED8]/18 blur-[80px]" />

            {/* Connected sites card */}
            <div
              className={cn(
                "absolute top-[2%] right-0 z-10 w-[min(280px,72%)] overflow-hidden rounded-xl border border-white/12 bg-[#0E1014]/82 shadow-[0_24px_60px_-20px_rgba(0,0,0,.7)] backdrop-blur-xl transition-all duration-700",
                phase >= 1 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-70",
              )}
            >
              <div className="flex items-center justify-between border-b border-white/8 px-3.5 py-2.5">
                <span className="text-[12.5px] font-medium text-white/90">
                  Connected sites
                </span>
                <span className="font-mono text-[10px] text-white/35">
                  live
                </span>
              </div>
              <div className="divide-y divide-white/6">
                {SITES.map((site) => {
                  const isStripe = site.name === "Stripe";
                  const st = isStripe ? stripeStatus : site.status;
                  const needs = st === "auth";
                  return (
                    <div
                      key={site.name}
                      className={cn(
                        "flex items-center gap-2.5 px-3.5 py-2.5 transition-colors duration-500",
                        needs && "bg-amber-500/8",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          needs
                            ? "animate-gpulse bg-[#F59E0B]"
                            : "bg-[#4ADE80]",
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] text-white/90">
                          {site.name}
                        </span>
                        <span
                          className={cn(
                            "block font-mono text-[10px]",
                            needs ? "text-amber-400/90" : "text-white/30",
                          )}
                        >
                          {needs ? "waiting on you" : site.ctx}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "text-[11px]",
                          needs ? "text-amber-400" : "text-emerald-400/90",
                        )}
                      >
                        {needs ? "Needs auth" : "Ready"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Agent run card */}
            <div
              className={cn(
                "absolute top-[38%] left-0 z-20 w-[min(340px,88%)] overflow-hidden rounded-xl border bg-[#0C0E12]/88 shadow-[0_28px_70px_-24px_rgba(0,0,0,.75)] backdrop-blur-xl transition-all duration-500 sm:top-[34%]",
                paused
                  ? "border-amber-500/35"
                  : resolved
                    ? "border-emerald-500/30"
                    : "border-white/12",
              )}
            >
              <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.03] px-3.5 py-2.5">
                <span className="size-2 rounded-full bg-[#FF5F57]" />
                <span className="size-2 rounded-full bg-[#FEBC2E]" />
                <span className="size-2 rounded-full bg-[#28C840]" />
                <span className="ml-1 font-mono text-[11px] text-white/40">
                  outreach-v3 · run #41
                </span>
                <span
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2 py-0.5 font-mono text-[10px]"
                  style={{ color: agentStatus.color }}
                >
                  <span
                    className="size-1.5 animate-gpulse rounded-full"
                    style={{ background: agentStatus.color }}
                  />
                  {agentStatus.label}
                </span>
              </div>

              <div className="space-y-2 px-3.5 py-3.5 font-mono text-[11.5px] leading-relaxed">
                <DemoLine
                  show={phase >= 0}
                  dim
                  text='$ python outreach_agent.py'
                />
                <DemoLine
                  show={phase >= 1}
                  color="#93C5FD"
                  text='→ gryphon.get_session("stripe")'
                />
                <DemoLine
                  show={phase >= 2 && phase < 5}
                  color="#F59E0B"
                  text="← needs_auth — 2FA wall · run paused"
                />
                <DemoLine
                  show={phase === 3 || phase === 4}
                  color="#A1A1AA"
                  text="→ slack ping · signed live view"
                />
                <DemoLine
                  show={phase === 5}
                  color="#4ADE80"
                  text="✓ resolved · session restored · resumed"
                />
                {phase < 5 && (
                  <span className="inline-block h-3.5 w-1.5 animate-gblink bg-[#60A5FA]" />
                )}
              </div>

              {/* Status banner */}
              <div
                className={cn(
                  "mx-3 mb-3 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-[11.5px] leading-snug transition-all duration-500",
                  resolved
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100/90"
                    : paused
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-100/90"
                      : "border-white/8 bg-white/[0.03] text-white/45",
                )}
              >
                <span
                  className={cn(
                    "mt-1 size-1.5 shrink-0 rounded-full",
                    resolved
                      ? "bg-[#4ADE80]"
                      : paused
                        ? "animate-gpulse bg-[#F59E0B]"
                        : "bg-white/30",
                  )}
                />
                <span>
                  {resolved
                    ? "38 invoices pulled · human time 00:54 · next run warm."
                    : paused
                      ? "Run held at 2:41 AM — session and state kept warm. Nothing lost."
                      : "Awaiting authenticated Stripe session…"}
                </span>
              </div>
            </div>

            {/* Slack escalation toast */}
            <div
              className={cn(
                "absolute right-0 bottom-[6%] z-30 w-[min(300px,82%)] overflow-hidden rounded-xl border border-white/12 bg-white shadow-[0_28px_60px_-20px_rgba(0,0,0,.65)] transition-all duration-500 sm:bottom-[10%]",
                slackOn
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-4 opacity-0",
              )}
            >
              <div className="flex items-center justify-between border-b border-black/6 px-3 py-2">
                <span className="flex items-baseline gap-1">
                  <span className="text-[12px] text-[#A6A9AF]">#</span>
                  <span className="text-[12px] font-semibold text-[#1D1C1D]">
                    agents-alerts
                  </span>
                </span>
                <span className="text-[10px] text-[#8A8D94]">Slack · now</span>
              </div>
              <div className="flex items-start gap-2.5 p-3">
                <Image
                  src="/brand/gryphon-mark.png"
                  alt=""
                  width={30}
                  height={30}
                  className="size-[30px] shrink-0 rounded-md object-contain"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <span className="text-[12.5px] font-bold text-[#1D1C1D]">
                      Gryphon
                    </span>
                    <span className="rounded-sm bg-black/8 px-1 py-px text-[8px] font-bold tracking-wide text-[#616061]">
                      APP
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] leading-snug text-[#1D1C1D]">
                    Stripe wants a 2FA code —{" "}
                    <span className="font-mono text-[11px] text-[#B45309]">
                      outreach-v3
                    </span>{" "}
                    is paused, not failed.
                  </p>
                  <div className="mt-2 flex gap-1.5">
                    <span className="inline-flex h-7 items-center rounded-md bg-[#0C0D10] px-2.5 text-[11px] font-semibold text-white">
                      Open Live View
                    </span>
                    <span className="inline-flex h-7 items-center rounded-md border border-black/12 px-2.5 text-[11px] font-semibold text-[#1D1C1D]">
                      Later
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating metric pills */}
            <div
              className={cn(
                "absolute top-[22%] left-[4%] z-10 hidden rounded-full border border-white/12 bg-black/50 px-3 py-1.5 font-mono text-[10.5px] text-white/70 backdrop-blur-md transition-all duration-700 sm:block",
                phase >= 2 ? "opacity-100" : "opacity-0",
              )}
            >
              policy: pause, don&apos;t fail
            </div>
            <div
              className={cn(
                "absolute right-[2%] bottom-[42%] z-10 hidden rounded-full border px-3 py-1.5 font-mono text-[10.5px] backdrop-blur-md transition-all duration-700 sm:block",
                resolved
                  ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                  : "border-white/10 bg-black/40 text-white/50",
              )}
            >
              {resolved ? "ctx stored · bb_ctx_8f31" : "context: pending"}
            </div>

            {/* Phase scrubber / loop hint */}
            <div className="absolute bottom-0 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 backdrop-blur-md">
              {PHASE_MS.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    i === phase
                      ? "w-5 bg-[#60A5FA]"
                      : i < phase
                        ? "w-1.5 bg-white/40"
                        : "w-1.5 bg-white/15",
                  )}
                />
              ))}
              <span className="ml-1 font-mono text-[10px] text-white/40">
                the loop
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom idea strip — visual promise bar */}
      <div className="relative z-20 border-t border-white/8 bg-black/30 backdrop-blur-md">
        <div className="mx-auto grid max-w-[1320px] divide-y divide-white/8 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            {
              k: "01",
              label: "get_session",
              v: phase >= 1 ? "asked" : "idle",
              active: phase >= 1,
            },
            {
              k: "02",
              label: "needs_auth → human",
              v: slackOn ? "notified" : paused ? "holding" : "—",
              active: paused,
            },
            {
              k: "03",
              label: "handback",
              v: resolved ? "warm session" : "—",
              active: resolved,
            },
          ].map((row) => (
            <div
              key={row.k}
              className="flex items-center gap-3 px-5 py-3.5 sm:px-8"
            >
              <span className="font-mono text-[11px] text-white/30">{row.k}</span>
              <span className="text-[13px] text-white/70">{row.label}</span>
              <span
                className={cn(
                  "ml-auto font-mono text-[11px] transition-colors duration-500",
                  row.active ? "text-[#93C5FD]" : "text-white/25",
                )}
              >
                {row.v}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoLine({
  show,
  text,
  color,
  dim,
}: {
  show: boolean;
  text: string;
  color?: string;
  dim?: boolean;
}) {
  if (!show) return null;
  return (
    <div
      className={cn(
        "animate-gfade",
        dim ? "text-white/35" : "",
      )}
      style={color ? { color } : undefined}
    >
      {text}
    </div>
  );
}
