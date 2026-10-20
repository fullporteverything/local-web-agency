import { ConvexError, v } from "convex/values";
import type { Activity, CallLog, Health, Lead, Message, Metrics, Task } from "../src/lib/crm/types";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { requireOwner } from "./lib/access";
import { getSettings, logActivity, setStage, suppress } from "./lib/helpers";
import { assertPriceAllowed } from "./lib/pricing";
import { stage } from "./schema";

// Owner-only CRM reads and one-tap actions. Shapes returned here match src/lib/crm/types.ts.

const iso = (n?: number | null) => (n ? new Date(n).toISOString() : null);

function toLead(b: Doc<"businesses">, demo: Doc<"demoSites"> | null): Lead {
  const a = b.assessment;
  return {
    id: b._id,
    name: b.name,
    category: b.category ?? null,
    city: b.city ?? null,
    address: b.address ?? null,
    phone: b.phone ?? null,
    email: b.email ?? null,
    email_source: b.emailSource ?? null,
    website_url: b.websiteUrl ?? null,
    facebook_url: b.facebookUrl ?? null,
    web_presence: b.webPresence ?? null,
    website_issues: b.websiteIssues,
    google_rating: b.googleRating ?? null,
    review_count: b.reviewCount ?? null,
    services: b.services,
    is_family_business: b.isFamilyBusiness ?? null,
    source: b.source,
    created_at: iso(b._creationTime)!,
    contact_name: b.contactName ?? null,
    stage: b.stage,
    stage_changed_at: iso(b.stageChangedAt)!,
    lead_score: b.leadScore,
    owner: b.owner,
    next_action: b.nextAction ?? null,
    next_action_at: iso(b.nextActionAt),
    lost_reason: b.lostReason ?? null,
    assessment: a
      ? {
          quality_score: a.qualityScore,
          size_signal: a.sizeSignal,
          recommended_tier: a.recommendedTier,
          setup_price: a.setupPrice,
          monthly_price: a.monthlyPrice,
          reasoning: a.reasoning,
          rules_applied: a.rulesApplied,
          overridden_by_acen: a.overriddenByAcen,
        }
      : null,
    demo: demo
      ? {
          url: demo.url ?? null,
          screenshot_url: demo.screenshotUrl ?? null,
          qa_passed: demo.qaPassed ?? null,
          views: demo.views,
          unique_views: demo.uniqueViews,
          last_viewed_at: iso(demo.lastViewedAt),
        }
      : null,
  };
}

function toMessage(m: Doc<"messages">): Message {
  return {
    id: m._id,
    thread_id: m.threadId ?? null,
    business_id: m.businessId ?? null,
    channel: m.channel,
    direction: m.direction,
    subject: m.subject ?? null,
    body: m.body ?? null,
    status: m.status,
    ai_classification: m.aiClassification ?? null,
    ai_confidence: m.aiConfidence ?? null,
    ai_reasoning: m.aiReasoning ?? null,
    auto_sent: m.autoSent,
    written_by: m.writtenBy ?? null,
    sent_at: iso(m.sentAt),
    created_at: iso(m._creationTime)!,
  };
}

async function currentDemo(ctx: QueryCtx, businessId: Id<"businesses">) {
  return await ctx.db.query("demoSites").withIndex("by_business", (q) => q.eq("businessId", businessId).eq("isCurrent", true)).first();
}

