"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";

import {
  BrandLogo,
  type BrandLogoName,
} from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";

/**
 * Continuous-flow architecture diagram.
 * Agents route through the Gryphon cube with a quick get_session stamp —
 * no waiting lane, no queue. Desktop/tablet: three columns; mobile: stacked.
 */

const AGENTS: { name: string; logo: BrandLogoName; bg: string }[] = [
  { name: "Claude", logo: "claude", bg: "#D97757" },
  { name: "ChatGPT", logo: "chatgpt", bg: "#10A37F" },
  { name: "Cursor", logo: "cursor", bg: "#0C0D10" },
  { name: "Playwright", logo: "playwright", bg: "#2EAD33" },
];

const SITES: { name: string; logo: BrandLogoName; bg: string }[] = [
  { name: "LinkedIn", logo: "linkedin", bg: "#0A66C2" },
  { name: "Gmail", logo: "gmail", bg: "#EA4335" },
  { name: "Stripe", logo: "stripe", bg: "#635BFF" },
  { name: "Shopify", logo: "shopify", bg: "#95BF47" },
  { name: "Slack", logo: "slack", bg: "#4A154B" },
  { name: "WhatsApp", logo: "whatsapp", bg: "#25D366" },
];

const CYCLE = 13;
const APPROACH = 2.0;
const TRAVEL = 2.0;

const SPAWNS = [
  { t0: 0, ai: 0, si: 0, dwell: 0.7 },
  { t0: 1.8, ai: 1, si: 4, dwell: 0.7 },
  { t0: 3.6, ai: 2, si: 2, dwell: 0.7 },
  { t0: 5.4, ai: 3, si: 3, dwell: 0.7 },
  { t0: 7.2, ai: 1, si: 1, dwell: 0.7 },
] as const;

type Rect = { x: number; y: number; w: number; h: number };
type Point = { x: number; y: number };

type Journey = {
  t0: number;
  ai: number;
  si: number;
  dwell: number;
  d: string;
  path: SVGPathElement;
  len1: number;
  total: number;
  arrive: number;
  s0: number;
  s1: number;
  a1: number;
  done: number;
};

type Chip = {
  key: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  name: string;
  logo: BrandLogoName;
  badge: string | null;
  badgeBg: string;
  badgeFg: string;
  border: string;
};

type Line = {
  key: number;
  d: string;
  dash: string;
  opacity: number;
  guideOpacity: number;
  color: string;
};

function easeInOut(x: number) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function rel(el: HTMLElement, root: DOMRect): Rect {
  const b = el.getBoundingClientRect();
  return {
    x: b.left - root.left,
    y: b.top - root.top,
    w: b.width,
    h: b.height,
  };
}

