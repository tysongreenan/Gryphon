"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { WaitlistInline } from "@/components/marketing/waitlist-inline";

const BLUE = "#1D4ED8";
const AMBER = "#B45309";
const GREEN = "#15803D";

const LINES = [
  {
    at: 1,
    t: "02:41:05",
    msg: "→ task: pull july invoices from stripe",
    c: "#8A8D94",
  },
  {
    at: 1,
    t: "02:41:07",
    msg: '→ gryphon.get_session("stripe")',
    c: BLUE,
  },
  {
    at: 2,
    t: "02:41:07",
    msg: "← needs_auth — 2FA wall · run paused, not failed",
    c: AMBER,
  },
  {
    at: 3,
    t: "02:41:08",
    msg: "→ slack ping · signed live view · esc_8f31",
    c: "#3A3D44",
  },
  {
    at: 4,
    t: "07:12:04",
    msg: "← resolved by a human in 00:54 · ctx stored",
    c: GREEN,
  },
  {
    at: 5,
    t: "07:12:04",
    msg: "→ session restored · run #41 resumed",
    c: BLUE,
  },
  {
    at: 6,
    t: "07:16:22",
    msg: "✓ 38 invoices pulled · 0 lines changed",
    c: "#0C0D10",
  },
] as const;

const DURS = [1100, 1400, 1800, 2300, 2000, 1800, 3800];

function HeroRays() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute top-[40%] left-[64%] size-0">
        {(
          [
            { a: "203deg", w: 1100, h: 3, blur: 2, delay: "0s", dur: "6s", c: "rgba(29,78,216,0),rgba(29,78,216,.4),rgba(96,165,250,.04)" },
            { a: "211deg", w: 1150, h: 2, blur: 1, delay: "0.9s", dur: "5.2s", c: "rgba(59,130,246,0),rgba(59,130,246,.5),rgba(191,219,254,.04)" },
            { a: "219deg", w: 980, h: 8, blur: 8, delay: "1.3s", dur: "8.4s", c: "rgba(96,165,250,0),rgba(96,165,250,.22),rgba(219,234,254,.03)" },
            { a: "27deg", w: 1300, h: 4, blur: 2, delay: "0.1s", dur: "6.2s", c: "rgba(29,78,216,.45),rgba(59,130,246,.3),rgba(191,219,254,0)" },
            { a: "36deg", w: 1150, h: 8, blur: 7, delay: "0.6s", dur: "7.8s", c: "rgba(37,99,235,.3),rgba(96,165,250,.2),rgba(219,234,254,0)" },
          ] as const
        ).map((r) => (
          <div
            key={r.a}
            className="absolute top-0 left-0 origin-left animate-gshimmer"
            style={
              {
                "--a": r.a,
                width: r.w,
                height: r.h,
                filter: `blur(${r.blur}px)`,
                animationDuration: r.dur,
                animationDelay: r.delay,
                background: `linear-gradient(90deg,${r.c})`,
                transform: `translateY(-50%) rotate(${r.a})`,
              } as React.CSSProperties
            }
          />
        ))}
        <div className="absolute top-0 left-0 size-[200px] animate-gstar bg-[radial-gradient(circle,rgba(191,219,254,.6),rgba(219,234,254,.2)_40%,transparent_70%)]" />
      </div>
    </div>
  );
}

