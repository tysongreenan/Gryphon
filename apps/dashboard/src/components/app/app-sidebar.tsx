"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GryphonWordmark } from "@/components/brand/gryphon-mark";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  badge?: string;
  badgeTone?: "amber" | "muted";
  meta?: string;
};

const NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Escalations",
    badge: "1",
    badgeTone: "amber",
  },
  {
    href: "/dashboard#sessions",
    label: "Sessions",
    meta: "5/6",
  },
  {
    href: "/dashboard#api-keys",
    label: "API keys",
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
  },
];

export function AppSidebar({ openCount = 1 }: { openCount?: number }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[212px] shrink-0 flex-col border-r border-gryphon-ink/9">
      <div className="flex items-center gap-2 px-[18px] pt-[18px] pb-[22px]">
        <Link href="/">
          <GryphonWordmark size="sm" />
        </Link>
      </div>

      <nav className="flex flex-col px-2.5 text-[13.5px]">
        {NAV.map((item) => {
          const pathOnly = item.href.split("#")[0];
          const active =
            pathOnly === "/dashboard"
              ? pathname === "/dashboard" && !item.href.includes("#")
              : pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);

          const badge =
            item.label === "Escalations"
              ? openCount > 0
                ? String(openCount)
                : "0"
              : item.badge;
          const badgeTone =
            item.label === "Escalations"
              ? openCount > 0
                ? "amber"
                : "muted"
              : item.badgeTone;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex h-9 items-center justify-between rounded-md px-2.5 transition-colors",
                active
                  ? "bg-gryphon-ink/5 font-medium text-gryphon-ink"
                  : "text-gryphon-muted hover:bg-gryphon-ink/[0.035] hover:text-gryphon-ink",
              )}
            >
              <span>{item.label}</span>
              {badge != null && (
                <span
                  className={cn(
                    "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 font-mono text-[10.5px] font-medium",
                    badgeTone === "amber"
                      ? "bg-gryphon-amber text-white"
                      : "bg-gryphon-ink/14 text-white",
                  )}
                >
                  {badge}
                </span>
              )}
              {item.meta && (
                <span className="font-mono text-[11px] text-[#A6A9AF]">
                  {item.meta}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-gryphon-ink/7 px-[18px] py-4">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-gryphon-ink text-[11px] font-medium text-white">
            MK
          </span>
          <span className="min-w-0">
            <span className="block text-[12.5px] leading-tight">
              Mara Kimura
            </span>
            <span className="block font-mono text-[10px] leading-normal text-[#A6A9AF]">
              on-call · Slack linked
            </span>
          </span>
        </Link>
      </div>
    </aside>
  );
}