function mkPath(d: string) {
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", d);
  return p;
}

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HeroArchitecture() {
  const rootRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const agentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const siteRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [now, setNow] = useState(0);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [narrow, setNarrow] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );

  const measure = useCallback(() => {
    const root = rootRef.current;
    const cube = cubeRef.current;
    if (!root || !cube) return;

    const rb = root.getBoundingClientRect();
    if (!rb.width) return;

    const nextNarrow = rb.width < 700;
    setNarrow(nextNarrow);

    const agents = agentRefs.current.filter(Boolean) as HTMLDivElement[];
    const sites = siteRefs.current.filter(Boolean) as HTMLDivElement[];
    if (agents.length < 4 || sites.length < 6) return;

    const cubeR = rel(cube, rb);
    const cx = cubeR.x + cubeR.w / 2;
    const cy = cubeR.y + cubeR.h / 2;

    const js: Journey[] = SPAWNS.map((s) => {
      const a = rel(agents[s.ai], rb);
      const st = rel(sites[s.si], rb);
      let d1: string;
      let d: string;

      if (nextNarrow) {
        const ax = a.x + a.w / 2;
        const ay = a.y + a.h + 4;
        const sx = st.x + st.w / 2;
        const sy = st.y - 4;
        const m = Math.max(20, (cy - ay) * 0.5);
        const n = Math.max(20, (sy - cy) * 0.5);
        d1 = `M ${ax} ${ay} C ${ax} ${ay + m}, ${cx} ${cy - m}, ${cx} ${cy}`;
        d = `${d1} C ${cx} ${cy + n}, ${sx} ${sy - n}, ${sx} ${sy}`;
      } else {
        const ax = a.x + a.w + 4;
        const ay = a.y + a.h / 2;
        const sx = st.x - 4;
        const sy = st.y + st.h / 2;
        d1 = `M ${ax} ${ay} C ${ax + 150} ${ay}, ${cx - 230} ${cy}, ${cx} ${cy}`;
        d = `${d1} C ${cx + 230} ${cy}, ${sx - 130} ${sy}, ${sx} ${sy}`;
      }

      const full = mkPath(d);
      const arrive = s.t0 + APPROACH;
      const s0 = arrive;
      const s1 = s0 + s.dwell;
      const a1 = s1 + TRAVEL;
      const done = a1 + 0.5;

      return {
        ...s,
        d,
        path: full,
        len1: mkPath(d1).getTotalLength(),
        total: full.getTotalLength(),
        arrive,
        s0,
        s1,
        a1,
        done,
      };
    });

    setJourneys(js);
  }, []);

  useLayoutEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    const t = window.setTimeout(measure, 700);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
    };
  }, [measure, narrow]);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let frame = 0;
    const start = performance.now();
    const loop = (ts: number) => {
      if (++frame % 120 === 0) measure();
      setNow((ts - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, measure]);

  const t = now % CYCLE;
  const chips: Chip[] = [];
  const lines: Line[] = [];
  const glow: Record<number, boolean> = {};
  let busy = false;
  const ready = journeys.length > 0;

  if (!reduced && ready) {
    journeys.forEach((j, idx) => {
      if (t < j.t0 || t >= j.done) return;

      const P = (dd: number) =>
        j.path.getPointAtLength(Math.max(0, Math.min(dd, j.total)));

      const preLen = narrow ? j.len1 * 0.55 : j.len1 - 150;
      let dist = 0;
      let pt: Point | null = null;
      let scale = 1;
      let opacity = 1;
      let badge: string | null = null;
      let badgeBg = "";
      let badgeFg = "";
      const border = "rgba(12,13,16,0.10)";

      if (t < j.arrive) {
        dist = 70 + easeInOut((t - j.t0) / APPROACH) * (preLen - 70);
        opacity = Math.min(1, (t - j.t0) / 0.35);
      } else if (t < j.s1) {
        dist = j.len1;
        const u = easeInOut(Math.min(1, (t - j.s0) / 0.4));
        pt = {
          x: P(preLen).x + (P(j.len1).x - P(preLen).x) * u,
          y: P(preLen).y + (P(j.len1).y - P(preLen).y) * u,
        };
        scale = 1 + 0.05 * Math.sin((Math.PI * (t - j.s0)) / j.dwell);
        busy = true;
        badge = "checking";
        badgeBg = "#DBEAFE";
        badgeFg = "#1D4ED8";
      } else if (t < j.a1) {
        dist = j.len1 + easeInOut((t - j.s1) / TRAVEL) * (j.total - j.len1);
        if (t - j.s1 < 1.1) {
          badge = "cleared ✓";
          badgeBg = "#DCFCE7";
          badgeFg = "#15803D";
        }
      } else {
        dist = j.total;
        const p = (t - j.a1) / 0.5;
        scale = 1 - 0.75 * p;
        opacity = 1 - p;
      }

      if (t >= j.a1 - 0.05 && t < j.a1 + 0.9) glow[j.si] = true;
      if (!pt) pt = P(dist);

      const ag = AGENTS[j.ai];
      chips.push({
        key: idx,
        x: pt.x,
        y: pt.y,
        scale,
        opacity,
        name: ag.name,
        logo: ag.logo,
        badge,
        badgeBg,
        badgeFg,
        border,
      });

      const lineFade =
        t > j.a1
          ? Math.max(0, 1 - (t - j.a1) / 0.5)
          : Math.min(1, (t - j.t0) / 0.4);
      lines.push({
        key: idx,
        d: j.d,
        dash: `${dist} ${j.total + 20}`,
        opacity: 0.85 * lineFade,
        guideOpacity: lineFade,
        color: "rgba(29,78,216,0.6)",
      });
    });
  }

  const hubStatus = busy ? "get_session" : "sessions warm";
  const hubScale = busy ? 1.04 : 1;
  const hubGlow = busy ? "rgba(29,78,216,0.30)" : "transparent";

  return (
    <div
      ref={rootRef}
      className="relative w-full max-w-[1240px] overflow-hidden bg-[#F7F6F3]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(29,78,216,0.07),transparent_55%)]" />

      {narrow ? (
        <div className="relative px-3.5 pt-5 pb-4">
          <div className="flex flex-wrap justify-center gap-2">
            {AGENTS.map((a, i) => (
              <div
                key={a.name}
                ref={(el) => {
                  agentRefs.current[i] = el;
                }}
              >
                <AgentPill agent={a} compact />
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center py-[46px]">
            <Hub
              cubeRef={cubeRef}
              status={hubStatus}
              scale={hubScale}
              glow={hubGlow}
              size={116}
              mark={72}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {SITES.map((s, i) => (
              <div
                key={s.name}
                ref={(el) => {
                  siteRefs.current[i] = el;
                }}
              >
                <SitePill site={s} glowing={!!glow[i]} compact />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative px-8 pt-9 pb-5">
          <div className="grid grid-cols-[max-content_minmax(240px,460px)_max-content] items-start justify-center gap-x-12">
            <div className="flex flex-col gap-2.5">
              {AGENTS.map((a, i) => (
                <div
                  key={a.name}
                  ref={(el) => {
                    agentRefs.current[i] = el;
                  }}
                  className="w-fit"
                >
                  <AgentPill agent={a} />
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center pt-2">
              <Hub
                cubeRef={cubeRef}
                status={hubStatus}
                scale={hubScale}
                glow={hubGlow}
                size={132}
                mark={84}
              />
            </div>

            <div className="flex flex-col items-end gap-2">
              {SITES.map((s, i) => (
                <div
                  key={s.name}
                  ref={(el) => {
                    siteRefs.current[i] = el;
                  }}
                >
                  <SitePill site={s} glowing={!!glow[i]} />
                </div>
              ))}
            </div>
          </div>
          <div className="h-5" />
        </div>
      )}

      <svg
        className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible"
        aria-hidden
      >
        {lines.map((l) => (
          <g key={l.key}>
            <path
              d={l.d}
              fill="none"
              stroke="rgba(29,78,216,0.14)"
              strokeWidth={1}
              strokeDasharray="4 5"
              opacity={l.guideOpacity}
            />
            <path
              d={l.d}
              fill="none"
              stroke={l.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={l.dash}
              opacity={l.opacity}
            />
          </g>
        ))}
      </svg>

      {chips.map((c) => (
        <div
          key={c.key}
          className="pointer-events-none absolute z-40 flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-white py-1 pr-2.5 pl-1.5 shadow-[0_8px_22px_-6px_rgba(12,13,16,0.35)]"
          style={
            {
              left: c.x,
              top: c.y,
              opacity: c.opacity,
              borderColor: c.border,
              transform: `translate(-50%, -50%) scale(${c.scale})`,
            } satisfies CSSProperties
          }
        >
          <BrandLogo name={c.logo} size={16} variant="badge" title={c.name} />
          <span className="text-[11px] font-medium tracking-tight text-gryphon-ink">
            {c.name}
          </span>
          {c.badge && (
            <span
              className="rounded-full px-1.5 py-px font-mono text-[9px]"
              style={{ background: c.badgeBg, color: c.badgeFg }}
            >
              {c.badge}
            </span>
          )}
        </div>
      ))}

      <div className="h-2" />
    </div>
  );
}

function Hub({
  cubeRef,
  status,
  scale,
  glow,
  size,
  mark,
}: {
  cubeRef: React.RefObject<HTMLDivElement | null>;
  status: string;
  scale: number;
  glow: string;
  size: number;
  mark: number;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        ref={cubeRef}
        className="relative transition-transform duration-300 ease-out"
        style={{ width: size, height: size, transform: `scale(${scale})` }}
      >
        <div
          className="pointer-events-none absolute inset-[-12%] rounded-full blur-[20px] transition-[background] duration-500"
          style={{ background: glow }}
        />
        <div
          className="absolute inset-[-10%] mix-blend-multiply"
          style={{
            WebkitMask:
              "radial-gradient(closest-side, #000 62%, transparent 90%)",
            mask: "radial-gradient(closest-side, #000 62%, transparent 90%)",
            filter: "brightness(1.21)",
          }}
        >
          <Image
            src="/brand/diagram/cube.jpg"
            alt=""
            fill
            className="object-contain"
            sizes={`${size}px`}
            priority
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/brand/gryphon-mark.png"
            alt="Gryphon"
            width={mark}
            height={mark}
            className="object-contain drop-shadow-[0_1px_3px_rgba(255,255,255,0.8)]"
            priority
          />
        </div>
      </div>
      <p className="mt-2 font-mono text-[10px] text-gryphon-blue transition-colors duration-300">
        {status}
      </p>
    </div>
  );
}

function AgentPill({
  agent,
  compact = false,
}: {
  agent: (typeof AGENTS)[number];
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-fit items-center rounded-full border border-gryphon-ink/8 bg-white shadow-[0_4px_16px_-8px_rgba(12,13,16,0.28)]",
        compact ? "gap-1.5 px-2.5 py-1.5" : "gap-2 px-3 py-2",
      )}
    >
      <BrandLogo
        name={agent.logo}
        size={compact ? 15 : 16}
        variant="badge"
        title={agent.name}
      />
      <span
        className={cn(
          "font-medium tracking-tight text-gryphon-ink",
          compact ? "text-[12.5px]" : "text-[13px]",
        )}
      >
        {agent.name}
      </span>
    </div>
  );
}

function SitePill({
  site,
  glowing,
  compact = false,
}: {
  site: (typeof SITES)[number];
  glowing: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center rounded-full border border-gryphon-ink/8 bg-white transition-[box-shadow,background] duration-300",
        compact ? "gap-1.5 px-2.5 py-1.5" : "gap-2 px-3 py-2",
        glowing
          ? "shadow-[0_0_0_3px_rgba(29,78,216,0.18),0_4px_16px_-8px_rgba(12,13,16,0.28)]"
          : "shadow-[0_4px_16px_-8px_rgba(12,13,16,0.28)]",
      )}
    >
      <BrandLogo
        name={site.logo}
        size={15}
        variant="badge"
        title={site.name}
      />
      <span
        className={cn(
          "min-w-0 font-medium tracking-tight text-gryphon-ink",
          compact ? "flex-1 text-[12.5px]" : "text-[13px]",
        )}
      >
        {site.name}
      </span>
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full transition-colors duration-300",
          glowing ? "bg-gryphon-blue" : "bg-emerald-500",
        )}
      />
    </div>
  );
}