async function businessNames(ctx: QueryCtx, ids: (Id<"businesses"> | undefined)[]) {
  const unique = [...new Set(ids.filter(Boolean))] as Id<"businesses">[];
  const docs = await Promise.all(unique.map((id) => ctx.db.get(id)));
  return new Map(unique.map((id, i) => [id as string, docs[i]?.name ?? null]));
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export const leads = query({
  args: {},
  handler: async (ctx): Promise<Lead[]> => {
    await requireOwner(ctx);
    const all = await ctx.db.query("businesses").order("desc").take(2000);
    const demos = await ctx.db.query("demoSites").filter((q) => q.eq(q.field("isCurrent"), true)).collect();
    const byBiz = new Map(demos.map((d) => [d.businessId as string, d]));
    return all.map((b) => toLead(b, byBiz.get(b._id) ?? null)).sort((a, b) => b.lead_score - a.lead_score);
  },
});

export const lead = query({
  args: { id: v.string() },
  handler: async (ctx, { id }): Promise<Lead | null> => {
    await requireOwner(ctx);
    const bizId = ctx.db.normalizeId("businesses", id);
    if (!bizId) return null;
    const b = await ctx.db.get(bizId);
    return b ? toLead(b, await currentDemo(ctx, b._id)) : null;
  },
});

export const messages = query({
  args: { businessId: v.optional(v.string()) },
  handler: async (ctx, { businessId }): Promise<Message[]> => {
    await requireOwner(ctx);
    const bizId = businessId ? ctx.db.normalizeId("businesses", businessId) : null;
    if (businessId && !bizId) return [];
    const rows = bizId
      ? await ctx.db.query("messages").withIndex("by_business", (q) => q.eq("businessId", bizId)).collect()
      : await ctx.db.query("messages").order("desc").take(2000);
    return rows.sort((a, b) => a._creationTime - b._creationTime).map(toMessage);
  },
});

export const tasks = query({
  args: {},
  handler: async (ctx): Promise<Task[]> => {
    await requireOwner(ctx);
    const rows = await ctx.db.query("tasks").withIndex("by_status", (q) => q.eq("status", "open")).order("desc").take(50);
    const names = await businessNames(ctx, rows.map((t) => t.businessId));
    return rows.map((t) => ({
      id: t._id,
      business_id: t.businessId ?? null,
      business_name: t.businessId ? names.get(t.businessId) ?? null : null,
      kind: t.kind,
      title: t.title,
      detail: t.detail ?? null,
      priority: t.priority,
      ref_id: t.refId ?? null,
      created_at: iso(t._creationTime)!,
    }));
  },
});

export const activity = query({
  args: { limit: v.optional(v.number()), businessId: v.optional(v.string()) },
  handler: async (ctx, { limit, businessId }): Promise<Activity[]> => {
    await requireOwner(ctx);
    const bizId = businessId ? ctx.db.normalizeId("businesses", businessId) : null;
    if (businessId && !bizId) return [];
    const rows = bizId
      ? await ctx.db.query("activityLog").withIndex("by_business", (q) => q.eq("businessId", bizId)).order("desc").take(limit ?? 200)
      : await ctx.db.query("activityLog").order("desc").take(limit ?? 30);
    const names = await businessNames(ctx, rows.map((a) => a.businessId));
    return rows.map((a) => ({
      id: a._id,
      business_id: a.businessId ?? null,
      business_name: a.businessId ? names.get(a.businessId) ?? null : null,
      actor: a.actor,
      action: a.action,
      detail: a.detail ?? {},
      created_at: iso(a._creationTime)!,
    }));
  },
});

export const calls = query({
  args: {},
  handler: async (ctx): Promise<CallLog[]> => {
    await requireOwner(ctx);
    const rows = await ctx.db.query("calls").order("desc").take(500);
    return rows.map((c) => ({
      id: c._id,
      business_id: c.businessId,
      scheduled_at: iso(c.scheduledAt),
      outcome: c.outcome ?? null,
      notes: c.notes ?? null,
      created_at: iso(c._creationTime)!,
    }));
  },
});

export const metrics = query({
  args: {},
  handler: async (ctx): Promise<Metrics> => {
    await requireOwner(ctx);
    const startOfDay = new Date();
    startOfDay.setUTCHours(4, 0, 0, 0); // midnight Eastern (EDT); close enough for daily counters
    if (startOfDay.getTime() > Date.now()) startOfDay.setUTCDate(startOfDay.getUTCDate() - 1);
    const since = startOfDay.getTime();
    const month = new Date().toISOString().slice(0, 7);

    const clients = await ctx.db.query("clients").collect();
    const active = clients.filter((c) => c.retainerStatus === "active");
    const costs = await ctx.db.query("clientCosts").withIndex("by_month", (q) => q.eq("month", month)).collect();
    const todayBiz = await ctx.db.query("businesses").filter((q) => q.gte(q.field("_creationTime"), since)).collect();
    const todayMsgs = await ctx.db.query("messages").filter((q) => q.gte(q.field("_creationTime"), since)).collect();
    const todayActs = await ctx.db.query("activityLog").filter((q) => q.gte(q.field("_creationTime"), since)).collect();
    const demos = await ctx.db.query("demoSites").filter((q) => q.gte(q.field("lastViewedAt"), since)).collect();

    return {
      mrr: active.reduce((s, c) => s + c.monthlyPrice, 0),
      setupRevenue: clients.reduce((s, c) => s + c.setupPrice, 0),
      monthCosts: costs.reduce((s, c) => s + c.hosting + c.domain + c.email + c.aiUsage + c.stripeFees + c.other, 0),
      activeClients: active.length,
      leadsToday: todayBiz.length,
      emailsToday: todayMsgs.filter((m) => m.channel === "email" && m.direction === "outbound" && m.status === "sent").length,
      repliesToday: todayMsgs.filter((m) => m.direction === "inbound").length,
      demosViewedToday: demos.length,
      autoActionsToday: todayActs.filter((a) => a.actor === "ai" || a.actor === "system").length,
      acenActionsToday: todayActs.filter((a) => a.actor === "acen").length,
    };
  },
});

export const health = query({
  args: {},
  handler: async (ctx): Promise<Health> => {
    await requireOwner(ctx);
    const settings = await getSettings(ctx);
    const inboxes = await ctx.db.query("sendingInboxes").collect();
    const dayAgo = Date.now() - 864e5;
    const failed = await ctx.db.query("jobRuns").withIndex("by_status", (q) => q.eq("status", "failed")).filter((q) => q.gte(q.field("_creationTime"), dayAgo)).collect();
    return {
      killSwitchOn: settings.killSwitchOn,
      demoMode: settings.demoMode,
      inboxes: inboxes.map((i) => ({
        address: i.address, daily_cap: i.dailyCap, sent_today: i.sentToday, warmup_day: i.warmupDay, health: i.health, bounce_rate: i.bounceRate,
      })),
      failedJobs: failed.length,
    };
  },
});

/** Cheap "has anything changed?" signal the CRM watches to refresh itself live. */
export const version = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx);
    const [act, msg, task] = await Promise.all([
      ctx.db.query("activityLog").order("desc").first(),
      ctx.db.query("messages").order("desc").first(),
      ctx.db.query("tasks").order("desc").first(),
    ]);
    return [act?._id, msg?._id, task?._id, task?.status].join(":");
  },
});

