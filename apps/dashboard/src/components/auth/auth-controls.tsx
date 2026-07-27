"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

import { cn } from "@/lib/utils";

type AuthControlsProps = {
  className?: string;
  /** denser styling for marketing header */
  variant?: "header" | "compact";
};

export function AuthControls({
  className,
  variant = "header",
}: AuthControlsProps) {
  return (
    <div className={cn("flex items-center gap-2 sm:gap-3", className)}>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button
            type="button"
            className={cn(
              "cursor-pointer text-gryphon-muted transition-colors hover:text-gryphon-ink",
              variant === "header" && "hidden text-[15px] sm:inline",
              variant === "compact" && "text-[13.5px]",
            )}
          >
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button
            type="button"
            className={cn(
              "cursor-pointer whitespace-nowrap bg-gryphon-ink text-white transition-colors hover:bg-gryphon-blue",
              variant === "header" && "px-[18px] py-[11px] text-[14.5px]",
              variant === "compact" && "rounded-md px-3 py-2 text-[13px]",
            )}
          >
            Sign up
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <a
          href="/dashboard"
          className={cn(
            "text-gryphon-muted transition-colors hover:text-gryphon-ink",
            variant === "header" && "hidden text-[15px] sm:inline",
            variant === "compact" && "text-[13.5px]",
          )}
        >
          Dashboard
        </a>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8",
            },
          }}
        />
      </Show>
    </div>
  );
}
