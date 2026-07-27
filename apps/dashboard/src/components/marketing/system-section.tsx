import Image from "next/image";

import {
  BrandLogo,
  type BrandLogoName,
} from "@/components/brand/brand-logo";

function WindowChrome({
  title,
  children,
  url,
}: {
  title?: string;
  url?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-gryphon-ink/10 bg-white shadow-[0_24px_56px_-36px_rgba(12,13,16,.6)]">
      <div className="flex items-center gap-2 border-b border-gryphon-ink/9 bg-linear-to-b from-[#F8F8F6] to-[#F0F0EE] px-3 py-2.5">
        <span className="size-2.5 rounded-full bg-[#FF5F57]" />
        <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="size-2.5 rounded-full bg-[#28C840]" />
        {url ? (
          <span className="ml-2 flex h-[26px] min-w-0 flex-1 items-center gap-1.5 rounded-md border border-gryphon-ink/9 bg-white px-2.5">
            <span className="size-2 shrink-0 rounded-[1px] border border-[#A6A9AF]" />
            <span className="truncate font-mono text-[11px] text-gryphon-faint">
              {url}
            </span>
          </span>
        ) : (
          <span className="flex-1 text-center text-[11px] text-gryphon-faint">
            {title}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export function SystemSection() {
  return (
    <section id="system" className="border-b border-gryphon-ink/8">
      <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-24">
        <div className="mb-[18px] font-mono text-[13px] text-gryphon-faint">
          what gryphon does
        </div>
        <h2 className="m-0 max-w-[18ch] text-[clamp(30px,5vw,58px)] leading-[1.08] tracking-[-0.04em] text-balance">
          Three things. Nothing else.
        </h2>

        {/* 01 Sessions */}
        <div className="mt-12 grid items-center gap-8 border-t border-gryphon-ink/14 pt-10 lg:mt-16 lg:grid-cols-2 lg:gap-16 lg:pt-12">
          <WindowChrome url="app.gryphon.dev/sessions">
            <div className="flex">
              <div className="flex w-[52px] shrink-0 flex-col items-center gap-2 border-r border-gryphon-ink/7 bg-[#FAFAF9] py-3">
                <Image
                  src="/brand/gryphon-mark.png"
                  alt=""
                  width={26}
                  height={26}
                  className="size-[26px] rounded-md object-contain"
                />
                <span className="size-[26px] rounded-md bg-gryphon-ink/6" />
                <span className="size-[26px] rounded-md bg-gryphon-ink/6" />
                <span className="mt-12 size-[26px] rounded-full bg-gryphon-ink/12" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2.5">
                  <span className="text-[15px] font-medium">Connected sites</span>
                  <span className="inline-flex h-[27px] items-center rounded-[5px] bg-gryphon-ink px-3 text-xs text-white">
                    Connect
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_auto_44px] gap-2.5 border-b border-gryphon-ink/8 px-4 pb-1.5 font-mono text-[10px] tracking-[0.1em] text-[#B9BCC3]">
                  <span>SITE</span>
                  <span>STATUS</span>
                  <span className="text-right">USED</span>
                </div>
                {(
                  [
                    {
                      name: "LinkedIn",
                      logo: "linkedin",
                      sub: "bb_ctx_4a9c",
                      status: "Ready",
                      used: "4m",
                      needs: false,
                    },
                    {
                      name: "Gmail",
                      logo: "gmail",
                      sub: "bb_ctx_1d02",
                      status: "Ready",
                      used: "2h",
                      needs: false,
                    },
                    {
                      name: "Stripe",
                      logo: "stripe",
                      sub: "waiting on you",
                      status: "Needs auth",
                      used: "now",
                      needs: true,
                    },
                    {
                      name: "Shopify",
                      logo: "shopify",
                      sub: "bb_ctx_77b1",
                      status: "Ready",
                      used: "1d",
                      needs: false,
                    },
                  ] as const
                ).map((site) => (
                  <div
                    key={site.name}
                    className={
                      site.needs
                        ? "grid grid-cols-[1fr_auto_44px] items-center gap-2.5 border-b border-gryphon-ink/5 bg-[rgba(180,83,9,.05)] px-4 py-2.5 shadow-[inset_2px_0_0_#B45309]"
                        : "grid grid-cols-[1fr_auto_44px] items-center gap-2.5 border-b border-gryphon-ink/5 px-4 py-2.5 last:border-0"
                    }
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <BrandLogo
                        name={site.logo}
                        size={21}
                        variant="badge"
                        title={site.name}
                      />
                      <span className="min-w-0">
                        <span className="block text-[13.5px] leading-tight">
                          {site.name}
                        </span>
                        <span
                          className={`block font-mono text-[10px] leading-normal ${site.needs ? "text-gryphon-amber" : "text-[#B9BCC3]"}`}
                        >
                          {site.sub}
                        </span>
                      </span>
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs ${site.needs ? "text-gryphon-amber" : "text-gryphon-green"}`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${site.needs ? "animate-gpulse bg-[#D97706]" : "bg-[#22C55E]"}`}
                      />
                      {site.status}
                    </span>
                    <span
                      className={`text-right font-mono text-[11px] ${site.needs ? "text-gryphon-amber" : "text-[#A6A9AF]"}`}
                    >
                      {site.used}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-gryphon-ink/8 bg-[#FAFAF9] px-4 py-2.5 font-mono text-[11px] text-[#A6A9AF]">
              <span>4 sites · 1 needs you</span>
              <span>synced 12s ago</span>
            </div>
          </WindowChrome>
          <div>
            <div className="mb-4 font-mono text-[13px] text-gryphon-blue">01</div>
            <div className="mb-3.5 text-[clamp(24px,2.6vw,32px)] leading-tight tracking-[-0.03em]">
              Sessions that persist
            </div>
            <p className="max-w-[44ch] text-[17px] leading-[1.6] text-gryphon-muted text-pretty">
              One authenticated context per site, stored and handed to every
              later run. No storage-state files, no cookie plumbing. A run that
              starts at 2 AM picks up the same LinkedIn session your 2 PM run
              left warm.
            </p>
          </div>
        </div>

        {/* 02 Escalation */}
        <div className="mt-12 grid items-center gap-8 border-t border-gryphon-ink/14 pt-10 lg:mt-12 lg:grid-cols-2 lg:gap-16 lg:pt-12">
          <div className="order-2 lg:order-1">
            <div className="mb-4 font-mono text-[13px] text-gryphon-blue">02</div>
            <div className="mb-3.5 text-[clamp(24px,2.6vw,32px)] leading-tight tracking-[-0.03em]">
              Escalation to a human
            </div>
            <p className="max-w-[44ch] text-[17px] leading-[1.6] text-gryphon-muted text-pretty">
              A ping with the site, the reason and a screenshot. A signed Live
              View link with a short TTL — it never carries your API key. You
              clear the wall in under a minute; the run never knows it stopped.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="font-mono text-[10.5px] tracking-[0.1em] text-[#A6A9AF]">
                DELIVERED TO
              </span>
              <span className="inline-flex items-center gap-2">
                <BrandLogo name="slack" size={18} title="Slack" />
                <span className="text-sm text-[#3A3D44]">Slack</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <BrandLogo name="whatsapp" size={18} title="WhatsApp" />
                <span className="text-sm text-[#3A3D44]">WhatsApp</span>
              </span>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="overflow-hidden rounded-[10px] border border-gryphon-ink/10 bg-white shadow-[0_24px_56px_-36px_rgba(12,13,16,.6)]">
              <div className="flex items-center justify-between gap-2 border-b border-gryphon-ink/9 px-4 py-3">
                <span className="flex min-w-0 items-baseline gap-1.5">
                  <span className="text-[15px] text-[#A6A9AF]">#</span>
                  <span className="text-sm font-semibold text-[#1D1C1D]">
                    agents-alerts
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-gryphon-faint">
                  <span className="size-2.5 rounded-full border border-[#A6A9AF]" />
                  4
                </span>
              </div>
              <div className="flex items-start gap-2.5 p-4">
                <Image
                  src="/brand/gryphon-mark.png"
                  alt=""
                  width={38}
                  height={38}
                  className="size-[38px] shrink-0 rounded-md object-contain"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <span className="text-[14.5px] font-bold text-[#1D1C1D]">
                      Gryphon
                    </span>
                    <span className="rounded-sm bg-black/8 px-1 py-0.5 text-[9px] font-bold tracking-wide text-[#616061]">
                      APP
                    </span>
                    <span className="text-[11px] text-[#8A8D94]">2:41 AM</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-normal text-[#1D1C1D]">
                    Auth required — I paused{" "}
                    <span className="rounded-sm border border-black/9 bg-black/5 px-1 py-px font-mono text-[12.5px] text-gryphon-amber">
                      outreach-v3
                    </span>{" "}
                    instead of failing it.
                  </p>
                  <div className="mt-2.5 border-l-[3px] border-gryphon-blue pl-2.5">
                    <div className="text-[13px] font-semibold text-[#1D1C1D]">
                      Stripe · 2FA verification code
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {[
                        ["AGENT", "outreach-v3"],
                        ["PAUSED FOR", "00:12"],
                        ["RUN", "#41"],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <div className="text-[10px] font-semibold tracking-wide text-[#8A8D94]">
                            {k}
                          </div>
                          <div className="mt-1 font-mono text-xs text-[#3A3D44]">
                            {v}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="relative mt-2.5 h-24 overflow-hidden rounded-[5px] border border-gryphon-ink/10 bg-gryphon-paper">
                      <div className="absolute inset-x-0 top-0 h-[18px] border-b border-gryphon-ink/7 bg-[#F1F1EF]" />
                      <div className="absolute top-1.5 left-2.5 h-[7px] w-16 rounded-sm bg-gryphon-ink/13" />
                      <div className="absolute top-8 left-4 h-[7px] w-[46%] bg-gryphon-ink/16" />
                      <div className="absolute top-[50px] left-4 flex gap-1">
                        {["7", "3", "1", "8"].map((d) => (
                          <span
                            key={d}
                            className="flex h-[21px] w-[17px] items-center justify-center rounded-sm border border-gryphon-ink/18 bg-white font-mono text-xs text-[#22242A]"
                          >
                            {d}
                          </span>
                        ))}
                        <span className="flex h-[21px] w-[17px] items-center justify-center rounded-sm border-[1.4px] border-gryphon-blue/55 bg-white">
                          <span className="h-3 w-px bg-gryphon-blue" />
                        </span>
                        <span className="h-[21px] w-[17px] rounded-sm border border-gryphon-ink/18 bg-white" />
                      </div>
                      <div className="absolute right-2.5 bottom-2 font-mono text-[9.5px] text-[#B9BCC3]">
                        captured 2:41 AM
                      </div>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <span className="inline-flex h-[34px] items-center rounded-[5px] bg-gryphon-ink px-4 text-[13px] font-semibold text-white">
                        Open Live View
                      </span>
                      <span className="inline-flex h-[34px] items-center rounded-[5px] border border-gryphon-ink/18 px-4 text-[13px] font-semibold text-[#1D1C1D]">
                        Mark resolved
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-6 items-center gap-1 rounded-xl border border-gryphon-blue/35 bg-gryphon-blue/8 px-2.5 text-[11px] font-semibold text-gryphon-blue">
                      ✓ 1
                    </span>
                    <span className="text-xs font-semibold text-gryphon-blue">
                      1 reply
                    </span>
                    <span className="text-xs text-[#8A8D94]">
                      resolved by you · 7:12 AM
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gryphon-ink/8 bg-[#FAFAF9] px-4 py-2.5 font-mono text-[11px] text-[#A6A9AF]">
                app.gryphon.dev/live/esc_8f31
              </div>
            </div>
          </div>
        </div>

        {/* 03 Handback — same WindowChrome language as 01 / 02 */}
        <div className="mt-12 grid items-center gap-8 border-t border-gryphon-ink/14 pt-10 lg:mt-12 lg:grid-cols-2 lg:gap-16 lg:pt-12">
          <WindowChrome title="outreach-v3 — agent.py">
            <div className="flex items-center justify-between gap-2 border-b border-gryphon-ink/8 px-4 py-2.5">
              <span className="flex min-w-0 items-center gap-2">
                <BrandLogo name="stripe" size={18} title="Stripe" />
                <span className="truncate text-[13.5px] font-medium text-[#22242A]">
                  Pull July invoices from Stripe
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-gryphon-green">
                <span className="size-1.5 rounded-full bg-[#22C55E]" />
                done
              </span>
            </div>
            <div className="flex flex-col gap-3 p-4">
              <div className="max-w-[88%] self-end rounded-[15px] bg-[#F2F2F0] px-3.5 py-2 text-[13px] leading-normal text-[#22242A]">
                grab every invoice from stripe overnight
              </div>

              <div className="flex flex-col gap-1.5 font-mono text-[11px] leading-snug text-[#8A8D94]">
                <span>
                  02:41 · 2FA wall ·{" "}
                  <span className="text-gryphon-amber">needs_auth</span> · held
                  by gryphon
                </span>
                <span>
                  07:12 · login cleared ·{" "}
                  <span className="text-gryphon-blue">connect_url</span> ·
                  session warm
                </span>
              </div>

              {/* Climax: agent finished work after login — table language matches 01 */}
              <div className="overflow-hidden rounded-[8px] border border-gryphon-ink/10 bg-white">
                <div className="flex items-center justify-between gap-2 border-b border-gryphon-ink/8 bg-[#FAFAF9] px-3 py-2.5">
                  <span className="flex min-w-0 items-center gap-2">
                    <Image
                      src="/brand/gryphon-mark.png"
                      alt=""
                      width={21}
                      height={21}
                      className="size-[21px] shrink-0 rounded-[5px] object-contain"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-[#22242A]">
                        july-invoices.csv
                      </span>
                      <span className="block font-mono text-[10px] text-[#A6A9AF]">
                        agent wrote · after login
                      </span>
                    </span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-gryphon-green/10 px-2 py-1 font-mono text-[11px] text-gryphon-green">
                    38 rows
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_auto_44px] gap-2.5 border-b border-gryphon-ink/8 px-3 pb-1.5 pt-2 font-mono text-[10px] tracking-[0.1em] text-[#B9BCC3]">
                  <span>INVOICE</span>
                  <span>AMOUNT</span>
                  <span className="text-right">STATUS</span>
                </div>
                {(
                  [
                    ["INV-1042", "$1,240", "Paid", false],
                    ["INV-1058", "$890", "Paid", false],
                    ["INV-1071", "$2,100", "Open", true],
                    ["INV-1079", "$640", "Paid", false],
                  ] as const
                ).map(([id, amt, st, open]) => (
                  <div
                    key={id}
                    className="grid grid-cols-[1fr_auto_44px] items-center gap-2.5 border-b border-gryphon-ink/5 px-3 py-2.5 last:border-0"
                  >
                    <span className="font-mono text-[12.5px] text-[#22242A]">
                      {id}
                    </span>
                    <span className="font-mono text-[12px] text-[#8A8D94]">
                      {amt}
                    </span>
                    <span
                      className={`text-right text-xs ${open ? "text-gryphon-amber" : "text-gryphon-green"}`}
                    >
                      {st}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[13px] leading-[1.55] text-[#22242A]">
                Done — finished the pull after auth. You spent 54 seconds; the
                agent never lost the thread.
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-gryphon-ink/8 bg-[#FAFAF9] px-4 py-2.5 font-mono text-[11px] text-[#A6A9AF]">
              <span>session · bb_ctx_4a9c</span>
              <span>gryphon · mcp</span>
            </div>
          </WindowChrome>
          <div>
            <div className="mb-4 font-mono text-[13px] text-gryphon-blue">03</div>
            <div className="mb-3.5 text-[clamp(24px,2.6vw,32px)] leading-tight tracking-[-0.03em]">
              Clean handback
            </div>
            <p className="max-w-[44ch] text-[17px] leading-[1.6] text-gryphon-muted text-pretty">
              The agent gets a session and finishes the job where it stopped.
              It never sees a credential, only a session — the login lives in
              Gryphon, not in your code.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="font-mono text-[10.5px] tracking-[0.1em] text-[#A6A9AF]">
                WORKS WITH
              </span>
              {(
                [
                  { name: "Cursor", logo: "cursor" },
                  { name: "VS Code", logo: "vscode" },
                  { name: "Claude", logo: "claude" },
                  { name: "ChatGPT", logo: "chatgpt" },
                  { name: "Grok", logo: "grok" },
                ] as const satisfies ReadonlyArray<{
                  name: string;
                  logo: BrandLogoName;
                }>
              ).map((t) => (
                <span key={t.name} className="inline-flex items-center gap-2">
                  <BrandLogo name={t.logo} size={18} title={t.name} />
                  <span className="text-sm text-[#3A3D44]">{t.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