// ---------------------------------------------------------------------------
// One-tap actions
// ---------------------------------------------------------------------------

async function closeTasks(ctx: Parameters<typeof logActivity>[0], refId: string, status: "done" | "dismissed") {
  const open = await ctx.db.query("tasks").withIndex("by_ref", (q) => q.eq("refId", refId)).collect();
  for (const t of open.filter((t) => t.status === "open")) await ctx.db.patch(t._id, { status, completedAt: Date.now() });
}

/** Approve an AI draft (optionally edited). The outreach engine sends it, respecting the kill switch and caps. */
export const approveMessage = mutation({
  args: { messageId: v.id("messages"), editedBody: v.optional(v.string()) },
  handler: async (ctx, { messageId, editedBody }) => {
    await requireOwner(ctx);
    const msg = await ctx.db.get(messageId);
    if (!msg) throw new ConvexError("Couldn't find that message.");
    if (msg.status !== "pending_approval") throw new ConvexError("This message was already handled.");
    const body = editedBody?.trim();
    if (editedBody !== undefined && !body) throw new ConvexError("The message can't be empty.");
    const edited = body !== undefined && body !== msg.body?.trim();

    await ctx.db.patch(messageId, {
      status: "scheduled",
      body: edited ? body : msg.body,
      writtenBy: edited ? "ai_edited_by_acen" : "ai",
      scheduledFor: Date.now(),
    });
    if (edited) {
      // Learning loop (spec Section 11): keep what Acen wrote next to the AI's draft.
      const thread = msg.threadId ? await ctx.db.query("messages").withIndex("by_thread", (q) => q.eq("threadId", msg.threadId)).collect() : [];
      const inbound = thread.filter((m) => m.direction === "inbound").sort((a, b) => b._creationTime - a._creationTime)[0];
      await ctx.db.insert("replyLibrary", {
        situationType: msg.aiClassification ?? "unknown",
        inboundText: inbound?.body,
        responseText: body!,
        aiDraftText: msg.body,
        source: "acen_edited",
        sourceMessageId: messageId,
      });
    }
    await closeTasks(ctx, messageId, "done");
    await logActivity(ctx, { businessId: msg.businessId, actor: "acen", action: edited ? "reply_edited_and_approved" : "reply_approved" });
    return edited ? "Approved with your edits. The AI will learn from them." : "Approved. It'll go out shortly.";
  },
});

