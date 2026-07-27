import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Mockup stack:
//   UI / body  → Helvetica Neue (system)
//   Mono       → JetBrains Mono
//   Accent     → Instrument Serif (italic lockups)

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gryphon — Agents that never die on a login",
  description:
    "Gryphon holds the authenticated session, and pulls in a human the moment auth breaks. Runs pause for a minute instead of dying overnight.",
  openGraph: {
    title: "Gryphon — Agents that never die on a login",
    description:
      "Persistent sessions + human-in-the-loop recovery for browser agents. MCP-native · REST · Browserbase.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <ClerkProvider appearance={{ theme: shadcn }}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}