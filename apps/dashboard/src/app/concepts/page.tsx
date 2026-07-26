import Link from "next/link";
import Image from "next/image";

import { GryphonWordmark } from "@/components/brand/gryphon-mark";

const CARDS = [
  {
    href: "/concepts/a",
    letter: "A",
    title: "Product demo",
    subtitle: "Light · proof-first",
    description:
      "Animated session loop in the hero. Shows the 2FA pause, Slack ping, and resume before anyone reads a paragraph.",
    tone: "bg-[#FBFBFA] text-gryphon-ink border-gryphon-ink/10",
    badge: "bg-gryphon-ink text-white",
    preview: null as string | null,
  },
  {
    href: "/concepts/b",
    letter: "B",
    title: "Cinematic guardian",
    subtitle: "Dark · brand-first",
    description:
      "Full-bleed Imagine hero. Mythic gryphon + authenticated web story. Feels like a launch campaign page.",
    tone: "bg-[#0C0D10] text-white border-white/10",
    badge: "bg-gryphon-blue text-white",
    preview: "/brand/hero-guardian.jpg",
  },
  {
    href: "/concepts/c",
    letter: "C",
    title: "Terminal",
    subtitle: "Mono · builder-first",
    description:
      "API and MCP in the hero. Minimal marketing chrome. For people who decide from a code sample.",
    tone: "bg-[#111214] text-[#E8E9EB] border-white/10",
    badge: "bg-[#22C55E] text-black",
    preview: null as string | null,
  },
] as const;

export default function ConceptsIndexPage() {
  return (
    <main className="min-h-screen bg-gryphon-paper">
      <header className="border-b border-gryphon-ink/8">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 sm:px-6">
          <GryphonWordmark size="md" priority />
          <Link
            href="/"
            className="text-sm text-gryphon-muted transition-colors hover:text-gryphon-ink"
          >
            ← Current live page
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 sm:py-20">
        <p className="font-mono text-[13px] text-gryphon-faint">homepage concepts</p>
        <h1 className="mt-3 max-w-[16ch] text-[clamp(36px,5vw,56px)] leading-[1.05] tracking-[-0.035em] text-balance">
          Three ways to show Gryphon.
        </h1>
        <p className="mt-4 max-w-[48ch] text-[17px] leading-relaxed text-gryphon-muted text-pretty">
          Same product — persistent sessions + human-in-the-loop recovery —
          three different landing stories. Pick one to open full-screen; switch
          anytime with the bar at the bottom.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group flex flex-col overflow-hidden rounded-xl border transition-transform hover:-translate-y-0.5 ${card.tone}`}
            >
              <div className="relative h-36 overflow-hidden border-b border-inherit">
                {card.preview ? (
                  <Image
                    src={card.preview}
                    alt=""
                    fill
                    className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : card.letter === "A" ? (
                  <div className="flex h-full flex-col justify-end gap-1.5 p-4 font-mono text-[11px] leading-relaxed text-gryphon-muted">
                    <span className="text-gryphon-blue">→ gryphon.get_session(&quot;stripe&quot;)</span>
                    <span className="text-gryphon-amber">← needs_auth · run paused</span>
                    <span className="text-gryphon-green">✓ resolved · session warm</span>
                  </div>
                ) : (
                  <div className="flex h-full items-end p-4 font-mono text-[12px] leading-relaxed text-[#8A8D94]">
                    <pre className="m-0">{`await gryphon.getSession({
  site: "stripe.com",
})`}</pre>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-flex size-8 items-center justify-center rounded-full text-sm font-semibold ${card.badge}`}
                  >
                    {card.letter}
                  </span>
                  <div>
                    <div className="text-[15px] font-semibold tracking-tight">
                      {card.title}
                    </div>
                    <div
                      className={`font-mono text-[11px] ${card.letter === "A" ? "text-gryphon-faint" : "text-white/45"}`}
                    >
                      {card.subtitle}
                    </div>
                  </div>
                </div>
                <p
                  className={`mt-3 flex-1 text-[14px] leading-relaxed ${card.letter === "A" ? "text-gryphon-muted" : "text-white/65"}`}
                >
                  {card.description}
                </p>
                <span
                  className={`mt-5 text-[13.5px] font-medium ${card.letter === "A" ? "text-gryphon-blue" : "text-[#93C5FD]"}`}
                >
                  Open full page →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
