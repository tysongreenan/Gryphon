import Image from "next/image";
import Link from "next/link";

import { CinematicHero } from "@/components/marketing/cinematic-hero";
import { ConceptSwitcher } from "@/components/marketing/concept-switcher";
import { WaitlistInline } from "@/components/marketing/waitlist-inline";

/**
 * Concept B — Cinematic guardian
 * Dark campaign page. Full-bleed Imagine hero with animated product demos.
 */
export default function ConceptBPage() {
  return (
    <main className="min-h-screen bg-[#07080A] text-[#F4F4F2]">
      <CinematicHero />

      {/* Visual story */}
      <section className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="font-mono text-[12px] tracking-[0.12em] text-white/40">
              THE BRIDGE
            </p>
            <h2 className="mt-4 max-w-[16ch] text-[clamp(28px,4vw,44px)] leading-[1.08] tracking-[-0.03em] text-balance">
              Agents on one side. The authenticated web on the other.
            </h2>
            <p className="mt-5 max-w-[42ch] text-[16.5px] leading-[1.6] text-white/60 text-pretty">
              Browser agents fail where humans don&apos;t notice — expired
              cookies, surprise 2FA, midnight lockouts. Gryphon sits in that
              gap: hold the session, pause the run, pull a human through Live
              View, resume without rewriting a line.
            </p>
            <ul className="mt-8 space-y-3 text-[15px] text-white/70">
              {[
                "get_session(site) → ready connect URL",
                "needs_auth → Slack / WhatsApp with signed Live View",
                "Human resolves · context stored · agent continues",
              ].map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gryphon-blue" />
                  <span className="font-mono text-[13.5px] leading-relaxed text-[#B9C0CC]">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-16/11 overflow-hidden rounded-xl border border-white/10">
            <Image
              src="/brand/hero-bridge.jpg"
              alt="Gryphon wing bridging AI agents and authenticated websites"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Portrait band */}
      <section className="relative overflow-hidden border-y border-white/8">
        <div className="mx-auto grid max-w-[1280px] lg:grid-cols-2">
          <div className="relative min-h-[320px] lg:min-h-[480px]">
            <Image
              src="/brand/hero-portrait.jpg"
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
            <p className="font-mono text-[12px] tracking-[0.12em] text-[#F59E0B]">
              HUMAN IN THE LOOP
            </p>
            <h2 className="mt-4 max-w-[18ch] text-[clamp(26px,3.4vw,40px)] leading-[1.1] tracking-[-0.03em]">
              When the wall appears, a human clears it — not a retry storm.
            </h2>
            <p className="mt-5 max-w-[40ch] text-[16px] leading-[1.6] text-white/60">
              Escalation is a feature, not a failure mode. Your run stays warm.
              You spend under a minute in Live View. The agent never saw a
              password.
            </p>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section id="join" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(29,78,216,.22),transparent_55%)]" />
        <div className="relative mx-auto max-w-[720px] px-4 py-24 text-center sm:px-6 sm:py-32">
          <h2 className="text-[clamp(32px,5vw,52px)] leading-[1.05] tracking-[-0.035em] text-balance">
            Make authentication boring.
          </h2>
          <p className="mx-auto mt-5 max-w-[40ch] text-[16.5px] leading-relaxed text-white/55">
            Access opens in small batches. Tell us the site that keeps breaking
            your overnight runs.
          </p>
          <div className="mx-auto mt-8 max-w-[480px] text-left">
            <WaitlistInline
              source="concept-b-closing"
              variant="closing"
              submitLabel="Request early access →"
              className="[&_input]:border-white/15 [&_input]:bg-white/6 [&_input]:text-white [&_input]:placeholder:text-white/35 [&_button]:bg-gryphon-blue [&_button]:text-white [&_button:hover]:bg-[#3B82F6]"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/8">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-white/40 sm:px-6 lg:px-10">
          <span className="font-serif text-lg italic text-white/80">Gryphon</span>
          <Link href="/concepts" className="hover:text-white">
            All concepts
          </Link>
        </div>
      </footer>

      <ConceptSwitcher dark />
    </main>
  );
}
