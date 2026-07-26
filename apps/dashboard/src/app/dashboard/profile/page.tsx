const RESCUES = [
  {
    title: "Stripe · 2FA verification code",
    speed: "54s",
    speedFg: "#7A7D85",
    when: "2h ago",
    meta: "outreach-v3 · run #41 · claimed from Slack",
  },
  {
    title: "LinkedIn · checkpoint puzzle",
    speed: "1m 04s",
    speedFg: "#7A7D85",
    when: "1d ago",
    meta: "outreach-v3 · run #39 · claimed from Slack",
  },
  {
    title: "Gmail · device confirmation",
    speed: "12s",
    speedFg: "#15803D",
    when: "4d ago",
    meta: "pipeline-sync · run #62 · your fastest",
  },
  {
    title: "Stripe · session expired, re-login",
    speed: "47s",
    speedFg: "#7A7D85",
    when: "6d ago",
    meta: "books-nightly · run #08 · claimed from WhatsApp",
  },
];

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-[760px] px-5 py-6 sm:px-8 sm:py-7 lg:px-10">
      <div className="flex items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gryphon-ink text-[22px] font-medium tracking-[-0.02em] text-white">
          MK
        </span>
        <div className="min-w-0">
          <h1 className="m-0 text-2xl tracking-[-0.03em]">Mara Kimura</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-3.5 font-mono text-xs text-gryphon-faint">
            <span>mara@acme.dev</span>
            <span className="inline-flex items-center gap-1.5 text-gryphon-green">
              <span className="size-1.5 animate-gpulse rounded-full bg-[#22C55E]" />
              on-call now
            </span>
          </div>
        </div>
        <button
          type="button"
          className="ml-auto inline-flex h-8 shrink-0 cursor-pointer items-center rounded-md border border-gryphon-ink/14 px-3.5 text-[12.5px] font-medium text-[#3A3D44] transition-colors hover:border-gryphon-blue hover:text-gryphon-blue"
        >
          Edit
        </button>
      </div>

      <div className="mt-[22px] grid grid-cols-2 overflow-hidden rounded-lg border border-gryphon-ink/9 bg-white sm:grid-cols-4">
        {[
          { k: "RESCUES", v: "19", sub: "all time" },
          {
            k: "MEDIAN SPEED",
            v: "47s",
            sub: "team best",
            subClass: "text-gryphon-green",
          },
          { k: "FASTEST", v: "12s", sub: "Gmail · run #62" },
          { k: "NIGHT OWL", v: "3", sub: "rescues after 1 AM" },
        ].map((stat, i) => (
          <div
            key={stat.k}
            className={
              i < 3
                ? "border-r border-gryphon-ink/6 px-4 py-3.5"
                : "px-4 py-3.5"
            }
          >
            <div className="font-mono text-[10px] tracking-[0.08em] text-[#B9BCC3]">
              {stat.k}
            </div>
            <div className="mt-2 text-[22px] tracking-[-0.02em]">{stat.v}</div>
            <div
              className={`mt-1 font-mono text-[10.5px] leading-snug ${stat.subClass ?? "text-[#A6A9AF]"}`}
            >
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7 flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-lg tracking-[-0.02em]">On-call</h2>
        <span className="font-mono text-[11px] text-[#A6A9AF]">
          who gets woken up
        </span>
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-gryphon-ink/9 bg-white">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3.5 border-b border-gryphon-ink/6 bg-gryphon-blue/[0.03] px-4 py-3 shadow-[inset_2px_0_0_#1D4ED8]">
          <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-gryphon-ink text-[11px] font-medium text-white">
            MK
          </span>
          <span className="min-w-0">
            <span className="block text-[13.5px] font-medium leading-tight">
              You
            </span>
            <span className="mt-0.5 block font-mono text-[10.5px] leading-snug text-[#A6A9AF]">
              Slack + WhatsApp · quiet 11PM–7AM
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-gryphon-blue">
            <span className="size-1.5 animate-gpulse rounded-full bg-gryphon-blue" />
            on-call until Mon 9 AM
          </span>
        </div>
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3.5 px-4 py-3">
          <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-gryphon-ink/8 text-[11px] font-medium text-gryphon-muted">
            DP
          </span>
          <span className="min-w-0">
            <span className="block text-[13.5px] leading-tight">Dev Patel</span>
            <span className="mt-0.5 block font-mono text-[10.5px] leading-snug text-[#A6A9AF]">
              Slack only
            </span>
          </span>
          <span className="text-xs text-gryphon-faint">next up</span>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-gryphon-ink/6 bg-[#FAFAF9] px-4 py-2.5 font-mono text-[11px] text-[#A6A9AF]">
          <span>rotates weekly · Mon 9 AM</span>
          <span className="cursor-pointer text-gryphon-faint hover:text-gryphon-blue">
            swap a week →
          </span>
        </div>
      </div>

      <div className="mt-7 flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-lg tracking-[-0.02em]">Recent rescues</h2>
        <span className="font-mono text-[11px] text-[#A6A9AF]">your last 4</span>
      </div>
      <div className="mt-2.5 border-t border-gryphon-ink/10">
        {RESCUES.map((r) => (
          <div
            key={r.title + r.when}
            className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-1.5 border-b border-gryphon-ink/6 py-3"
          >
            <span className="min-w-0 text-[13.5px] leading-snug">{r.title}</span>
            <span
              className="font-mono text-[11px]"
              style={{ color: r.speedFg }}
            >
              {r.speed}
            </span>
            <span className="min-w-[52px] text-right font-mono text-[11px] text-[#A6A9AF]">
              {r.when}
            </span>
            <span className="col-span-full font-mono text-[10.5px] leading-snug text-[#B9BCC3]">
              {r.meta}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-7 flex items-center justify-between gap-3 rounded-lg border border-gryphon-ink/9 bg-white px-4 py-3.5">
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-medium leading-tight">
            Signed in via GitHub
          </span>
          <span className="mt-0.5 block font-mono text-[11px] leading-normal text-[#A6A9AF]">
            mara-kimura · last sign-in 2h ago · 2 active devices
          </span>
        </span>
        <button
          type="button"
          className="inline-flex h-[30px] shrink-0 cursor-pointer items-center rounded-[5px] border border-gryphon-ink/14 px-3 text-[12.5px] font-medium text-[#3A3D44] transition-colors hover:border-gryphon-ink/40"
        >
          Manage
        </button>
        <a
          href="/sign-in"
          className="inline-flex h-[30px] shrink-0 items-center rounded-[5px] border border-red-600/25 px-3 text-[12.5px] font-medium text-[#B91C1C] transition-colors hover:bg-red-600/6"
        >
          Sign out
        </a>
      </div>
    </div>
  );
}
