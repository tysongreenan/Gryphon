import Link from "next/link";

import { GryphonMark } from "@/components/brand/gryphon-mark";
import { ConceptSwitcher } from "@/components/marketing/concept-switcher";
import { WaitlistInline } from "@/components/marketing/waitlist-inline";

/**
 * Concept C — Terminal / builder-first
 * Monospace-led, API sample as the hero, minimal brand chrome.
 */

const SNIPPET = `import { Gryphon } from "@gryphon/sdk";

const gryphon = new Gryphon({ apiKey: process.env.GRYPHON_API_KEY });

// Ask for a ready authenticated browser session
const session = await gryphon.getSession({ site: "stripe.com" });

if (session.status === "ready") {
  // Connect your agent (Playwright / Stagehand / Browserbase)
  await agent.connect(session.connectUrl);
} else if (session.status === "needs_auth") {
  // Run is paused — human gets Live View via Slack
  // Gryphon stores context after they resolve
  // Next getSession() returns ready
}`;

const STEPS = [
  {
    cmd: "get_session(site)",
    out: "ready · connect_url + context_id",
    note: "Warm session for any later run",
  },
  {
    cmd: "needs_auth",
    out: "run paused · escalation opened",
    note: "Not a failure — state held warm",
  },
  {
    cmd: "human.resolve()",
    out: "Live View · 2FA cleared",
    note: "Signed link, short TTL, no API key",
  },
  {
    cmd: "get_session(site)",
    out: "ready again · durable context",
    note: "Agent resumes; 0 lines changed",
  },
] as const;