export const discardMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, { messageId }) => {
    await requireOwner(ctx);
    const msg = await ctx.db.get(messageId);
    if (!msg) throw new ConvexError("Couldn't find that message.");
    await ctx.db.patch(messageId, { status: "discarded" });
    await closeTasks(ctx, messageId, "dismissed");
    await logActivity(ctx, { businessId: msg.businessId, actor: "acen", action: "reply_discarded" });
    return "Draft discarded.";
  },
});

/** One-tap price override. Hard rules still apply; the note trains future pricing. */
export const overridePrice = mutation({
  args: { businessId: v.id("businesses"), setup: v.number(), monthly: v.number(), note: v.optional(v.string()) },
  handler: async (ctx, { businessId, setup, monthly, note }) => {
    await requireOwner(ctx);
    const b = await ctx.db.get(businessId);
    if (!b) throw new ConvexError("Lead not found.");
    if (!b.assessment) throw new ConvexError("This lead hasn't been priced yet.");
    assertPriceAllowed({ sizeSignal: b.assessment.sizeSignal, setupPrice: setup, monthlyPrice: monthly });
    await ctx.db.patch(businessId, { assessment: { ...b.assessment, setupPrice: setup, monthlyPrice: monthly, overriddenByAcen: true } });
    await ctx.db.insert("pricingFeedback", {
      businessId, aiSetupPrice: b.assessment.setupPrice, aiMonthlyPrice: b.assessment.monthlyPrice,
      acenSetupPrice: setup, acenMonthlyPrice: monthly, acenNote: note?.trim() || undefined,
    });
    await logActivity(ctx, { businessId, actor: "acen", action: "price_overridden", detail: { from: [b.assessment.setupPrice, b.assessment.monthlyPrice], to: [setup, monthly] } });
    return "Price updated. The AI will learn from this.";
  },
});

export const moveStage = mutation({
  args: { businessId: v.id("businesses"), stage },
  handler: async (ctx, { businessId, stage: next }) => {
    await requireOwner(ctx);
    await setStage(ctx, businessId, next, "acen");
    return "Moved.";
  },
});

const DAY = 864e5;
const callPlan: Record<string, { label: string; stage?: Doc<"businesses">["stage"]; next?: string; inMs?: number; reply: string }> = {
  no_answer: { label: "No answer", next: "call", inMs: DAY, reply: "Try again tomorrow." },
  voicemail: { label: "Left voicemail", next: "call", inMs: 2 * DAY, reply: "Try again in 2 days." },
  interested_send_link: { label: "Interested", stage: "replied", next: "send_demo_link", inMs: 0, reply: "Demo link going out now. Follow-up in 2 days." },
  wants_payment_link: { label: "Wants to start", stage: "replied", next: "send_payment_link", inMs: 0, reply: "Payment link going out now." },
  call_back_later: { label: "Call back later", next: "call", inMs: 3 * DAY, reply: "Reminder set." },
  not_interested: { label: "Not interested", stage: "suppressed", reply: "Removed from the list." },
  wrong_number: { label: "Wrong number", stage: "lost", reply: "Marked lost." },
};

