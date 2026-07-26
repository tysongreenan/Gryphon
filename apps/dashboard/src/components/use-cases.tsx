import { cn } from "@/lib/utils";

type UseCase = {
  title: string;
  body: string;
  tag: string;
};

type Props = {
  heading?: string;
  description?: string;
  items?: UseCase[];
  className?: string;
};

const defaults: UseCase[] = [
  {
    tag: "Research agents",
    title: "Sessions die mid-scrape",
    body: "Overnight LinkedIn or CRM jobs fail when cookies expire or 2FA pops. Gryphon keeps a durable context and escalates to a human only when re-auth is required.",
  },
  {
    tag: "Browserbase / Stagehand",
    title: "Contexts without the recovery path",
    body: "Browserbase Contexts store state — Gryphon owns the loop: get_session, human resolve via Live View, then ready sessions on later runs.",
  },
  {
    tag: "MCP agent builders",
    title: "Auth as a first-class tool",
    body: "Wire get_session and request_human_auth into Claude or Cursor. The agent pauses cleanly, a human finishes login, and work continues without rewriting the workflow.",
  },
  {
    tag: "Indie / small teams",
    title: "Stop pasting cookies",
    body: "No more babysitting logins every morning. One successful resolve, then later runs call get_session(site) and start already authenticated.",
  },
];

export function UseCases({
  heading = "Built for the auth failure mode",
  description = "Not fake testimonials — concrete situations Gryphon is designed for. Real quotes come after real users.",
  items = defaults,
  className,
}: Props) {
  return (
    <section id="use-cases" className={cn("py-16 md:py-24", className)}>
      <div className="container mx-auto">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {heading}
          </h2>
          <p className="mt-3 text-muted-foreground md:text-lg">{description}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
          {items.map((item) => (
            <article
              key={item.title}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6"
            >
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {item.tag}
              </span>
              <h3 className="text-lg font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
