import { BrandLogo } from "@/components/brand/brand-logo";

export function ScopeSection() {
  return (
    <section id="scope" className="border-b border-gryphon-ink/8">
      <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-24">
        <h2 className="m-0 max-w-[17ch] text-[clamp(30px,5vw,58px)] leading-[1.05] tracking-[-0.04em] text-balance">
          One layer in your stack.
        </h2>
        <p className="mt-[18px] max-w-[48ch] text-[17px] leading-[1.55] text-gryphon-muted text-pretty">
          Keep the browser, the driver and the agent you already run. Gryphon
          owns the auth layer and nothing above it.
        </p>

        <div className="mt-10 flex max-w-[840px] flex-col gap-2 lg:mt-12">
          <div className="flex items-center gap-4 border border-gryphon-ink/12 bg-white px-[22px] py-5">
            <span className="w-16 shrink-0 font-mono text-xs text-[#A6A9AF]">
              brain
            </span>
            <span className="inline-flex shrink-0 items-center gap-2">
              <BrandLogo name="claude" size={17} title="Claude" />
              <BrandLogo name="chatgpt" size={17} title="ChatGPT" />
              <BrandLogo name="grok" size={17} title="Grok" />
            </span>
            <span className="text-[clamp(17px,2vw,20px)] tracking-[-0.02em]">
              Your agent
            </span>
            <span className="ml-auto text-right text-[14.5px] text-[#8A8D94]">
              decides what to do
            </span>
          </div>

          <div className="flex items-center gap-4 border border-gryphon-ink/12 bg-white px-[22px] py-5">
            <span className="w-16 shrink-0 font-mono text-xs text-[#A6A9AF]">
              driver
            </span>
            {/* Playwright SVG already has multi-color fills — use native img */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/playwright.svg"
              alt="Playwright"
              width={17}
              height={17}
              className="size-[17px] shrink-0"
            />
            <span className="text-[clamp(17px,2vw,20px)] tracking-[-0.02em]">
              Stagehand / Playwright
            </span>
            <span className="ml-auto text-right text-[14.5px] text-[#8A8D94]">
              drives the page
            </span>
          </div>

          <div className="flex items-center gap-4 border border-gryphon-ink/12 bg-white px-[22px] py-5">
            <span className="w-16 shrink-0 font-mono text-xs text-[#A6A9AF]">
              browser
            </span>
            <span className="inline-flex size-[17px] shrink-0 items-center justify-center rounded bg-[#F03603] text-[10px] font-bold text-white">
              B
            </span>
            <span className="text-[clamp(17px,2vw,20px)] tracking-[-0.02em]">
              Browserbase
            </span>
            <span className="ml-auto text-right text-[14.5px] text-[#8A8D94]">
              runs the browser
            </span>
          </div>

          <div className="relative flex items-center gap-4 bg-gryphon-ink px-[22px] py-6 shadow-[0_22px_48px_-30px_rgba(12,13,16,.8)]">
            <span className="absolute top-0 bottom-0 left-0 w-[3px] bg-gryphon-blue" />
            <span className="w-16 shrink-0 font-mono text-xs text-[#93C5FD]">
              auth
            </span>
            <span className="text-[clamp(19px,2.3vw,24px)] tracking-[-0.025em] text-white">
              Gryphon
            </span>
            <span className="ml-auto text-right text-[14.5px] text-[#B9BCC3]">
              keeps it logged in
            </span>
          </div>
        </div>

        <p className="mt-6 max-w-[70ch] font-mono text-sm leading-[1.7] text-[#8A8D94]">
          Not an agent framework · not a browser platform · no site-specific
          actions · no automated CAPTCHA solving
        </p>
      </div>
    </section>
  );
}
