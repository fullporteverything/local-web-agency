import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Actor = Doc<"activityLog">["actor"];
type Stage = Doc<"businesses">["stage"];

export async function logActivity(
  ctx: MutationCtx,
  entry: { businessId?: Id<"businesses">; actor: Actor; action: string; detail?: Record<string, unknown>; neededAcen?: boolean },
) {
  await ctx.db.insert("activityLog", {
    businessId: entry.businessId,
    actor: entry.actor,
    action: entry.action,
    detail: entry.detail ?? {},
    neededAcen: entry.neededAcen ?? entry.actor === "acen",
  });
}

/** Changes a lead's stage, timestamps it, and logs it. All stage changes should go through here. */
export async function setStage(
  ctx: MutationCtx,
  businessId: Id<"businesses">,
  stage: Stage,
  actor: Actor,
  extra: Partial<Doc<"businesses">> = {},
) {
  const b = await ctx.db.get(businessId);
  if (!b) throw new Error("Business not found");
  const patch: Partial<Doc<"businesses">> = { ...extra };
  if (b.stage !== stage) {
    patch.stage = stage;
    patch.stageChangedAt = Date.now();
    await logActivity(ctx, { businessId, actor, action: "stage_changed", detail: { from: b.stage, to: stage } });
  }
  await ctx.db.patch(businessId, patch);
}

export async function isSuppressed(ctx: QueryCtx, email?: string | null, phone?: string | null) {
  if (email) {
    const hit = await ctx.db.query("suppression").withIndex("by_email", (q) => q.eq("email", email.toLowerCase())).first();
    if (hit) return true;
  }
  if (phone) {
    const hit = await ctx.db.query("suppression").withIndex("by_phone", (q) => q.eq("phone", phone)).first();
    if (hit) return true;
  }
  return false;
}

export async function suppress(
  ctx: MutationCtx,
  entry: { email?: string | null; phone?: string | null; businessId?: Id<"businesses">; reason: Doc<"suppression">["reason"] },
) {
  const email = entry.email?.toLowerCase() || undefined;
  const phone = email ? undefined : entry.phone || undefined;
  if (!email && !phone) return;
  if (await isSuppressed(ctx, email, phone)) return;
  await ctx.db.insert("suppression", { email, phone, businessId: entry.businessId, reason: entry.reason });
}

export const defaultSettings: Omit<Doc<"settings">, "_id" | "_creationTime"> = {
  key: "main",
  killSwitchOn: false,
  demoMode: true,
  businessHoursStart: "09:00",
  businessHoursEnd: "17:00",
  timezone: "America/New_York",
  sendDays: [1, 2, 3, 4, 5],
  replyDelayMinMinutes: 5,
  replyDelayMaxMinutes: 40,
  targetCities: ["High Point", "Greensboro", "Winston-Salem", "Charlotte", "Raleigh", "Durham"],
  tierRanges: {
    basic: { setupMin: 250, setupMax: 500, monthlyMin: 75, monthlyMax: 100 },
    premium: { setupMin: 750, setupMax: 1000, monthlyMin: 125, monthlyMax: 150 },
    all_out: { setupMin: 1500, setupMax: 3000, monthlyMin: 200, monthlyMax: 300 },
  },
  familySetupCeiling: 500,
  familyMonthlyCeiling: 100,
  marginTarget: 0.1,
  confidenceThreshold: 0.8,
  reviewFirstNEmails: 50,
  placesDailyBudgetUsd: 5,
  aiDailyBudgetUsd: 10,
  signature: "",
};

export async function getSettings(ctx: QueryCtx) {
  const row = await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", "main")).unique();
  return row ?? { ...defaultSettings, _id: null };
}