export default function ConceptCPage() {
  return (
    <main className="min-h-screen bg-[#0B0C0E] font-mono text-[#D4D6DB]">
      <header className="border-b border-white/8">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-4 sm:px-6">
          <Link href="/concepts" className="inline-flex items-center gap-2">
            <GryphonMark className="size-6 brightness-0 invert" priority alt="" />
            <span className="text-[14px] font-medium tracking-tight text-white">
              gryphon
            </span>
            <span className="hidden text-[12px] text-white/30 sm:inline">
              / sessions
            </span>
          </Link>
          <div className="flex items-center gap-4 text-[12px]">
            <span className="text-white/30">concept c · terminal</span>
            <a
              href="#waitlist"
              className="text-[#4ADE80] transition-colors hover:text-[#86EFAC]"
            >
              join_waitlist →
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-white/8">
        <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-white/35">
            <span className="rounded border border-white/10 px-2 py-0.5 text-[#4ADE80]">
              v0 · beta
            </span>
            <span>MCP · REST · Browserbase Contexts</span>
          </div>

          <h1 className="mt-6 max-w-[20ch] font-sans text-[clamp(34px,5.5vw,56px)] font-medium leading-[1.05] tracking-[-0.035em] text-white text-balance">
            Authenticated sessions for agents that keep running.
          </h1>
          <p className="mt-5 max-w-[52ch] font-sans text-[16px] leading-[1.6] text-white/55 text-pretty">
            <code className="text-[#93C5FD]">get_session(site)</code> returns a
            ready connect URL — or pauses the run and pages a human when auth
            breaks. No cookie jars in your repo.
          </p>

          <div className="mt-10 overflow-hidden rounded-lg border border-white/10 bg-[#111214]">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5 text-[11px] text-white/35">
              <span>agent.ts</span>
              <span className="text-[#4ADE80]">typescript</span>
            </div>
            <pre className="overflow-x-auto p-4 text-[12.5px] leading-[1.7] text-[#C8CAD0] sm:text-[13px]">
              <code>
                {SNIPPET.split("\n").map((line, i) => (
                  <span key={i} className="block">
                    <span className="mr-4 inline-block w-5 select-none text-right text-white/20">
                      {i + 1}
                    </span>
                    <SnippetLine line={line} />
                  </span>
                ))}
              </code>
            </pre>
          </div>

          <div className="mt-8 max-w-[480px]">
            <WaitlistInline
              source="concept-c-hero"
              submitLabel="request_access →"
              className="[&_input]:rounded-md [&_input]:border-white/12 [&_input]:bg-[#111214] [&_input]:font-mono [&_input]:text-[14px] [&_input]:text-white [&_input]:placeholder:text-white/30 [&_button]:rounded-md [&_button]:bg-[#4ADE80] [&_button]:font-mono [&_button]:text-[14px] [&_button]:text-black [&_button:hover]:bg-[#86EFAC]"
            />
            <p className="mt-3 text-[12px] text-white/30">
              free during beta · no card
            </p>
          </div>
        </div>
      </section>

      {/* Protocol */}
      <section className="border-b border-white/8">
        <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 sm:py-16">
          <p className="text-[12px] text-white/35">// the loop</p>
          <h2 className="mt-2 font-sans text-[clamp(24px,3vw,34px)] font-medium tracking-[-0.03em] text-white">
            Four calls. One circuit that can&apos;t end dead.
          </h2>

          <div className="mt-10 divide-y divide-white/8 border border-white/8">
            {STEPS.map((step, i) => (
              <div
                key={step.cmd + i}
                className="grid gap-2 px-4 py-4 sm:grid-cols-[28px_1fr_1fr_1fr] sm:items-baseline sm:gap-4 sm:px-5"
              >
                <span className="text-[12px] text-white/25">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <code className="text-[13px] text-[#93C5FD]">{step.cmd}</code>
                <code className="text-[13px] text-[#4ADE80]">{step.out}</code>
                <span className="font-sans text-[13.5px] text-white/45">
                  {step.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scope table */}
      <section className="border-b border-white/8">
        <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 sm:py-16">
          <p className="text-[12px] text-white/35">// scope</p>
          <h2 className="mt-2 font-sans text-[clamp(24px,3vw,34px)] font-medium tracking-[-0.03em] text-white">
            What Gryphon is (and isn&apos;t).
          </h2>

          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-white/8 bg-white/8 sm:grid-cols-2">
            <div className="bg-[#0B0C0E] p-5 sm:p-6">
              <div className="text-[12px] text-[#4ADE80]">owns</div>
              <ul className="mt-3 space-y-2 font-sans text-[14.5px] leading-relaxed text-white/70">
                <li>Persistent Browserbase contexts per site</li>
                <li>Human escalation + Live View resolve</li>
                <li>MCP tools + REST for agents</li>
                <li>Session ready / needs_auth contract</li>
              </ul>
            </div>
            <div className="bg-[#0B0C0E] p-5 sm:p-6">
              <div className="text-[12px] text-white/30">does not</div>
              <ul className="mt-3 space-y-2 font-sans text-[14.5px] leading-relaxed text-white/45">
                <li>Run your agent tasks</li>
                <li>Replace Playwright / Stagehand / Browserbase</li>
                <li>Automate CAPTCHA or site-specific actions</li>
                <li>Store passwords in your application code</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto rounded-lg border border-white/8">
            <table className="w-full min-w-[520px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-white/8 text-white/35">
                  <th className="px-4 py-3 font-normal">layer</th>
                  <th className="px-4 py-3 font-normal">you already have</th>
                  <th className="px-4 py-3 font-normal">gryphon</th>
                </tr>
              </thead>
              <tbody className="font-sans text-[14px]">
                {[
                  ["brain", "Claude / GPT / Grok agent", "—"],
                  ["driver", "Playwright · Stagehand", "—"],
                  ["browser", "Browserbase", "contexts + sessions"],
                  ["auth", "cookies · hope", "get_session + HITL"],
                ].map(([layer, you, g]) => (
                  <tr key={layer} className="border-b border-white/6 last:border-0">
                    <td className="px-4 py-3 font-mono text-[12px] text-white/40">
                      {layer}
                    </td>
                    <td className="px-4 py-3 text-white/60">{you}</td>
                    <td
                      className={`px-4 py-3 ${g === "—" ? "text-white/25" : "text-[#4ADE80]"}`}
                    >
                      {g}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section id="waitlist" className="border-b border-white/8">
        <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-[12px] text-white/35">// early access</p>
          <h2 className="mt-2 max-w-[22ch] font-sans text-[clamp(26px,3.5vw,40px)] font-medium tracking-[-0.03em] text-white text-balance">
            Ship agents that survive 2FA.
          </h2>
          <p className="mt-4 max-w-[48ch] font-sans text-[15px] leading-relaxed text-white/50">
            Small batches. Tell us which site kills your overnight runs and
            we&apos;ll prioritize it.
          </p>
          <div className="mt-8 max-w-[480px]">
            <WaitlistInline
              source="concept-c-closing"
              variant="closing"
              submitLabel="join_waitlist →"
              className="[&_input]:rounded-md [&_input]:border-white/12 [&_input]:bg-[#111214] [&_input]:font-mono [&_input]:text-white [&_input]:placeholder:text-white/30 [&_button]:rounded-md [&_button]:bg-white [&_button]:font-mono [&_button]:text-black [&_button:hover]:bg-[#E5E7EB]"
            />
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-4 py-6 text-[12px] text-white/30 sm:px-6">
        <span>gryphon — auth reliability layer</span>
        <Link href="/concepts" className="hover:text-white/70">
          all concepts
        </Link>
      </footer>

      <ConceptSwitcher dark />
    </main>
  );
}

function SnippetLine({ line }: { line: string }) {
  // Lightweight syntax coloring for the demo snippet
  if (line.trim().startsWith("//")) {
    return <span className="text-white/30">{line}</span>;
  }
  if (line.includes("import ") || line.includes("from ")) {
    return (
      <span>
        <span className="text-[#C084FC]">import</span>
        {line.replace("import", "")}
      </span>
    );
  }
  if (line.includes("const ") || line.includes("if ") || line.includes("else if ")) {
    const colored = line
      .replace(/\bconst\b/g, "§const§")
      .replace(/\bawait\b/g, "§await§")
      .replace(/\bif\b/g, "§if§")
      .replace(/\belse if\b/g, "§else if§")
      .replace(/\bnew\b/g, "§new§");
    const parts = colored.split("§");
    return (
      <span>
        {parts.map((p, i) =>
          ["const", "await", "if", "else if", "new"].includes(p) ? (
            <span key={i} className="text-[#C084FC]">
              {p}
            </span>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
      </span>
    );
  }
  if (line.includes("process.env")) {
    return <span className="text-[#FCD34D]">{line}</span>;
  }
  return <span>{line}</span>;
}
