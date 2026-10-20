"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { requireOwner } from "./auth";
import { callOutcomes, type CallOutcome } from "./call-outcomes";
import { allStages } from "./stages";
import type { Stage } from "./types";

// One-tap CRM actions. Each checks the owner session, writes, logs to activity_log, and refreshes.
// In demo mode they validate input and return { demo: true } without saving or sending anything.

export type ActionResult = { ok: true; demo?: boolean; message?: string } | { ok: false; error: string };

async function guard() {
  const who = await requireOwner();
  return who.demo ? null : await supabaseServer();
}

async function log(sb: Awaited<ReturnType<typeof supabaseServer>>, businessId: string | null, action: string, detail: object = {}) {
  await sb.from("activity_log").insert({ business_id: businessId, actor: "acen", action, detail, needed_acen: true });
}

const done = (message: string): ActionResult => {
  revalidatePath("/admin", "layout");
  return { ok: true, message };
};
const demoDone = (message: string): ActionResult => ({ ok: true, demo: true, message: `Demo mode: ${message}` });

/** Approve an AI draft (optionally edited). The outreach engine sends it, respecting the kill switch and caps. */
export async function approveMessage(messageId: string, editedBody?: string): Promise<ActionResult> {
  const body = editedBody?.trim();
  if (editedBody !== undefined && !body) return { ok: false, error: "The message can't be empty." };
  const sb = await guard();
  if (!sb) return demoDone(body ? "edit saved to the learning loop (not really)." : "approved (nothing was sent).");

  const { data: msg, error } = await sb.from("messages").select("*").eq("id", messageId).single();
  if (error || !msg) return { ok: false, error: "Couldn't find that message." };
  if (msg.status !== "pending_approval") return { ok: false, error: "This message was already handled." };

  const edited = body !== undefined && body !== msg.body;
  const { error: upErr } = await sb
    .from("messages")
    .update({ status: "scheduled", body: body ?? msg.body, written_by: edited ? "ai_edited_by_acen" : "ai", scheduled_for: new Date().toISOString() })
    .eq("id", messageId);
  if (upErr) return { ok: false, error: upErr.message };

  if (edited) {
    // Learning loop (spec Section 11): keep what Acen wrote next to the AI's draft.
    const { data: inbound } = await sb
      .from("messages").select("body").eq("thread_id", msg.thread_id).eq("direction", "inbound")
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    await sb.from("reply_library").insert({
      situation_type: msg.ai_classification ?? "unknown",
      inbound_text: inbound?.body ?? null,
      response_text: body,
      ai_draft_text: msg.body,
      source: "acen_edited",
      source_message_id: messageId,
    });
  }
  await sb.from("tasks").update({ status: "done", completed_at: new Date().toISOString() }).eq("ref_id", messageId).eq("status", "open");
  await log(sb, msg.business_id, edited ? "reply_edited_and_approved" : "reply_approved", { message_id: messageId });
  return done(edited ? "Approved with your edits. The AI will learn from them." : "Approved. It'll go out shortly.");
}

export async function discardMessage(messageId: string): Promise<ActionResult> {
  const sb = await guard();
  if (!sb) return demoDone("draft discarded (not really).");
  const { data: msg } = await sb.from("messages").update({ status: "discarded" }).eq("id", messageId).select("business_id").single();
  await sb.from("tasks").update({ status: "dismissed", completed_at: new Date().toISOString() }).eq("ref_id", messageId).eq("status", "open");
  await log(sb, msg?.business_id ?? null, "reply_discarded", { message_id: messageId });
  return done("Draft discarded.");
}

const priceSchema = z.object({
  businessId: z.string().uuid(),
  setup: z.coerce.number().int().min(0).max(20000),
  monthly: z.coerce.number().int().min(0).max(2000),
  note: z.string().trim().max(500).optional(),
});

/** One-tap price override. Hard rules still apply; the note trains future pricing. */
export async function overridePrice(input: z.input<typeof priceSchema>): Promise<ActionResult> {
  const parsed = priceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Enter whole-dollar prices." };
  const { businessId, setup, monthly, note } = parsed.data;
  const sb = await guard();
  if (!sb) {
    return demoDone(`price would be $${setup} setup + $${monthly}/mo.`);
  }
  const { data: a } = await sb.from("business_assessment").select("*").eq("business_id", businessId).single();
  if (a?.size_signal === "family_solo" && (setup > 500 || monthly > 100)) {
    return { ok: false, error: "Family/solo businesses are capped at $500 setup and $100/month." };
  }
  const { error } = await sb.from("business_assessment")
    .update({ setup_price: setup, monthly_price: monthly, overridden_by_acen: true })
    .eq("business_id", businessId);
  if (error) return { ok: false, error: error.message };
  await sb.from("pricing_feedback").insert({
    business_id: businessId, ai_setup_price: a?.setup_price, ai_monthly_price: a?.monthly_price,
    acen_setup_price: setup, acen_monthly_price: monthly, acen_note: note || null,
  });
  await log(sb, businessId, "price_overridden", { from: [a?.setup_price, a?.monthly_price], to: [setup, monthly], note });
  return done("Price updated. The AI will learn from this.");
}

