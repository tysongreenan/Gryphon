"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export function CopyBlock({
  code,
  label,
  className,
  language,
}: {
  code: string;
  label?: string;
  className?: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can fail in insecure contexts; ignore.
    }
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-gryphon-ink/9 bg-gryphon-ink/[0.03]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-gryphon-ink/7 px-3 py-1.5">
        <span className="font-mono text-[10.5px] tracking-[0.06em] text-gryphon-ghost uppercase">
          {label ?? language ?? "code"}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex h-6 items-center rounded-md border border-gryphon-ink/12 bg-white px-2 font-mono text-[10.5px] text-gryphon-muted transition-colors hover:border-gryphon-blue hover:text-gryphon-blue"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-relaxed text-gryphon-ink whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}
