import { cn } from "@/lib/utils";

/**
 * Simple-icons SVGs use fill="currentColor" and don't colorize when loaded as
 * <img>. We paint brand color through a CSS mask instead (same pattern as the
 * Gryphon v6 mockups).
 */
export const BRAND_LOGOS = {
  slack: {
    src: "/logos/slack.svg",
    // Official multi-color pinwheel
    background:
      "conic-gradient(#2EB67D 0 25%, #ECB22E 0 50%, #E01E5A 0 75%, #36C5F0 0 100%)",
  },
  whatsapp: { src: "/logos/whatsapp.svg", background: "#25D366" },
  linkedin: { src: "/logos/linkedin.svg", background: "#0A66C2" },
  gmail: { src: "/logos/gmail.svg", background: "#EA4335" },
  stripe: { src: "/logos/stripe.svg", background: "#635BFF" },
  shopify: { src: "/logos/shopify.svg", background: "#95BF47" },
  cursor: { src: "/logos/cursor.svg", background: "#0C0D10" },
  vscode: { src: "/logos/vscode.svg", background: "#007ACC" },
  claude: { src: "/logos/claude.svg", background: "#D97757" },
  chatgpt: { src: "/logos/chatgpt.svg", background: "#10A37F" },
  grok: { src: "/logos/x.svg", background: "#0C0D10" }, // xAI mark in set
  playwright: { src: "/logos/playwright.svg", background: "#2EAD33" },
  github: { src: "/logos/github.svg", background: "#181717" },
  anthropic: { src: "/logos/anthropic.svg", background: "#D4A27F" },
  openai: { src: "/logos/openai.svg", background: "#10A37F" },
} as const;

export type BrandLogoName = keyof typeof BRAND_LOGOS;

type Props = {
  name: BrandLogoName;
  /** Pixel size of the glyph (default 18). */
  size?: number;
  className?: string;
  title?: string;
  /**
   * "glyph" — colored logo only (for inline lists)
   * "badge" — colored glyph on a rounded brand-tinted chip
   * "invert" — white glyph; put on a colored background yourself
   */
  variant?: "glyph" | "badge" | "invert";
};

export function BrandLogo({
  name,
  size = 18,
  className,
  title,
  variant = "glyph",
}: Props) {
  const brand = BRAND_LOGOS[name];
  const label = title ?? name;

  if (variant === "invert") {
    return (
      <span
        role="img"
        aria-label={label}
        title={label}
        className={cn("inline-block shrink-0 bg-white", className)}
        style={{
          width: size,
          height: size,
          WebkitMask: `url(${brand.src}) center / contain no-repeat`,
          mask: `url(${brand.src}) center / contain no-repeat`,
        }}
      />
    );
  }

  if (variant === "badge") {
    return (
      <span
        role="img"
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-[5px]",
          className,
        )}
        style={{
          width: size,
          height: size,
          background: brand.background.includes("gradient")
            ? "#4A154B"
            : brand.background,
        }}
      >
        <span
          className="bg-white"
          style={{
            width: Math.round(size * 0.58),
            height: Math.round(size * 0.58),
            WebkitMask: `url(${brand.src}) center / contain no-repeat`,
            mask: `url(${brand.src}) center / contain no-repeat`,
          }}
        />
      </span>
    );
  }

  // Multi-color Slack needs the full conic fill through the mask
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn("inline-block shrink-0", className)}
      style={{
        width: size,
        height: size,
        background: brand.background,
        WebkitMask: `url(${brand.src}) center / contain no-repeat`,
        mask: `url(${brand.src}) center / contain no-repeat`,
      }}
    />
  );
}
