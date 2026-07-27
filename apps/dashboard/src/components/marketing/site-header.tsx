import Link from "next/link";

import { AuthControls } from "@/components/auth/auth-controls";
import { GryphonWordmark } from "@/components/brand/gryphon-mark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-gryphon-ink/8 bg-gryphon-paper/82 backdrop-blur-[10px]">
      <div className="mx-auto flex h-[66px] max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="shrink-0">
          <GryphonWordmark size="lg" priority />
        </Link>
        <nav className="flex items-center gap-3 text-[15px] sm:gap-6 lg:gap-[30px]">
          <a
            href="#system"
            className="hidden text-gryphon-muted transition-colors hover:text-gryphon-ink sm:inline"
          >
            How it works
          </a>
          <a
            href="#loop"
            className="hidden text-gryphon-muted transition-colors hover:text-gryphon-ink sm:inline"
          >
            The loop
          </a>
          <a
            href="#scope"
            className="hidden text-gryphon-muted transition-colors hover:text-gryphon-ink md:inline"
          >
            Scope
          </a>
          <AuthControls />
        </nav>
      </div>
    </header>
  );
}
