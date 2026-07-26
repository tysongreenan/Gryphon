"use client";

import Link from "next/link";
import { useState } from "react";

import {
  GryphonHeroMark,
  GryphonWordmark,
} from "@/components/brand/gryphon-mark";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col p-6 sm:p-10 lg:p-12">
        <Link href="/">
          <GryphonWordmark size="md" />
        </Link>

        <div className="my-auto w-full max-w-[400px] self-center py-12">
          <h1 className="m-0 text-[clamp(36px,4vw,52px)] leading-[1.02] tracking-[-0.045em] text-balance">
            Your agents kept working.
          </h1>
          <p className="mt-4 text-[15px] leading-[1.55] text-gryphon-faint">
            Sign in to see what they got done.
          </p>

          <div className="mt-8 flex flex-col gap-2.5">
            <button
              type="button"
              className="flex h-12 cursor-pointer items-center justify-center gap-2.5 rounded-md bg-gryphon-ink text-[14.5px] font-medium text-white transition-colors hover:bg-gryphon-blue"
              onClick={() => {
                // Auth wiring comes later — mock route into console
                window.location.href = "/dashboard";
              }}
            >
              <span className="inline-flex size-4 items-center justify-center rounded-full border-[1.6px] border-white text-[9px] font-semibold">
                G
              </span>
              Continue with GitHub
            </button>
            <button
              type="button"
              className="flex h-12 cursor-pointer items-center justify-center gap-2.5 rounded-md border border-gryphon-ink/16 bg-white text-[14.5px] font-medium transition-colors hover:border-gryphon-ink/40"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
            >
              <span className="bg-linear-to-r from-[#4285F4] via-[#EA4335] via-40% via-[#FBBC05] to-[#34A853] bg-clip-text text-[15px] font-semibold text-transparent">
                G
              </span>
              Continue with Google
            </button>
          </div>

          <div className="my-[22px] flex items-center gap-3.5">
            <span className="h-px flex-1 bg-gryphon-ink/10" />
            <span className="font-mono text-[11px] text-[#A6A9AF]">or</span>
            <span className="h-px flex-1 bg-gryphon-ink/10" />
          </div>

          {!sent ? (
            <form
              className="flex flex-col gap-2.5"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setSent(true);
              }}
            >
              <input
                type="email"
                required
                placeholder="you@company.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-md border border-gryphon-ink/16 bg-white px-4 text-[15px] outline-none focus:border-gryphon-blue"
              />
              <button
                type="submit"
                className="h-12 cursor-pointer rounded-md border border-gryphon-ink/16 bg-white text-[14.5px] font-medium text-gryphon-ink transition-colors hover:border-gryphon-blue hover:text-gryphon-blue"
              >
                Email me a magic link
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2.5 rounded-md border border-gryphon-blue/30 bg-gryphon-blue/5 px-4 py-3.5">
              <span className="size-[7px] shrink-0 animate-gpulse rounded-full bg-gryphon-blue" />
              <span className="text-[13.5px] leading-normal text-[#22242A]">
                Link sent to <strong className="font-medium">{email}</strong> — it
                works once and dies in 10 minutes. Fitting.
              </span>
            </div>
          )}

          <p className="mt-6 text-xs leading-[1.6] text-[#A6A9AF]">
            No password to phish. By continuing you agree to the{" "}
            <a href="#" className="text-gryphon-faint hover:text-gryphon-ink">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-gryphon-faint hover:text-gryphon-ink">
              Privacy Policy
            </a>
            .
          </p>
        </div>

        <div className="font-mono text-[11px] text-[#B9BCC3]">
          © {new Date().getFullYear()} Gryphon · status:{" "}
          <span className="text-gryphon-green">all systems live</span>
        </div>
      </div>

      <div className="relative hidden min-h-[420px] items-center justify-center overflow-hidden bg-gryphon-ink lg:flex">
        <div className="w-[min(58%,520px)]">
          <GryphonHeroMark
            priority
            className="mix-blend-screen opacity-95 [filter:invert(1)_hue-rotate(180deg)]"
          />
        </div>
        <div className="absolute right-0 bottom-0 left-0 flex items-center justify-between gap-3 px-5 py-[18px] font-mono text-[11.5px] text-white/40 sm:px-9">
          <span>overnight · 27 runs saved · 0 died on a login</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 animate-gpulse rounded-full bg-[#22C55E]" />
            holding 6 sessions warm
          </span>
        </div>
      </div>
    </div>
  );
}
