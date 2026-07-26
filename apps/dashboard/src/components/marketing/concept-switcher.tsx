"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const CONCEPTS = [
  {
    href: "/concepts/a",
    label: "A",
    title: "Product demo",
    blurb: "Light · live session loop",
  },
  {
    href: "/concepts/b",
    label: "B",
    title: "Cinematic",
    blurb: "Dark · Imagine hero",
  },
  {
    href: "/concepts/c",
    label: "C",
    title: "Terminal",
    blurb: "Dev · code-first",
  },
] as const;

export function ConceptSwitcher({ dark = false }: { dark?: boolean }) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border px-1.5 py-1.5 shadow-lg backdrop-blur-md",
        dark
          ? "border-white/12 bg-black/70 text-white"
          : "border-gryphon-ink/12 bg-white/90 text-gryphon-ink",
      )}
    >
      <Link
        href="/concepts"
        className={cn(
          "rounded-full px-3 py-1.5 text-[11px] font-medium tracking-wide",
          dark
            ? "text-white/55 hover:text-white"
            : "text-gryphon-faint hover:text-gryphon-ink",
        )}
      >
        Concepts
      </Link>
      {CONCEPTS.map((c) => {
        const active = pathname === c.href;
        return (
          <Link
            key={c.href}
            href={c.href}
            title={`${c.title} — ${c.blurb}`}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors",
              active
                ? dark
                  ? "bg-white text-black"
                  : "bg-gryphon-ink text-white"
                : dark
                  ? "text-white/70 hover:bg-white/10 hover:text-white"
                  : "text-gryphon-muted hover:bg-gryphon-ink/6 hover:text-gryphon-ink",
            )}
          >
            {c.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className={cn(
          "rounded-full px-3 py-1.5 text-[11px]",
          dark
            ? "text-white/45 hover:text-white"
            : "text-gryphon-ghost hover:text-gryphon-ink",
        )}
      >
        Live
      </Link>
    </div>
  );
}
