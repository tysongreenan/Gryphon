import { NextResponse } from "next/server";

import {
  WaitlistConfigError,
  normalizeEmail,
  normalizeOptionalText,
  saveWaitlistEntry,
} from "@/lib/waitlist";

export const runtime = "nodejs";

type Body = {
  email?: unknown;
  useCase?: unknown;
  source?: unknown;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 },
    );
  }

  const useCase = normalizeOptionalText(body.useCase, 500);
  const source = normalizeOptionalText(body.source, 80) ?? "landing";

  try {
    const { backend } = await saveWaitlistEntry({
      email,
      useCase,
      source,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, backend });
  } catch (err) {
    if (err instanceof WaitlistConfigError) {
      console.error("[waitlist]", err.message);
      return NextResponse.json(
        {
          error:
            "Waitlist is not configured yet. Please try again later or email hello@gryphon.dev.",
        },
        { status: 503 },
      );
    }

    console.error("[waitlist] save failed", err);
    return NextResponse.json(
      { error: "Could not join the waitlist. Please try again." },
      { status: 500 },
    );
  }
}
