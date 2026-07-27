"use client";

import { HeroArchitecture } from "@/components/marketing/hero-architecture";

/**
 * Homepage hero: continuous-flow architecture diagram.
 * Agents pass through Gryphon (get_session stamp) to authenticated sites.
 * Desktop/tablet: three columns; mobile: stacked agents → cube → sites.
 */
export function HeroArt() {
  return (
    <section className="relative overflow-hidden border-b border-gryphon-ink/8 bg-[#F7F6F3]">
      <div className="relative mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div className="mx-auto mb-8 max-w-[640px] text-center sm:mb-9 lg:mb-10">
          <p className="font-mono text-[12px] tracking-[0.14em] text-gryphon-faint">
            AUTH LAYER FOR BROWSER AGENTS
          </p>
          <h1 className="mt-3 text-[clamp(34px,4.8vw,52px)] font-normal leading-[1.05] tracking-[-0.035em] text-gryphon-ink text-balance">
            Agents that never die on a login.
          </h1>
          <p className="mx-auto mt-4 max-w-[40ch] text-[16px] leading-[1.55] text-gryphon-muted text-pretty">
            AI agents pass through Gryphon to reach authenticated sites. When
            auth breaks, they pause — then resume with a warm session.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
            <a
              href="#waitlist"
              className="inline-flex h-11 items-center rounded-full bg-gryphon-ink px-6 text-[14.5px] font-medium text-white transition-colors hover:bg-gryphon-blue active:scale-[0.96]"
            >
              Join waitlist →
            </a>
            <a
              href="#system"
              className="text-[14.5px] font-medium text-gryphon-muted underline-offset-4 transition-colors hover:text-gryphon-ink hover:underline"
            >
              How it works
            </a>
          </div>
        </div>

        <HeroArchitecture />
      </div>
    </section>
  );
}
