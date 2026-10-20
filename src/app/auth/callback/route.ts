import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Magic-link landing for both the owner CRM and the client portal.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/portal";
  if (code) {
    const sb = await supabaseServer();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext, url.origin));
  }
  const back = safeNext.startsWith("/admin") ? "/admin/login" : "/portal";
  return NextResponse.redirect(new URL(`${back}?error=link_expired`, url.origin));
}
