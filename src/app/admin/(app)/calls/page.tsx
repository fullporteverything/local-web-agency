import type { Metadata } from "next";
import { Empty, PageTitle, Card } from "@/components/admin/ui";
import { getCalls, getLeads, getMessages } from "@/lib/crm/data";
import { callScript } from "@/lib/crm/script";
import { CallQueue } from "./call-queue";

export const metadata: Metadata = { title: "Call Queue" };

export default async function CallsPage({ searchParams }: { searchParams: Promise<{ lead?: string }> }) {
  const { lead: focus } = await searchParams;
  const [leads, calls, messages] = await Promise.all([getLeads(), getCalls(), getMessages()]);
  const queue = leads
    .filter((l) => l.stage === "needs_call" || l.stage === "call_booked")
    .sort((a, b) => Number(b.stage === "call_booked") - Number(a.stage === "call_booked") || b.lead_score - a.lead_score)
    .map((l) => ({
      lead: l,
      script: callScript(l),
      calls: calls.filter((c) => c.business_id === l.id),
      lastMessages: messages.filter((m) => m.business_id === l.id).slice(-3),
    }));
  const start = Math.max(0, queue.findIndex((q) => q.lead.id === focus));

  return (
    <>
      <PageTitle title="Call Queue" sub={queue.length ? `${queue.length} to call. One at a time, highest value first.` : undefined} />
      {queue.length === 0 ? (
        <Card><Empty title="No calls to make." body="Leads land here when they have no email, ask for a call, or go quiet after follow-ups." /></Card>
      ) : (
        <CallQueue items={queue} startIndex={start} />
      )}
    </>
  );
}