/** Logs a call outcome and moves the lead along automatically (spec Section 12). */
export const logCallOutcome = mutation({
  args: { businessId: v.id("businesses"), outcome: v.string(), notes: v.optional(v.string()) },
  handler: async (ctx, { businessId, outcome, notes }) => {
    await requireOwner(ctx);
    const plan = callPlan[outcome];
    if (!plan) throw new ConvexError("Unknown outcome.");
    const b = await ctx.db.get(businessId);
    if (!b) throw new ConvexError("Lead not found.");
    const followUpAt = plan.inMs !== undefined ? Date.now() + plan.inMs : undefined;
    await ctx.db.insert("calls", { businessId, outcome, notes: notes?.trim() || undefined, followUpAt });
    if (outcome === "not_interested") await suppress(ctx, { email: b.email, phone: b.phone, businessId, reason: "not_interested" });
    await setStage(ctx, businessId, plan.stage ?? b.stage, "acen", {
      owner: plan.next === "call" ? "acen" : "auto",
      nextAction: plan.next,
      nextActionAt: followUpAt,
      ...(outcome === "wrong_number" ? { lostReason: "wrong_number" } : {}),
    });
    const open = await ctx.db.query("tasks").withIndex("by_business", (q) => q.eq("businessId", businessId).eq("status", "open")).collect();
    for (const t of open.filter((t) => t.kind === "call")) await ctx.db.patch(t._id, { status: "done", completedAt: Date.now() });
    await logActivity(ctx, { businessId, actor: "acen", action: "call_logged", detail: { outcome } });
    return plan.reply;
  },
});

export const dismissTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => {
    await requireOwner(ctx);
    await ctx.db.patch(taskId, { status: "dismissed", completedAt: Date.now() });
    return "Dismissed.";
  },
});

/** Queues a hand-written message from Acen. Still goes through suppression, caps, and the kill switch when sent. */
export const sendManualMessage = mutation({
  args: { businessId: v.id("businesses"), body: v.string() },
  handler: async (ctx, { businessId, body }) => {
    await requireOwner(ctx);
    const text = body.trim();
    if (!text) throw new ConvexError("Write something first.");
    const b = await ctx.db.get(businessId);
    if (!b?.email) throw new ConvexError("No email on file for this lead.");
    const last = (await ctx.db.query("messages").withIndex("by_business", (q) => q.eq("businessId", businessId)).collect())
      .filter((m) => m.channel === "email")
      .sort((x, y) => y._creationTime - x._creationTime)[0];
    await ctx.db.insert("messages", {
      businessId, threadId: last?.threadId, channel: "email", direction: "outbound",
      subject: last?.subject ? `Re: ${last.subject.replace(/^Re:\s*/i, "")}` : undefined,
      body: text, status: "scheduled", writtenBy: "acen", autoSent: false, scheduledFor: Date.now(),
    });
    await logActivity(ctx, { businessId, actor: "acen", action: "manual_message_queued" });
    return "Queued. It goes out from your business inbox when outreach is on.";
  },
});

export const setKillSwitch = mutation({
  args: { on: v.boolean() },
  handler: async (ctx, { on }) => {
    await requireOwner(ctx);
    const s = await getSettings(ctx);
    if (s._id) await ctx.db.patch(s._id, { killSwitchOn: on });
    else {
      const { _id, ...rest } = s;
      void _id;
      await ctx.db.insert("settings", { ...rest, killSwitchOn: on });
    }
    await logActivity(ctx, { actor: "acen", action: on ? "kill_switch_on" : "kill_switch_off" });
    return on ? "Outreach is ON." : "Outreach is OFF. Nothing will be sent.";
  },
});
