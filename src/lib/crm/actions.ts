"use server";

import { revalidatePath } from "next/cache";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { errorMessage, isConvexConfigured, mutate } from "@/lib/convex/server";
import { callOutcomes, type CallOutcome } from "./call-outcomes";
import { allStages } from "./stages";
import type { Stage } from "./types";

// One-tap CRM actions. Convex checks the owner and enforces every rule; this layer just
// calls it, refreshes the screen, and turns errors into plain sentences.
// In demo mode they return { demo: true } without saving or sending anything.

export type ActionResult = { ok: true; demo?: boolean; message?: string } | { ok: false; error: string };

const demoDone = (message: string): ActionResult => ({ ok: true, demo: true, message: `Demo mode: ${message}` });

async function run(fn: () => Promise<string | void>): Promise<ActionResult> {
  try {
    const message = (await fn()) || "Done.";
    revalidatePath("/admin", "layout");
    return { ok: true, message };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

/** Approve an AI draft (optionally edited). The outreach engine sends it, respecting the kill switch and caps. */
export async function approveMessage(messageId: string, editedBody?: string): Promise<ActionResult> {
  if (editedBody !== undefined && !editedBody.trim()) return { ok: false, error: "The message can't be empty." };
  if (!isConvexConfigured()) return demoDone(editedBody ? "edit saved to the learning loop (not really)." : "approved (nothing was sent).");
  return run(() => mutate(api.crm.approveMessage, { messageId: messageId as Id<"messages">, editedBody }));
}

export async function discardMessage(messageId: string): Promise<ActionResult> {
  if (!isConvexConfigured()) return demoDone("draft discarded (not really).");
  return run(() => mutate(api.crm.discardMessage, { messageId: messageId as Id<"messages"> }));
}

/** One-tap price override. Hard rules still apply in Convex; the note trains future pricing. */
export async function overridePrice(input: { businessId: string; setup: number; monthly: number; note?: string }): Promise<ActionResult> {
  const { businessId, setup, monthly, note } = input;
  if (!Number.isInteger(setup) || !Number.isInteger(monthly) || setup < 0 || monthly < 0) return { ok: false, error: "Enter whole-dollar prices." };
  if (!isConvexConfigured()) return demoDone(`price would be $${setup} setup + $${monthly}/mo.`);
  return run(() => mutate(api.crm.overridePrice, { businessId: businessId as Id<"businesses">, setup, monthly, note }));
}

export async function moveStage(businessId: string, stage: Stage): Promise<ActionResult> {
  if (!allStages.includes(stage)) return { ok: false, error: "Unknown stage." };
  if (!isConvexConfigured()) return demoDone("stage changed (not saved).");
  return run(() => mutate(api.crm.moveStage, { businessId: businessId as Id<"businesses">, stage }));
}

/** Logs a call outcome and moves the lead along automatically (spec Section 12). */
export async function logCallOutcome(businessId: string, outcome: CallOutcome, notes?: string): Promise<ActionResult> {
  if (!(outcome in callOutcomes)) return { ok: false, error: "Unknown outcome." };
  if (!isConvexConfigured()) return demoDone(`${callOutcomes[outcome].next.toLowerCase()} (nothing was saved or sent).`);
  return run(() => mutate(api.crm.logCallOutcome, { businessId: businessId as Id<"businesses">, outcome, notes }));
}

export async function dismissTask(taskId: string): Promise<ActionResult> {
  if (!isConvexConfigured()) return demoDone("task dismissed (not saved).");
  return run(() => mutate(api.crm.dismissTask, { taskId: taskId as Id<"tasks"> }));
}

/** Queues a hand-written message from Acen. Still goes through suppression, caps, and the kill switch. */
export async function sendManualMessage(businessId: string, body: string): Promise<ActionResult> {
  if (!body.trim()) return { ok: false, error: "Write something first." };
  if (!isConvexConfigured()) return demoDone("message queued (nothing was sent).");
  return run(() => mutate(api.crm.sendManualMessage, { businessId: businessId as Id<"businesses">, body }));
}

export async function setKillSwitch(on: boolean): Promise<ActionResult> {
  if (!isConvexConfigured()) return demoDone(`outreach would be ${on ? "ON" : "OFF"}.`);
  return run(() => mutate(api.crm.setKillSwitch, { on }));
}
