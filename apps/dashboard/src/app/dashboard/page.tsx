"use client";

import { useCallback, useEffect, useState } from "react";

import { DemoConsole } from "@/components/app/demo-console";
import { SetupHome } from "@/components/app/setup-home";

const DEMO_KEY = "gryphon.dashboard.view";

type View = "setup" | "demo";

export default function DashboardPage() {
  const [view, setView] = useState<View | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(DEMO_KEY);
    setView(stored === "demo" ? "demo" : "setup");
  }, []);

  const showDemo = useCallback(() => {
    localStorage.setItem(DEMO_KEY, "demo");
    setView("demo");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const showSetup = useCallback(() => {
    localStorage.setItem(DEMO_KEY, "setup");
    setView("setup");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (view === null) {
    return (
      <div className="mx-auto max-w-[640px] px-5 py-10 sm:px-8">
        <div className="h-8 w-48 animate-pulse rounded bg-gryphon-ink/6" />
        <div className="mt-6 h-40 animate-pulse rounded-lg bg-gryphon-ink/5" />
      </div>
    );
  }

  if (view === "demo") {
    return <DemoConsole onExit={showSetup} />;
  }

  return <SetupHome onPreviewDemo={showDemo} />;
}
