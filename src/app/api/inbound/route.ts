import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import { isConvexConfigured, publicMutation } from "@/lib/convex/server";

// Contact + "Get a free preview" form submissions from the agency site.
// Each one becomes a high-score inbound lead that enters the normal automated flow.

const schema = z.object({
  kind: z.enum(["contact", "free_preview"]),
  name: z.string().trim().min(1).max(120),
  business_name: z.string().trim().max(160).optional().default(""),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: z.string().trim().max(40).optional().default(""),
  city: z.string().trim().max(80).optional().default(""),
  current_url: z.string().trim().max(300).optional().default(""),
  message: z.string().trim().min(1).max(4000),
  company_website: z.string().optional(), // honeypot
});

// Best-effort per-instance throttle. Good enough to stop casual form spam.
const hits = new Map<string, number[]>();
function throttled(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (throttled(ip)) {
    return NextResponse.json({ error: "Too many submissions. Please try again in a few minutes." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }
  const input = parsed.data;

  // Bots fill the hidden field. Pretend it worked so they don't retry.
  if (input.company_website) return NextResponse.json({ ok: true });

  if (!isConvexConfigured() || !process.env.INBOUND_SECRET) {
    console.info("[demo mode] inbound lead received", { kind: input.kind, city: input.city });
    return NextResponse.json({ ok: true, demo: true });
  }

  try {
    await publicMutation(api.inbound.submit, {
      secret: process.env.INBOUND_SECRET,
      kind: input.kind,
      name: input.name,
      businessName: input.business_name,
      email: input.email,
      phone: input.phone,
      city: input.city,
      currentUrl: input.current_url,
      message: input.message,
    });
  } catch (e) {
    console.error("inbound.submit failed", e);
    return NextResponse.json({ error: "Something went wrong on our end. Please email us instead." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
