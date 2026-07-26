import { HeroDemo } from "@/components/marketing/hero-demo";
import { LoopSection } from "@/components/marketing/loop-section";
import { ScopeSection } from "@/components/marketing/scope-section";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { SystemSection } from "@/components/marketing/system-section";
import { WaitlistSectionV6 } from "@/components/marketing/waitlist-section-v6";

export default function LandingPage() {
  return (
    <main className="flex w-full flex-col overflow-x-hidden">
      <SiteHeader />
      <HeroDemo />
      <SystemSection />
      <LoopSection />
      <ScopeSection />
      <WaitlistSectionV6 />
      <SiteFooter />
    </main>
  );
}