export async function moveStage(businessId: string, stage: Stage): Promise<ActionResult> {
  if (!allStages.includes(stage)) return { ok: false, error: "Unknown stage." };
  const sb = await guard();
  if (!sb) return demoDone("stage changed (not saved).");
  const { error } = await sb.from("pipeline").update({ stage }).eq("business_id", businessId);
  if (error) return { ok: false, error: error.message };
  await log(sb, businessId, "stage_moved_by_acen", { stage });
  return done("Moved.");
}


/** Logs a call outcome and moves the lead along automatically (spec Section 12). */
export async function logCallOutcome(businessId: string, outcome: CallOutcome, notes?: string): Promise<ActionResult> {
  if (!(outcome in callOutcomes)) return { ok: false, error: "Unknown outcome." };
  const sb = await guard();
  if (!sb) return demoDone(`${callOutcomes[outcome].next.toLowerCase()} (nothing was saved or sent).`);

  const day = 864e5;
  const plan: Record<CallOutcome, { stage?: Stage; next?: string; inMs?: number }> = {
    no_answer: { next: "call", inMs: day },
    voicemail: { next: "call", inMs: 2 * day },
    interested_send_link: { stage: "replied", next: "send_demo_link", inMs: 0 },
    wants_payment_link: { stage: "replied", next: "send_payment_link", inMs: 0 },
    call_back_later: { next: "call", inMs: 3 * day },
    not_interested: { stage: "suppressed" },
    wrong_number: { stage: "lost" },
  };
  const p = plan[outcome];
  await sb.from("calls").insert({ business_id: businessId, outcome, notes: notes || null, follow_up_at: p.inMs !== undefined ? new Date(Date.now() + p.inMs).toISOString() : null });

  if (outcome === "not_interested") {
    const { data: b } = await sb.from("businesses").select("email, phone").eq("id", businessId).single();
    await sb.from("suppression").upsert(
      { email: b?.email ?? null, phone: b?.email ? null : b?.phone ?? null, business_id: businessId, reason: "not_interested" },
      { ignoreDuplicates: true },
    );
  }
  const update: Record<string, unknown> = {
    owner: p.next === "call" ? "acen" : "auto",
    next_action: p.next ?? null,
    next_action_at: p.inMs !== undefined ? new Date(Date.now() + p.inMs).toISOString() : null,
  };
  if (p.stage) update.stage = p.stage;
  if (outcome === "wrong_number") update.lost_reason = "wrong_number";
  await sb.from("pipeline").update(update).eq("business_id", businessId);
  await sb.from("tasks").update({ status: "done", completed_at: new Date().toISOString() }).eq("business_id", businessId).eq("kind", "call").eq("status", "open");
  await log(sb, businessId, "call_logged", { outcome });
  return done(callOutcomes[outcome].next + ".");
}

export async function dismissTask(taskId: string): Promise<ActionResult> {
  const sb = await guard();
  if (!sb) return demoDone("task dismissed (not saved).");
  await sb.from("tasks").update({ status: "dismissed", completed_at: new Date().toISOString() }).eq("id", taskId);
  return done("Dismissed.");
}

/** Queues a hand-written message from Acen. Still goes through suppression, caps, and the kill switch. */
export async function sendManualMessage(businessId: string, body: string): Promise<ActionResult> {
  const text = body.trim();
  if (!text) return { ok: false, error: "Write something first." };
  const sb = await guard();
  if (!sb) return demoDone("message queued (nothing was sent).");
  const { data: last } = await sb.from("messages").select("thread_id, subject").eq("business_id", businessId)
    .eq("channel", "email").order("created_at", { ascending: false }).limit(1).maybeSingle();
  const { error } = await sb.from("messages").insert({
    business_id: businessId, thread_id: last?.thread_id ?? null, channel: "email", direction: "outbound",
    subject: last?.subject ? `Re: ${last.subject.replace(/^Re:\s*/i, "")}` : null, body: text,
    status: "scheduled", written_by: "acen", scheduled_for: new Date().toISOString(),
  });
  if (error) return { ok: false, error: error.message };
  await log(sb, businessId, "manual_message_queued");
  return done("Queued. It goes out from your business inbox if the kill switch is on.");
}

export async function setKillSwitch(on: boolean): Promise<ActionResult> {
  const sb = await guard();
  if (!sb) return demoDone(`outreach would be ${on ? "ON" : "OFF"}.`);
  const { error } = await sb.from("settings").update({ kill_switch_on: on }).eq("id", 1);
  if (error) return { ok: false, error: error.message };
  await log(sb, null, on ? "kill_switch_on" : "kill_switch_off");
  return done(on ? "Outreach is ON." : "Outreach is OFF. Nothing will be sent.");
}
