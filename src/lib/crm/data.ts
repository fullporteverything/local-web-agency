import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import * as demo from "./demo-data";
import type { Activity, CallLog, Health, Lead, Message, Metrics, Task, Thread } from "./types";

// Every CRM read goes through here. With Supabase configured it queries as the signed-in owner
// (row-level security applies); otherwise it serves the in-memory demo data.

export const isDemo = () => !isSupabaseConfigured();

const leadSelect = `
  id, name, category, city, address, phone, email, email_source, website_url, facebook_url, web_presence,
  website_issues, google_rating, review_count, services, is_family_business, source, created_at,
  pipeline(stage, stage_changed_at, lead_score, owner, next_action, next_action_at, lost_reason),
  business_assessment(quality_score, size_signal, recommended_tier, setup_price, monthly_price, reasoning, rules_applied, overridden_by_acen),
  demo_sites(url, screenshot_url, qa_passed, views, unique_views, last_viewed_at, is_current),
  contacts(name, is_primary)
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toLead(row: any): Lead {
  const p = row.pipeline ?? {};
  const demoSite = (row.demo_sites ?? []).find((d: { is_current: boolean }) => d.is_current) ?? null;
  const contact = (row.contacts ?? []).find((c: { is_primary: boolean }) => c.is_primary) ?? null;
  return {
    ...row,
    website_issues: row.website_issues ?? [],
    services: row.services ?? [],
    contact_name: contact?.name ?? null,
    stage: p.stage ?? "new",
    stage_changed_at: p.stage_changed_at ?? row.created_at,
    lead_score: p.lead_score ?? 50,
    owner: p.owner ?? "auto",
    next_action: p.next_action ?? null,
    next_action_at: p.next_action_at ?? null,
    lost_reason: p.lost_reason ?? null,
    assessment: row.business_assessment ?? null,
    demo: demoSite,
  };
}

export const getLeads = cache(async (): Promise<Lead[]> => {
  if (isDemo()) return demo.demoLeads();
  const sb = await supabaseServer();
  const { data, error } = await sb.from("businesses").select(leadSelect).order("created_at", { ascending: false }).limit(1000);
  if (error) throw new Error(error.message);
  return (data ?? []).map(toLead).sort((a, b) => b.lead_score - a.lead_score);
});

export async function getLead(id: string): Promise<Lead | null> {
  if (isDemo()) return demo.demoLeads().find((l) => l.id === id) ?? null;
  const sb = await supabaseServer();
  const { data, error } = await sb.from("businesses").select(leadSelect).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toLead(data) : null;
}

export async function getMessages(businessId?: string): Promise<Message[]> {
  if (isDemo()) {
    const all = demo.demoMessages();
    return businessId ? all.filter((m) => m.business_id === businessId) : all;
  }
  const sb = await supabaseServer();
  let q = sb.from("messages").select("*").order("created_at", { ascending: true }).limit(2000);
  if (businessId) q = q.eq("business_id", businessId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getThreads(): Promise<Thread[]> {
  const [messages, leads] = await Promise.all([getMessages(), getLeads()]);
  const names = new Map(leads.map((l) => [l.id, l.name]));
  const byThread = new Map<string, Message[]>();
  for (const m of messages) {
    const key = m.thread_id ?? m.id;
    byThread.set(key, [...(byThread.get(key) ?? []), m]);
  }
  return [...byThread.entries()]
    .map(([id, msgs]) => {
      const last = msgs[msgs.length - 1];
      const lastReal = [...msgs].reverse().find((m) => m.status !== "pending_approval") ?? last;
      return {
        id,
        business_id: last.business_id,
        business_name: (last.business_id && names.get(last.business_id)) || "Unknown",
        subject: (msgs[0].subject ?? "(no subject)").replace(/^Re:\s*/i, ""),
        channel: msgs[0].channel,
        last_at: last.created_at,
        last_snippet: (lastReal.body ?? "").slice(0, 140),
        needs_approval: msgs.some((m) => m.status === "pending_approval"),
        unread_inbound: last.direction === "inbound" || msgs.some((m) => m.status === "pending_approval"),
        messages: msgs,
      };
    })
    .sort((a, b) => Number(b.needs_approval) - Number(a.needs_approval) || b.last_at.localeCompare(a.last_at));
}

export async function getTasks(): Promise<Task[]> {
  if (isDemo()) return demo.demoTasks();
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("tasks")
    .select("id, business_id, kind, title, detail, priority, ref_id, created_at, businesses(name)")
    .eq("status", "open")
    .order("priority", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((t: any) => ({ ...t, business_name: t.businesses?.name ?? null }));
}

export async function getActivity(limit = 30): Promise<Activity[]> {
  if (isDemo()) return demo.demoActivity().slice(0, limit);
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("activity_log")
    .select("id, business_id, actor, action, detail, created_at, businesses(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((a: any) => ({ ...a, business_name: a.businesses?.name ?? null }));
}

export async function getLeadActivity(businessId: string): Promise<Activity[]> {
  if (isDemo()) return demo.demoActivity().filter((a) => a.business_id === businessId);
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("activity_log")
    .select("id, business_id, actor, action, detail, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []).map((a) => ({ ...a, business_name: null }));
}

export async function getCalls(): Promise<CallLog[]> {
  if (isDemo()) return demo.demoCalls();
  const sb = await supabaseServer();
  const { data, error } = await sb.from("calls").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getMetrics(): Promise<Metrics> {
  if (isDemo()) return demo.demoMetrics();
  const sb = await supabaseServer();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const since = today.toISOString();
  const month = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const count = async (table: string, build: (q: ReturnType<typeof sb.from>) => unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: n } = await (build(sb.from(table)) as any);
    return n ?? 0;
  };
  const [clients, costs, leadsToday, emailsToday, repliesToday, autoToday, acenToday] = await Promise.all([
    sb.from("clients").select("setup_price, monthly_price, retainer_status"),
    sb.from("client_costs").select("total").eq("month", month),
    count("businesses", (q) => q.select("id", { count: "exact", head: true }).gte("created_at", since)),
    count("messages", (q) => q.select("id", { count: "exact", head: true }).eq("channel", "email").eq("direction", "outbound").eq("status", "sent").gte("sent_at", since)),
    count("messages", (q) => q.select("id", { count: "exact", head: true }).eq("direction", "inbound").gte("created_at", since)),
    count("activity_log", (q) => q.select("id", { count: "exact", head: true }).in("actor", ["system", "ai"]).gte("created_at", since)),
    count("activity_log", (q) => q.select("id", { count: "exact", head: true }).eq("actor", "acen").gte("created_at", since)),
  ]);
  const c = clients.data ?? [];
  const active = c.filter((x) => x.retainer_status === "active");
  return {
    mrr: active.reduce((s, x) => s + x.monthly_price, 0),
    setupRevenue: c.reduce((s, x) => s + x.setup_price, 0),
    monthCosts: (costs.data ?? []).reduce((s, x) => s + Number(x.total), 0),
    activeClients: active.length,
    leadsToday,
    emailsToday,
    repliesToday,
    demosViewedToday: 0,
    autoActionsToday: autoToday,
    acenActionsToday: acenToday,
  };
}

export async function getHealth(): Promise<Health> {
  if (isDemo()) return demo.demoHealth();
  const sb = await supabaseServer();
  const [settings, inboxes, failed] = await Promise.all([
    sb.from("settings").select("kill_switch_on, demo_mode").eq("id", 1).maybeSingle(),
    sb.from("sending_inboxes").select("address, daily_cap, sent_today, warmup_day, health, bounce_rate"),
    sb.from("job_runs").select("id", { count: "exact", head: true }).eq("status", "failed").gte("started_at", new Date(Date.now() - 864e5).toISOString()),
  ]);
  return {
    killSwitchOn: settings.data?.kill_switch_on ?? false,
    demoMode: settings.data?.demo_mode ?? true,
    inboxes: (inboxes.data ?? []).map((i) => ({ ...i, bounce_rate: Number(i.bounce_rate) })),
    failedJobs: failed.count ?? 0,
  };
}
