"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type Props = {
  source?: string;
  className?: string;
  variant?: "hero" | "closing";
  submitLabel?: string;
};

type Status = "idle" | "loading" | "success" | "error";

export function WaitlistInline({
  source = "landing",
  className,
  variant = "hero",
  submitLabel = "Get early access →",
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setMessage("Network error. Check your connection and try again.");
    }
  }

  const inputBg = variant === "closing" ? "bg-gryphon-paper" : "bg-white";

  if (status === "success") {
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 border border-gryphon-ink/12 bg-white px-4 py-4 text-[15px] leading-snug",
          className,
        )}
        role="status"
      >
        <span className="text-gryphon-blue">✓</span>
        <span>{email} — you&apos;re on the list.</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <form
        onSubmit={onSubmit}
        className="flex flex-wrap gap-2"
        noValidate
      >
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.dev"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          className={cn(
            "h-[52px] min-w-0 flex-[1_1_230px] border border-gryphon-ink/16 px-4 text-base text-gryphon-ink outline-none placeholder:text-gryphon-ghost focus:border-gryphon-blue disabled:opacity-60",
            inputBg,
          )}
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="h-[52px] cursor-pointer bg-gryphon-ink px-6 text-base text-white transition-colors hover:bg-gryphon-blue disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Joining…" : submitLabel}
        </button>
      </form>
      {message && status === "error" && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