export function HeroDemo() {
  const [step, setStep] = useState(0);

  const restart = useCallback(() => {
    setStep(0);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setStep((s) => (s + 1) % 7);
    }, DURS[step]);
    return () => clearTimeout(t);
  }, [step]);

  const heroLog = LINES.filter((l) => l.at <= step);
  const st =
    step <= 1
      ? (["running", GREEN, "#22C55E"] as const)
      : step <= 3
        ? (["paused · needs auth", AMBER, "#D97706"] as const)
        : step === 4
          ? (["resolving", AMBER, "#D97706"] as const)
          : step === 5
            ? (["running", GREEN, "#22C55E"] as const)
            : (["done", BLUE, BLUE] as const);

  const toastOn = step === 3 || step === 4;
  const paused = step >= 2 && step <= 4;
  const done = step === 6;
  const prog =
    step < 2 ? "6%" : step < 5 ? "13%" : step === 5 ? "72%" : "100%";
  const hint =
    step === 0
      ? "2:41 AM — a run is about to hit a 2FA wall"
      : step <= 4
        ? "paused, escalated, never failed"
        : "resumed on its own — the whole loop, live";
  const clock = heroLog.length ? heroLog[heroLog.length - 1].t : "02:41:04";

  const banner = done
    ? {
        o: 1,
        text: "38/38 invoices · human time 00:54 · next run starts warm.",
        fg: BLUE,
        dot: BLUE,
        border: "rgba(29,78,216,.35)",
        bg: "rgba(29,78,216,.05)",
      }
    : paused
      ? {
          o: 1,
          text: "Run held at 2:41 AM — session and state kept warm. Nothing is lost.",
          fg: AMBER,
          dot: "#D97706",
          border: "rgba(180,83,9,.3)",
          bg: "rgba(180,83,9,.06)",
        }
      : {
          o: 0,
          text: "Run held at 2:41 AM — session and state kept warm. Nothing is lost.",
          fg: AMBER,
          dot: "#D97706",
          border: "rgba(180,83,9,.3)",
          bg: "rgba(180,83,9,.06)",
        };

  return (
    <section className="relative overflow-hidden border-b border-gryphon-ink/8">
      <HeroRays />
      <div className="relative mx-auto max-w-[1320px] px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-24">
        <div className="grid items-center gap-9 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="text-[15px] text-gryphon-muted">
              Infrastructure for browser agents
            </div>
            <h1 className="mt-6 max-w-[13ch] text-[clamp(42px,5.6vw,76px)] leading-[0.99] tracking-[-0.045em] text-balance">
              Agents that never die on a login.
            </h1>
            <p className="mt-6 max-w-[42ch] text-[clamp(16px,1.6vw,18.5px)] leading-[1.55] text-gryphon-muted text-pretty">
              Gryphon holds the authenticated session, and pulls in a human the
              moment auth breaks. Runs pause for a minute instead of dying
              overnight.
            </p>
            <div className="mt-8 max-w-[520px]">
              <WaitlistInline source="hero" />
              <p className="mt-3.5 text-[13.5px] leading-normal text-gryphon-faint">
                Free during beta · MCP + REST · no card, no call
              </p>
            </div>
          </div>

          <div className="relative pt-6">
            <div className="relative overflow-hidden rounded-[10px] border border-gryphon-ink/11 bg-white shadow-[0_32px_70px_-42px_rgba(12,13,16,.65)]">
              <div className="flex items-center gap-2 border-b border-gryphon-ink/9 bg-linear-to-b from-[#F8F8F6] to-[#F0F0EE] px-3.5 py-2.5">
                <span className="size-2.5 rounded-full bg-[#FF5F57]" />
                <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="size-2.5 rounded-full bg-[#28C840]" />
                <span className="ml-1.5 font-mono text-[11px] text-[#8A8D94]">
                  outreach-v3 — run #41
                </span>
                <span
                  className="ml-auto inline-flex h-6 items-center gap-1.5 rounded-xl border border-gryphon-ink/10 bg-white px-2.5 font-mono text-[11px] transition-colors duration-400"
                  style={{ color: st[1] }}
                >
                  <span
                    className="size-1.5 animate-gpulse rounded-full"
                    style={{ background: st[2] }}
                  />
                  {st[0]}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-gryphon-ink/8 px-4 py-3">
                <span className="text-sm font-medium text-[#22242A]">
                  Pull July invoices from Stripe
                </span>
                <span className="font-mono text-[11px] text-[#A6A9AF]">
                  {clock}
                </span>
              </div>

              <div className="flex h-[262px] flex-col gap-2 overflow-hidden p-4">
                <div className="flex gap-3.5">
                  <span className="w-[66px] shrink-0 font-mono text-[11.5px] leading-[1.7] text-[#C4C7CC]">
                    02:41:04
                  </span>
                  <span className="font-mono text-[12.5px] leading-[1.6] text-[#3A3D44]">
                    $ python outreach_agent.py
                  </span>
                </div>
                {heroLog.map((line) => (
                  <div
                    key={`${line.t}-${line.msg}`}
                    className="flex animate-gfade gap-3.5"
                  >
                    <span className="w-[66px] shrink-0 font-mono text-[11.5px] leading-[1.7] text-[#C4C7CC]">
                      {line.t}
                    </span>
                    <span
                      className="min-w-0 font-mono text-[12.5px] leading-[1.6]"
                      style={{ color: line.c }}
                    >
                      {line.msg}
                    </span>
                  </div>
                ))}
                {step < 6 && (
                  <div className="flex gap-3.5">
                    <span className="w-[66px] shrink-0" />
                    <span className="inline-block h-3.5 w-[7px] animate-gblink bg-gryphon-blue" />
                  </div>
                )}
              </div>

              <div
                className="mx-4 flex h-[58px] items-center gap-2.5 rounded-lg border px-3 transition-all duration-500"
                style={{
                  opacity: banner.o,
                  borderColor: banner.border,
                  background: banner.bg,
                }}
              >
                <span
                  className="size-[7px] shrink-0 animate-gpulse rounded-full"
                  style={{ background: banner.dot }}
                />
                <span
                  className="min-w-0 text-[12.5px] leading-snug"
                  style={{ color: banner.fg }}
                >
                  {banner.text}
                </span>
              </div>

              <div className="flex items-center gap-3 px-4 pt-3.5 pb-4">
                <span className="font-mono text-[11px] text-[#8A8D94]">
                  2:41 AM
                </span>
                <span className="h-1 flex-1 overflow-hidden rounded-sm bg-gryphon-ink/8">
                  <span
                    className="block h-full bg-linear-to-r from-gryphon-blue to-[#60A5FA] transition-[width] duration-700 ease-out"
                    style={{ width: prog }}
                  />
                </span>
                <span className="font-mono text-[11px] text-[#8A8D94]">
                  7:12 AM
                </span>
              </div>
            </div>

            {/* Slack toast */}
            <div
              className="pointer-events-none absolute top-[-4px] right-0 z-3 w-[min(330px,88%)] overflow-hidden rounded-[10px] border border-gryphon-ink/12 bg-white shadow-[0_28px_60px_-30px_rgba(12,13,16,.55)] transition-all duration-500"
              style={{
                transform: toastOn ? "translateY(0)" : "translateY(-14px)",
                opacity: toastOn ? 1 : 0,
              }}
            >
              <div className="flex items-center justify-between border-b border-gryphon-ink/8 px-3 py-2">
                <span className="flex items-baseline gap-1.5">
                  <span className="text-[13px] text-[#A6A9AF]">#</span>
                  <span className="text-[12.5px] font-semibold text-[#1D1C1D]">
                    agents-alerts
                  </span>
                </span>
                <span className="text-[10.5px] text-[#8A8D94]">Slack</span>
              </div>
              <div className="flex items-start gap-2.5 p-3">
                <Image
                  src="/brand/gryphon-mark.png"
                  alt=""
                  width={32}
                  height={32}
                  className="size-8 shrink-0 rounded-md object-contain"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <span className="text-[13px] font-bold text-[#1D1C1D]">
                      Gryphon
                    </span>
                    <span className="rounded-sm bg-black/8 px-1 py-0.5 text-[8.5px] font-bold tracking-wide text-[#616061]">
                      APP
                    </span>
                    <span className="text-[10.5px] text-[#8A8D94]">2:41 AM</span>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-normal text-[#1D1C1D]">
                    Stripe wants a 2FA code —{" "}
                    <span className="font-mono text-[11.5px] text-gryphon-amber">
                      outreach-v3
                    </span>{" "}
                    is paused, not failed.
                  </p>
                  <div className="mt-2 flex gap-1.5">
                    <span className="inline-flex h-7 items-center rounded bg-gryphon-ink px-3 text-[11.5px] font-semibold text-white">
                      Open Live View
                    </span>
                    <span className="inline-flex h-7 items-center rounded border border-gryphon-ink/18 px-3 text-[11.5px] font-semibold text-[#1D1C1D]">
                      Later
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="font-mono text-xs leading-normal text-[#8A8D94]">
                {hint}
              </span>
              <button
                type="button"
                onClick={restart}
                className="inline-flex h-[30px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-gryphon-ink/16 bg-white px-3.5 font-mono text-xs text-[#3A3D44] transition-colors hover:border-gryphon-blue hover:text-gryphon-blue"
              >
                ↻ replay
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
