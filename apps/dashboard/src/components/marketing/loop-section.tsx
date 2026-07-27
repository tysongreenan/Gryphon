"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const BLUE = "#1D4ED8";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function LoopSection() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const measure = () => {
      setScale(Math.min(1.2, el.clientWidth / 1180));
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => setActive(e.isIntersecting));
      },
      { threshold: 0.3 },
    );
    io.observe(el);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!active || reduced) return;
    const id = setInterval(() => setStep((s) => (s + 1) % 4), 2000);
    return () => clearInterval(id);
  }, [active, reduced]);

  const baseShadow = "0 24px 50px -32px rgba(12,13,16,.7)";
  const ring = ", 0 0 0 4px rgba(29,78,216,.16)";
  // Reduced motion: no step cycle — equal static cards, no highlight pulse
  const border = (i: number) =>
    !reduced && step === i ? BLUE : "rgba(12,13,16,.11)";
  const shadow = (i: number) =>
    !reduced && step === i ? baseShadow + ring : baseShadow;
  const phoneBase = "0 26px 54px -30px rgba(12,13,16,.85)";
  const phoneShadow =
    !reduced && step === 2
      ? phoneBase + ", 0 0 0 4px rgba(29,78,216,.3)"
      : phoneBase;

  return (
    <section id="loop" className="border-b border-gryphon-ink/8 bg-white">
      <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-24">
        <div className="flex flex-wrap items-baseline justify-between gap-3.5">
          <h2 className="m-0 max-w-[20ch] text-[clamp(30px,5vw,58px)] leading-[1.05] tracking-[-0.04em] text-balance">
            A loop that can&apos;t end dead.
          </h2>
          <span className="font-mono text-[13px] text-gryphon-faint">
            runtime trace · plays as you watch
          </span>
        </div>

        <div
          ref={canvasRef}
          className="mt-9 border border-gryphon-ink/10 bg-linear-to-b from-[#FCFCFB] to-[#F6F6F4]"
        >
          <div
            className="relative w-full overflow-hidden"
            style={{ height: Math.round(620 * scale) }}
          >
            <div
              className="absolute top-0 left-0 h-[620px] w-[1180px] origin-top-left"
              style={{ transform: `scale(${scale})` }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(12,13,16,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(12,13,16,.028) 1px,transparent 1px)",
                  backgroundSize: "38px 38px",
                }}
              />
              <svg
                viewBox="0 0 1180 620"
                className="absolute inset-0 h-[620px] w-[1180px]"
              >
                <path
                  d="M 230 165 H 950 V 455 H 230 Z"
                  fill="none"
                  stroke="rgba(12,13,16,.13)"
                  strokeWidth="1.5"
                />
                <path
                  d="M 230 165 H 950 V 455 H 230 Z"
                  fill="none"
                  stroke="rgba(29,78,216,.55)"
                  strokeWidth="1.5"
                  strokeDasharray="7 9"
                  className={reduced ? undefined : "animate-gdashflow"}
                />
                <circle cx="230" cy="165" r="3.5" fill="#1D4ED8" />
                <circle cx="950" cy="165" r="3.5" fill="#1D4ED8" />
                <circle cx="950" cy="455" r="3.5" fill="#1D4ED8" />
                <circle cx="230" cy="455" r="3.5" fill="#1D4ED8" />
              </svg>

              {!reduced && (
                <div
                  className="absolute top-0 left-0 size-[11px] rounded-full bg-gryphon-blue shadow-[0_0_16px_4px_rgba(59,130,246,.5)]"
                  style={
                    {
                      margin: "-5.5px 0 0 -5.5px",
                      offsetPath: "path('M 230 165 H 950 V 455 H 230 Z')",
                      animation: "gorbit 8s linear infinite",
                    } as React.CSSProperties
                  }
                />
              )}

              {/* Edge labels */}
              <div className="absolute top-[165px] left-[590px] flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-gryphon-ink/12 bg-white px-3 py-1.5 font-mono text-[11.5px] text-[#3A3D44]">
                <span className="size-[5px] rounded-full bg-gryphon-blue" />
                get_session(&quot;stripe&quot;)
              </div>
              <div className="absolute top-[310px] left-[950px] flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-gryphon-ink/12 bg-white px-3 py-1.5 font-mono text-[11.5px] text-gryphon-amber">
                <span className="size-[5px] animate-gpulse rounded-full bg-[#D97706]" />
                needs_auth → push
              </div>
              <div className="absolute top-[455px] left-[590px] flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-gryphon-ink/12 bg-white px-3 py-1.5 font-mono text-[11.5px] text-[#3A3D44]">
                <span className="size-[5px] rounded-full bg-gryphon-blue" />
                context stored
              </div>
              <div className="absolute top-[310px] left-[230px] flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-gryphon-ink/12 bg-white px-3 py-1.5 font-mono text-[11.5px] text-gryphon-green">
                <span className="size-[5px] rounded-full bg-[#22C55E]" />
                connect_url
              </div>

              {/* Center */}
              <div className="absolute top-[310px] left-[590px] flex size-44 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center">
                <div
                  className={`absolute inset-0 rounded-full border border-dashed border-gryphon-blue/35 ${reduced ? "" : "animate-gspin"}`}
                />
                <div className="absolute inset-4 rounded-full border border-gryphon-ink/7" />
                <div className="relative max-w-[124px] font-mono text-xs leading-[1.6] text-[#8A8D94]">
                  the login
                  <br />
                  never leaves
                  <br />
                  this circuit
                </div>
              </div>

              {/* Card 01 */}
              <div
                className="absolute top-[165px] left-[230px] w-[302px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[9px] border-[1.5px] bg-white transition-all duration-500"
                style={{ borderColor: border(0), boxShadow: shadow(0) }}
              >
                <div className="bg-gryphon-ink px-3 py-1.5 font-mono text-[10px] leading-[1.7] tracking-[0.12em] text-white">
                  01 · AGENT ASKS
                </div>
                <div className="flex items-center gap-1.5 border-b border-gryphon-ink/8 bg-linear-to-b from-[#F8F8F6] to-[#F0F0EE] px-3 py-2">
                  <span className="size-2 rounded-full bg-[#FF5F57]" />
                  <span className="size-2 rounded-full bg-[#FEBC2E]" />
                  <span className="size-2 rounded-full bg-[#28C840]" />
                  <span className="ml-1 font-mono text-[10px] text-[#8A8D94]">
                    outreach-v3 — run #41
                  </span>
                </div>
                <div className="px-3 py-3 font-mono text-[11.5px] leading-[1.85]">
                  <div>
                    <span className="text-[#B9BCC3]">$ </span>
                    <span className="text-[#3A3D44]">python outreach_agent.py</span>
                  </div>
                  <div className="text-[#A6A9AF]">→ task: pull july invoices</div>
                  <div className="text-gryphon-blue">
                    → gryphon.get_session(&quot;stripe&quot;)
                    <span className="ml-0.5 inline-block h-3 w-1.5 animate-gblink bg-gryphon-blue align-[-1px]" />
                  </div>
                </div>
                <div className="flex justify-between border-t border-gryphon-ink/7 bg-[#FAFAF9] px-3 py-2 font-mono text-[10px] text-[#A6A9AF]">
                  <span>02:41:07</span>
                  <span>waiting 0.3s</span>
                </div>
              </div>

              {/* Card 02 */}
              <div
                className="absolute top-[165px] left-[950px] w-[302px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[9px] border-[1.5px] bg-white transition-all duration-500"
                style={{ borderColor: border(1), boxShadow: shadow(1) }}
              >
                <div className="bg-gryphon-blue px-3 py-1.5 font-mono text-[10px] leading-[1.7] tracking-[0.12em] text-white">
                  02 · GRYPHON HOLDS
                </div>
                <div className="flex items-center justify-between border-b border-gryphon-ink/7 px-3 pt-3 pb-2.5">
                  <span className="flex items-center gap-2">
                    <Image
                      src="/brand/gryphon-mark.png"
                      alt=""
                      width={21}
                      height={21}
                      className="size-[21px] rounded-[5px] object-contain"
                    />
                    <span className="text-[12.5px] font-medium">session lookup</span>
                  </span>
                  <span className="font-mono text-[10px] text-[#A6A9AF]">38ms</span>
                </div>
                <div className="flex flex-col gap-2 px-3 py-2.5">
                  {[
                    ["site", "stripe"],
                    ["stored context", "none", true],
                    ["policy", "pause, don't fail"],
                  ].map(([k, v, amber]) => (
                    <div
                      key={k as string}
                      className="flex justify-between font-mono text-[11px]"
                    >
                      <span className="text-[#8A8D94]">{k}</span>
                      <span className={amber ? "text-gryphon-amber" : "text-[#22242A]"}>
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mx-3 mb-3 flex items-center gap-2 rounded-md border border-[rgba(180,83,9,.3)] bg-[rgba(180,83,9,.06)] px-2.5 py-2">
                  <span className="size-1.5 animate-gpulse rounded-full bg-[#D97706]" />
                  <span className="text-[11.5px] leading-tight text-gryphon-amber">
                    needs_auth — escalation esc_8f31 opened
                  </span>
                </div>
              </div>

              {/* Phone 03 */}
              <div
                className="absolute top-[455px] left-[950px] flex h-[216px] w-[302px] -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-[26px] transition-all duration-500"
                style={{
                  background:
                    "linear-gradient(150deg,#1E3A8A,#3B82F6 55%,#93C5FD)",
                  boxShadow: phoneShadow,
                }}
              >
                <div className="absolute bottom-3 left-3.5 rounded bg-gryphon-ink/72 px-2.5 py-1 font-mono text-[10px] leading-[1.7] tracking-[0.12em] text-white">
                  03 · YOU CLEAR IT
                </div>
                <div className="absolute top-3 right-0 left-0 flex justify-between px-5 text-[10.5px] font-semibold text-white/90">
                  <span>2:41</span>
                  <span>●●●</span>
                </div>
                <div className="w-64 rounded-2xl bg-white/92 p-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,.5)] backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/brand/gryphon-mark.png"
                      alt=""
                      width={23}
                      height={23}
                      className="size-[23px] shrink-0 rounded-md object-contain"
                    />
                    <span className="text-[11.5px] font-semibold text-[#22242A]">
                      GRYPHON
                    </span>
                    <span className="ml-auto text-[10.5px] text-[#8A8D94]">now</span>
                  </div>
                  <div className="mt-2 text-[12.5px] font-semibold leading-tight text-gryphon-ink">
                    Stripe wants a 2FA code
                  </div>
                  <div className="mt-0.5 text-xs leading-snug text-gryphon-muted">
                    outreach-v3 is paused. Open Live View to clear it.
                  </div>
                  <div className="mt-2.5 flex gap-1.5">
                    <span className="flex h-7 flex-1 items-center justify-center rounded-lg bg-gryphon-ink text-[11.5px] font-semibold text-white">
                      Open Live View
                    </span>
                    <span className="flex h-7 items-center rounded-lg bg-gryphon-ink/7 px-2.5 text-[11.5px] font-semibold text-[#22242A]">
                      Later
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 04 */}
              <div
                className="absolute top-[455px] left-[230px] w-[302px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[9px] border-[1.5px] bg-gryphon-ink transition-all duration-500"
                style={{ borderColor: border(3), boxShadow: shadow(3) }}
              >
                <div className="bg-gryphon-blue px-3 py-1.5 font-mono text-[10px] leading-[1.7] tracking-[0.12em] text-white">
                  04 · BACK TO WORK
                </div>
                <div className="flex items-center justify-between border-b border-white/10 px-3 pt-3.5 pb-3">
                  <span className="text-[12.5px] font-medium text-white">
                    run #41 resumed
                  </span>
                  <span className="font-mono text-[10px] text-[#93C5FD]">
                    07:12:04
                  </span>
                </div>
                <div className="px-3 py-3">
                  <div className="flex justify-between font-mono text-[10.5px] text-[#8A8D94]">
                    <span>invoices pulled</span>
                    <span className="text-white">38 / 38</span>
                  </div>
                  <div className="mt-2 h-[5px] overflow-hidden rounded-sm bg-white/12">
                    <div className="h-full w-full bg-linear-to-r from-gryphon-blue to-[#60A5FA]" />
                  </div>
                  <div className="mt-3 flex flex-col gap-1.5 text-[11.5px] leading-snug text-[#B9BCC3]">
                    <span className="flex gap-2">
                      <span className="text-[#60A5FA]">✓</span>
                      session restored from bb_ctx_4a9c
                    </span>
                    <span className="flex gap-2">
                      <span className="text-[#60A5FA]">✓</span>0 lines changed in
                      the agent
                    </span>
                  </div>
                </div>
                <div className="flex justify-between border-t border-white/10 px-3 py-2 font-mono text-[10px] text-[#6E7178]">
                  <span>human time spent 00:54</span>
                  <span>next run: warm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
