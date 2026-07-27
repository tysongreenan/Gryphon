"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-[480px] px-5 py-8 sm:px-8">
        <div className="h-16 w-16 animate-pulse rounded-full bg-gryphon-ink/8" />
        <div className="mt-4 h-7 w-48 animate-pulse rounded bg-gryphon-ink/6" />
      </div>
    );
  }

  const name =
    user?.fullName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "Account";
  const email = user?.primaryEmailAddress?.emailAddress;
  const imageUrl = user?.imageUrl;
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-[480px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
      <div className="flex items-center gap-4">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="size-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gryphon-ink text-[16px] font-medium text-white">
            {initials}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="m-0 text-xl tracking-[-0.03em]">{name}</h1>
          {email && (
            <p className="mt-1 mb-0 font-mono text-xs text-gryphon-faint">
              {email}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/dashboard"
          className="inline-flex h-9 items-center rounded-md bg-gryphon-ink px-4 text-[13px] font-medium text-white hover:bg-gryphon-blue"
        >
          Copy agent prompt
        </Link>
        <SignOutButton redirectUrl="/">
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-md border border-red-600/25 px-4 text-[13px] font-medium text-[#B91C1C] hover:bg-red-600/6"
          >
            Sign out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
