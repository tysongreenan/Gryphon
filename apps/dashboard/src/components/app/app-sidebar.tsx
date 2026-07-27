"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { GryphonWordmark } from "@/components/brand/gryphon-mark";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  match: (path: string) => boolean;
};

const NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Home",
    match: (path) => path === "/dashboard",
  },
  {
    href: "/dashboard/install",
    label: "Manual install",
    match: (path) => path.startsWith("/dashboard/install"),
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    match: (path) => path.startsWith("/dashboard/profile"),
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const displayName =
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress ||
    user?.username ||
    "Account";
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <aside className="sticky top-0 flex h-screen w-[200px] shrink-0 flex-col border-r border-gryphon-ink/9">
      <div className="flex items-center gap-2 px-[18px] pt-[18px] pb-[22px]">
        <Link href="/dashboard" aria-label="Gryphon home">
          <GryphonWordmark size="sm" />
        </Link>
      </div>

      <nav className="flex flex-col px-2.5 text-[13.5px]" aria-label="Main">
        {NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-9 items-center rounded-md px-2.5 transition-colors",
                active
                  ? "bg-gryphon-ink/5 font-medium text-gryphon-ink"
                  : "text-gryphon-muted hover:bg-gryphon-ink/[0.035] hover:text-gryphon-ink",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-gryphon-ink/7 px-[18px] py-4">
        <div className="flex items-center gap-2.5">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-[26px]",
              },
            }}
          />
          <Link
            href="/dashboard/profile"
            className="min-w-0 transition-opacity hover:opacity-80"
          >
            <span className="block truncate text-[12.5px] leading-tight">
              {displayName}
            </span>
            <span className="block truncate font-mono text-[10px] leading-normal text-[#A6A9AF]">
              {email ?? "Signed in"}
            </span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
