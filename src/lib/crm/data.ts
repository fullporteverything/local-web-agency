import "server-only";
import { cache } from "react";
import { api } from "../../../convex/_generated/api";
import { isConvexConfigured, query } from "@/lib/convex/server";
import * as demo from "./demo-data";
import type { Activity, CallLog, Health, Lead, Message, Metrics, Task, Thread } from "./types";

// Every CRM read goes through here. With Convex configured it queries as the signed-in owner
// (Convex checks the owner on every call); otherwise it serves the in-memory demo data.

export const isDemo = () => !isConvexConfigured();

export const getLeads = cache(async (): Promise<Lead[]> => (isDemo() ? demo.demoLeads() : query(api.crm.leads, {})));

export async function getLead(id: string): Promise<Lead | null> {
  if (isDemo()) return demo.demoLeads().find((l) => l.id === id) ?? null;
  return query(api.crm.lead, { id });
}

export const getMessages = cache(async (businessId?: string): Promise<Message[]> => {
  if (isDemo()) {
    const all = demo.demoMessages();
    return businessId ? all.filter((m) => m.business_id === businessId) : all;
  }
  return query(api.crm.messages, businessId ? { businessId } : {});
});

export const getThreads = cache(async (): Promise<Thread[]> => {
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
});

export async function getTasks(): Promise<Task[]> {
  return isDemo() ? demo.demoTasks() : query(api.crm.tasks, {});
}

export async function getActivity(limit = 30): Promise<Activity[]> {
  return isDemo() ? demo.demoActivity().slice(0, limit) : query(api.crm.activity, { limit });
}

export async function getLeadActivity(businessId: string): Promise<Activity[]> {
  if (isDemo()) return demo.demoActivity().filter((a) => a.business_id === businessId);
  return query(api.crm.activity, { businessId });
}

export async function getCalls(): Promise<CallLog[]> {
  return isDemo() ? demo.demoCalls() : query(api.crm.calls, {});
}

export async function getMetrics(): Promise<Metrics> {
  return isDemo() ? demo.demoMetrics() : query(api.crm.metrics, {});
}

export async function getHealth(): Promise<Health> {
  return isDemo() ? demo.demoHealth() : query(api.crm.health, {});
}
