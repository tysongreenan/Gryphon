export type WaitlistEntry = {
  email: string;
  useCase?: string;
  source?: string;
  createdAt: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return null;
  return email;
}

export function normalizeOptionalText(
  raw: unknown,
  maxLen = 500,
): string | undefined {
  if (typeof raw !== "string") return undefined;
  const value = raw.trim().replace(/\s+/g, " ");
  if (!value) return undefined;
  return value.slice(0, maxLen);
}

/**
 * Persist a waitlist signup.
 *
 * Backends (first match wins):
 * 1. Gryphon API — GRYPHON_API_URL (POST /v1/waitlist/)
 * 2. Supabase REST — SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * 3. Generic webhook — WAITLIST_WEBHOOK_URL (Zapier/Make/n8n/etc.)
 * 4. Local file — development only (apps/dashboard/.data/waitlist.jsonl)
 */
export async function saveWaitlistEntry(
  entry: WaitlistEntry,
): Promise<{ backend: string }> {
  const apiBase = process.env.GRYPHON_API_URL?.replace(/\/$/, "");
  if (apiBase) {
    await saveToGryphonApi(apiBase, entry);
    return { backend: "gryphon-api" };
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseKey) {
    await saveToSupabase(supabaseUrl, supabaseKey, entry);
    return { backend: "supabase" };
  }

  const webhookUrl = process.env.WAITLIST_WEBHOOK_URL;
  if (webhookUrl) {
    await saveToWebhook(webhookUrl, entry);
    return { backend: "webhook" };
  }

  // Local/dev only (or explicit opt-in). Ephemeral on serverless — not for production.
  if (
    process.env.NODE_ENV !== "production" ||
    process.env.WAITLIST_ALLOW_DEV_FILE === "true"
  ) {
    await saveToDevFile(entry);
    return { backend: "dev-file" };
  }

  throw new WaitlistConfigError(
    "No waitlist backend configured. Set GRYPHON_API_URL, SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY, or WAITLIST_WEBHOOK_URL.",
  );
}

export class WaitlistConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WaitlistConfigError";
  }
}

async function saveToGryphonApi(
  baseUrl: string,
  entry: WaitlistEntry,
): Promise<void> {
  const res = await fetch(`${baseUrl}/v1/waitlist/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: entry.email,
      use_case: entry.useCase ?? null,
      source: entry.source ?? null,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gryphon API waitlist failed (${res.status}): ${body}`);
  }
}

async function saveToSupabase(
  baseUrl: string,
  serviceKey: string,
  entry: WaitlistEntry,
): Promise<void> {
  const table = process.env.WAITLIST_TABLE?.trim() || "waitlist_signups";
  const res = await fetch(`${baseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "return=minimal,resolution=ignore-duplicates",
    },
    body: JSON.stringify({
      email: entry.email,
      use_case: entry.useCase ?? null,
      source: entry.source ?? null,
      created_at: entry.createdAt,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Supabase waitlist insert failed (${res.status}): ${body}`);
  }
}

async function saveToWebhook(
  url: string,
  entry: WaitlistEntry,
): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "waitlist.signup",
      ...entry,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Waitlist webhook failed (${res.status}): ${body}`);
  }
}

async function saveToDevFile(entry: WaitlistEntry): Promise<void> {
  const { mkdir, appendFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const dir = join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  await appendFile(
    join(dir, "waitlist.jsonl"),
    `${JSON.stringify(entry)}\n`,
    "utf8",
  );
}
