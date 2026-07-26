import { WaitlistForm } from "@/components/waitlist-form";
import { cn } from "@/lib/utils";

type Props = {
  heading?: string;
  description?: string;
  className?: string;
};

export function WaitlistSection({
  heading = "Join the waitlist",
  description = "Get early access to persistent authenticated sessions and human-in-the-loop recovery for AI agents.",
  className,
}: Props) {
  return (
    <section id="waitlist" className={cn("py-12 md:py-16 lg:py-24", className)}>
      <div className="container mx-auto">
        <div className="mx-auto grid max-w-5xl gap-10 overflow-hidden rounded-xl bg-accent p-8 lg:grid-cols-2 lg:items-center lg:gap-12 lg:p-12">
          <div className="flex flex-col gap-3 md:gap-4">
            <h2 className="text-2xl font-semibold tracking-tight md:text-4xl">
              {heading}
            </h2>
            <p className="max-w-xl text-muted-foreground lg:text-lg">
              {description}
            </p>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>· `get_session(site)` ready contexts after one human resolve</li>
              <li>· Slack escalation with Live View when 2FA or login appears</li>
              <li>· MCP-native tools for Claude, Cursor, and custom agents</li>
            </ul>
          </div>
          <WaitlistForm source="landing-cta" />
        </div>
      </div>
    </section>
  );
}
