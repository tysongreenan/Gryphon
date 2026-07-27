import { WaitlistInline } from "@/components/marketing/waitlist-inline";

export function WaitlistSectionV6() {
  return (
    <section id="waitlist" className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[120%] left-1/2 size-0">
          {(
            [
              { a: 255, w: 900, h: 5, blur: 4, c: "rgba(29,78,216,.45),rgba(147,197,253,0)" },
              { a: 262, w: 800, h: 2, blur: 1, c: "rgba(59,130,246,.6),rgba(191,219,254,0)" },
              { a: 270, w: 950, h: 9, blur: 9, c: "rgba(96,165,250,.3),rgba(219,234,254,0)" },
              { a: 278, w: 820, h: 2, blur: 1.5, c: "rgba(30,64,175,.5),rgba(191,219,254,0)" },
              { a: 285, w: 880, h: 6, blur: 6, c: "rgba(37,99,235,.35),rgba(219,234,254,0)" },
            ] as const
          ).map((r) => (
            <div
              key={r.a}
              className="absolute top-0 left-0 origin-left"
              style={{
                width: r.w,
                height: r.h,
                filter: `blur(${r.blur}px)`,
                background: `linear-gradient(90deg,${r.c})`,
                transform: `translateY(-50%) rotate(${r.a}deg)`,
              }}
            />
          ))}
        </div>
      </div>
      <div className="relative mx-auto max-w-[1320px] px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-10 lg:py-28">
        <h2 className="mx-auto m-0 max-w-[18ch] text-[clamp(32px,5.6vw,66px)] leading-[1.02] tracking-[-0.045em] text-balance">
          Make authentication boring so your agents can do interesting work.
        </h2>
        <p className="mx-auto mt-[22px] max-w-[46ch] text-[17px] leading-[1.55] text-gryphon-muted text-pretty">
          Access opens in small batches. Tell us the site that keeps breaking
          and we&apos;ll start there.
        </p>
        <div className="mx-auto mt-8 max-w-[520px] text-left">
          <WaitlistInline
            source="closing"
            variant="closing"
            submitLabel="Join the waitlist →"
            showSiteField
          />
        </div>
      </div>
    </section>
  );
}
