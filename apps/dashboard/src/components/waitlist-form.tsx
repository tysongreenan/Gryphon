"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  source?: string;
  className?: string;
  compact?: boolean;
};

type Status = "idle" | "loading" | "success" | "error";

export function WaitlistForm({
  source = "landing",
  className,
  compact = false,
}: Props) {
  const [email, setEmail] = useState("");
  const [useCase, setUseCase] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          useCase: useCase.trim() || undefined,
          source,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage("You're on the list. We'll reach out when access opens.");
      setEmail("");
      setUseCase("");
    } catch {
      setStatus("error");
      setMessage("Network error. Check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        className={cn(
          "flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-6 text-left",
          className,
        )}
        role="status"
      >
        <div className="flex items-center gap-2 text-base font-medium">
          <CheckCircle2 className="size-5 text-primary" aria-hidden />
          You&apos;re on the waitlist
        </div>
        <p className="text-sm text-muted-foreground">
          {message ?? "Thanks — we will be in touch soon."}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setStatus("idle");
            setMessage(null);
          }}
        >
          Add another email
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "flex w-full flex-col gap-3",
        compact ? "" : "rounded-xl border border-border bg-card p-6",
        className,
      )}
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="waitlist-email" className="text-sm font-medium">
          Work email
        </label>
        <input
          id="waitlist-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          disabled={status === "loading"}
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        />
      </div>

      {!compact && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="waitlist-use-case" className="text-sm font-medium">
            What are you building?{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="waitlist-use-case"
            name="useCase"
            rows={3}
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            placeholder="e.g. LinkedIn research agent that dies on 2FA overnight"
            disabled={status === "loading"}
            maxLength={500}
            className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          />
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={status === "loading" || !email.trim()}
        className="w-full sm:w-auto"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Joining…
          </>
        ) : (
          "Join the waitlist"
        )}
      </Button>

      {message && status === "error" && (
        <p className="text-sm text-destructive" role="alert">
          {message}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        No spam. Early access for agent builders who need auth reliability.
      </p>
    </form>
  );
}
