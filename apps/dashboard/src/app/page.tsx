import {
  Book,
  Bot,
  KeyRound,
  MessageSquare,
  Shield,
  Terminal,
  Zap,
} from "lucide-react";

import { Feature43 } from "@/components/feature43";
import { Footer2 } from "@/components/footer2";
import { Hero115 } from "@/components/hero115";
import { Logos18 } from "@/components/logos18";
import { Navbar1 } from "@/components/navbar1";
import { Pricing2 } from "@/components/pricing2";
import { UseCases } from "@/components/use-cases";
import { WaitlistSection } from "@/components/waitlist-section";

export default function LandingPage() {
  return (
    <main className="flex w-full flex-col">
      <Navbar1
        logo={{
          url: "/",
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
          alt: "Gryphon",
          title: "Gryphon",
        }}
        menu={[
          { title: "Home", url: "/" },
          {
            title: "Product",
            url: "#features",
            items: [
              {
                title: "Sessions",
                description:
                  "get_session(site) returns ready Browserbase contexts for agents",
                icon: <KeyRound className="size-5 shrink-0" />,
                url: "#features",
              },
              {
                title: "Escalation",
                description:
                  "Human-in-the-loop recovery when agents hit login or 2FA",
                icon: <MessageSquare className="size-5 shrink-0" />,
                url: "#features",
              },
              {
                title: "MCP tools",
                description:
                  "Native tools for Claude, Cursor, and custom agent runtimes",
                icon: <Terminal className="size-5 shrink-0" />,
                url: "#features",
              },
              {
                title: "Use cases",
                description: "Where auth reliability unblocks agent work",
                icon: <Book className="size-5 shrink-0" />,
                url: "#use-cases",
              },
            ],
          },
          { title: "Pricing", url: "#pricing" },
          { title: "Waitlist", url: "#waitlist" },
        ]}
        auth={{
          login: { title: "Docs", url: "#features" },
          signup: { title: "Join waitlist", url: "#waitlist" },
        }}
      />

      <Hero115
        icon={<Shield className="size-6" />}
        heading="Your agents stop dying on logins and 2FA"
        description="Gryphon is the reliability layer for authenticated web access. Persistent sessions for AI agents, plus human-in-the-loop recovery when authentication is required."
        buttons={{
          primary: {
            text: "Join the waitlist",
            url: "#waitlist",
          },
          secondary: {
            text: "See how it works",
            url: "#features",
          },
        }}
        byline="MCP-native · REST API · Browserbase Contexts · Slack escalation"
        image={{
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/saas-hero/saas-hero-1-16x9.png",
          srcDark:
            "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/saas-hero/saas-hero-1-16x9-dark.png",
          alt: "Gryphon authenticated sessions for AI agents",
        }}
      />

      <Logos18
        logos={[
          {
            src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/logos/fictional-company-logo-1.svg",
            alt: "Browserbase",
            className: "h-7 w-auto",
          },
          {
            src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/logos/fictional-company-logo-2.svg",
            alt: "Stagehand",
            className: "h-7 w-auto",
          },
          {
            src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/logos/fictional-company-logo-3.svg",
            alt: "Playwright",
            className: "h-7 w-auto",
          },
          {
            src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/logos/fictional-company-logo-4.svg",
            alt: "Claude Computer Use",
            className: "h-7 w-auto",
          },
          {
            src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/logos/fictional-company-logo-5.svg",
            alt: "MCP",
            className: "h-5 w-auto",
          },
          {
            src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/logos/fictional-company-logo-6.svg",
            alt: "LangGraph",
            className: "h-7 w-auto",
          },
        ]}
      />

      <section id="features">
        <Feature43
          heading="Auth reliability infrastructure — nothing else"
          features={[
            {
              icon: <KeyRound className="size-5" />,
              title: "Persistent authenticated sessions",
              description:
                "get_session(site) returns a ready Browserbase context or connect URL so agents start already logged in.",
            },
            {
              icon: <MessageSquare className="size-5" />,
              title: "Human-in-the-loop escalation",
              description:
                "When 2FA, CAPTCHA, or login appears, pause the agent, notify the human owner, and resume with a fresh session.",
            },
            {
              icon: <Terminal className="size-5" />,
              title: "MCP-native + REST API",
              description:
                "Drop into Claude, Cursor, or custom agents via MCP tools — or call a simple REST API with an API key.",
            },
            {
              icon: <Shield className="size-5" />,
              title: "Auth reliability only",
              description:
                "Gryphon does not run your agent or automate site actions. It protects authenticated state so agents keep working.",
            },
            {
              icon: <Zap className="size-5" />,
              title: "Browserbase-first",
              description:
                "Durable Contexts for storage, short-lived Sessions for agents, Live View for humans. Fake mode for local demos.",
            },
            {
              icon: <Bot className="size-5" />,
              title: "Built for agent builders",
              description:
                "Works alongside Browserbase, Stagehand, Playwright, and Claude Computer Use — the reliability layer they all need.",
            },
          ]}
          buttons={{
            primary: {
              text: "Join the waitlist",
              url: "#waitlist",
            },
          }}
        />
      </section>

      <UseCases />

      <section id="pricing">
        <Pricing2
          heading="Simple pricing (coming soon)"
          description="Join the waitlist for early access. Plans below are directional — not open for purchase yet."
          plans={[
            {
              name: "Developer",
              image:
                "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/pricing-plans/plan1.svg",
              description: "Local demos and early agent experiments",
              monthlyPrice: "$0",
              yearlyPrice: "$0",
              features: [
                "API keys + MCP server",
                "get_session + escalation APIs",
                "Browserbase fake mode",
                "Slack notifications",
                "Community support",
              ],
              button: {
                text: "Join waitlist",
                url: "#waitlist",
              },
            },
            {
              name: "Team",
              image:
                "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/pricing-plans/plan2.svg",
              description: "Production agents that must stay authenticated",
              monthlyPrice: "$49",
              yearlyPrice: "$470",
              features: [
                "Everything in Developer",
                "Durable Browserbase Contexts",
                "Live View human resolve",
                "Audit log of escalations",
                "Priority support",
                "Multiple users & API keys",
              ],
              button: {
                text: "Join waitlist",
                url: "#waitlist",
              },
              highlighted: true,
            },
          ]}
        />
      </section>

      <WaitlistSection
        heading="Stop babysitting logins"
        description="Early access for builders who need authenticated sessions that survive overnight. Tell us what you're shipping."
      />

      <Footer2
        logo={{
          url: "/",
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
          alt: "Gryphon",
          title: "Gryphon",
        }}
        description="Reliable authenticated sessions and human-in-the-loop recovery for AI agents."
        sections={[
          {
            title: "Product",
            links: [
              { name: "Features", href: "#features" },
              { name: "Use cases", href: "#use-cases" },
              { name: "Pricing", href: "#pricing" },
              { name: "Waitlist", href: "#waitlist" },
            ],
          },
          {
            title: "Developers",
            links: [
              { name: "get_session", href: "#features" },
              { name: "Escalation", href: "#features" },
              { name: "MCP tools", href: "#features" },
            ],
          },
          {
            title: "Company",
            links: [
              { name: "Join waitlist", href: "#waitlist" },
            ],
          },
          {
            title: "Legal",
            links: [
              { name: "Privacy", href: "#waitlist" },
              { name: "Terms", href: "#waitlist" },
            ],
          },
        ]}
        copyright={`© ${new Date().getFullYear()} Gryphon. All rights reserved.`}
        legalLinks={[
          { name: "Terms", href: "#waitlist" },
          { name: "Privacy", href: "#waitlist" },
        ]}
      />
    </main>
  );
}
