export function SiteFooter() {
  return (
    <footer className="border-t border-gryphon-ink/8">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3.5 px-4 py-6 text-sm leading-normal text-gryphon-faint sm:px-6 lg:px-10">
        <span>
          <span className="font-serif text-lg italic text-gryphon-ink">
            Gryphon
          </span>{" "}
          — keeps your agents logged in
        </span>
        <div className="flex gap-[22px]">
          <a
            href="#waitlist"
            className="text-gryphon-faint transition-colors hover:text-gryphon-ink"
          >
            Waitlist
          </a>
          <a
            href="#loop"
            className="text-gryphon-faint transition-colors hover:text-gryphon-ink"
          >
            Docs soon
          </a>
        </div>
      </div>
    </footer>
  );
}
