import Link from "next/link";

import { GryphonWordmark } from "@/components/brand/gryphon-mark";
import { ConceptSwitcher } from "@/components/marketing/concept-switcher";
import { HeroDemo } from "@/components/marketing/hero-demo";
import { LoopSection } from "@/components/marketing/loop-section";
import { ScopeSection } from "@/components/marketing/scope-section";
import { SystemSection } from "@/components/marketing/system-section";
import { WaitlistSectionV6 } from "@/components/marketing/waitlist-section-v6";

/**
 * Concept A — Product demo
 * Light paper surface, animated session proof in the hero.
 * Closest to the current live homepage; optimized as a "show the loop first" story.
 */
export default function ConceptAPage() {
  return (
    <main className="flex w-full flex-col overflow-x-hidden bg-gryphon-paper">
      <header className="sticky top-0 z-40 border-b border-gryphon-ink/8 bg-gryphon-paper/82 backdrop-blur-[10px]">
        <div className="mx-auto flex h-[66px] max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <Link href="/concepts" className="shrink-0">
            <GryphonWordmark size="lg" priority />
          </Link>
          <nav className="flex items-center gap-3 text-[15px] sm:gap-6">
            <span className="hidden font-mono text-[11px] tracking-wide text-gryphon-faint sm:inline">
              concept a · product demo
            </span>
            <a
              href="#waitlist"
              className="whitespace-nowrap bg-gryphon-ink px-[18px] py-[11px] text-[14.5px] text-white transition-colors hover:bg-gryphon-blue"
            >
              Join waitlist →
            </a>
          </nav>
        </div>
      </header>

      <HeroDemo />
      <SystemSection />
      <LoopSection />
      <ScopeSection />
      <WaitlistSectionV6 />

      <footer className="border-t border-gryphon-ink/8">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3.5 px-4 py-6 text-sm text-gryphon-faint sm:px-6 lg:px-10">
          <span>
            <span className="font-serif text-lg italic text-gryphon-ink">
              Gryphon
            </span>{" "}
            — keeps your agents logged in
          </span>
          <div className="flex gap-5">
            <Link href="/concepts" className="hover:text-gryphon-ink">
              All concepts
            </Link>
            <a href="#waitlist" className="hover:text-gryphon-ink">
              Waitlist
            </a>
          </div>
        </div>
      </footer>

      <ConceptSwitcher />
    </main>
  );
}
