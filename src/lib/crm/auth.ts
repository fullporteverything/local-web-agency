import "server-only";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

// The CRM is owner-only. In demo mode (no Supabase yet) it shows fake data to anyone,
// which is safe because nothing real exists and every action is a no-op.
export async function requireOwner() {
  if (!isSupabaseConfigured()) return { demo: true as const, userId: null };
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) redirect("/admin/login");
  const { data: profile } = await sb.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (profile?.role !== "owner") redirect("/admin/login?error=not_owner");
  return { demo: false as const, userId: data.user.id };
}
