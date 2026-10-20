import { demoActivity, demoCalls, demoId, demoLeads, demoMessages, demoTasks } from "../src/lib/crm/demo-data";
import type { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import { defaultSettings } from "./lib/helpers";

// Fake demo data so the CRM can be tried without anything real. Every business is fictional,
// uses example.com emails and 555-01xx phone numbers, and is flagged isDemo.
//   npx convex run seed:run     load it
//   npx convex run seed:clear   remove it

const ms = (iso: string | null) => (iso ? new Date(iso).getTime() : undefined);

export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    if (await ctx.db.query("businesses").withIndex("by_demo", (q) => q.eq("isDemo", true)).first()) return "Already seeded.";

    if (!(await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", "main")).unique())) {
      await ctx.db.insert("settings", defaultSettings);
    }

    const ids = new Map<string, Id<"businesses">>();
    for (const l of demoLeads()) {
      const a = l.assessment!;
      const id = await ctx.db.insert("businesses", {
        name: l.name, category: l.category ?? undefined, city: l.city ?? undefined, phone: l.phone ?? undefined,
        email: l.email ?? undefined, emailSource: l.email_source ?? undefined, emailConfidence: l.email ? 0.9 : undefined,
        websiteUrl: l.website_url ?? undefined, facebookUrl: l.facebook_url ?? undefined, webPresence: l.web_presence ?? undefined,
        websiteIssues: l.website_issues, googleRating: l.google_rating ?? undefined, reviewCount: l.review_count ?? undefined,
        services: l.services, photos: [], reviews: [], isFamilyBusiness: l.is_family_business ?? undefined, isChain: false,
        source: "seed", isDemo: true, contactName: l.contact_name ?? undefined,
        stage: l.stage, stageChangedAt: ms(l.stage_changed_at)!, owner: l.owner, leadScore: l.lead_score,
        nextAction: l.next_action ?? undefined, nextActionAt: ms(l.next_action_at),
        resurfaceAt: l.stage === "later" ? ms(l.next_action_at) : undefined,
        assessment: {
          qualityScore: a.quality_score ?? 50, sizeSignal: a.size_signal ?? "small", recommendedTier: a.recommended_tier ?? "basic",
          setupPrice: a.setup_price ?? 0, monthlyPrice: a.monthly_price ?? 0, reasoning: a.reasoning ?? "",
          rulesApplied: a.rules_applied, overriddenByAcen: false, assessedAt: Date.now(),
        },
      });
      ids.set(l.id, id);
      if (l.contact_name) await ctx.db.insert("contacts", { businessId: id, name: l.contact_name, email: l.email ?? undefined, phone: l.phone ?? undefined, isPrimary: true });
      if (l.demo) {
        await ctx.db.insert("demoSites", {
          businessId: id, tierShown: a.recommended_tier ?? "basic", url: l.demo.url ?? undefined, builtAt: Date.now(),
          qaPassed: l.demo.qa_passed ?? undefined, attempt: 1, views: l.demo.views, uniqueViews: l.demo.unique_views,
          lastViewedAt: ms(l.demo.last_viewed_at), isCurrent: true,
        });
      }
    }
    const biz = (demoKey: string | null) => (demoKey ? ids.get(demoKey) : undefined);

    const msgIds = new Map<string, Id<"messages">>();
    for (const m of demoMessages()) {
      const id = await ctx.db.insert("messages", {
        threadId: m.thread_id ?? undefined, businessId: biz(m.business_id), channel: m.channel, direction: m.direction,
        subject: m.subject ?? undefined, body: m.body ?? undefined, status: m.status as never,
        aiClassification: m.ai_classification ?? undefined, aiConfidence: m.ai_confidence ?? undefined,
        aiReasoning: m.ai_reasoning ?? undefined, autoSent: m.auto_sent, writtenBy: (m.written_by ?? undefined) as never,
        sentAt: ms(m.sent_at),
      });
      msgIds.set(m.id, id);
    }
    for (const t of demoTasks()) {
      await ctx.db.insert("tasks", {
        businessId: biz(t.business_id), kind: t.kind, title: t.title, detail: t.detail ?? undefined, priority: t.priority,
        refId: t.ref_id ? msgIds.get(t.ref_id) : undefined, status: "open",
      });
    }
    for (const a of [...demoActivity()].reverse()) {
      await ctx.db.insert("activityLog", { businessId: biz(a.business_id), actor: a.actor, action: a.action, detail: a.detail, neededAcen: false });
    }
    for (const c of demoCalls()) {
      await ctx.db.insert("calls", { businessId: biz(c.business_id)!, scheduledAt: ms(c.scheduled_at) });
    }

    // Two demo clients: one live, one being built.
    const florist = await ctx.db.insert("clients", {
      businessId: ids.get(demoId(10))!, email: "demo-florist@example.com", tier: "basic", setupPrice: 450, monthlyPrice: 90,
      retainerStatus: "active", liveUrl: "https://main-street-florist.example.com", showcasePermission: false,
      startDate: Date.now() - 20 * 864e5, editsUsedThisMonth: 1, editAllowance: 2, nextBillingAt: Date.now() + 10 * 864e5,
    });
    const groomer = await ctx.db.insert("clients", {
      businessId: ids.get(demoId(12))!, email: "demo-lucy@example.com", tier: "basic", setupPrice: 350, monthlyPrice: 80,
      retainerStatus: "pending", showcasePermission: false, startDate: Date.now() - 864e5, editsUsedThisMonth: 0, editAllowance: 2,
    });
    const steps = ["paid", "details_received", "building", "preview_ready", "approved", "live"] as const;
    for (const step of steps) await ctx.db.insert("projectProgress", { clientId: florist, step, status: "done", updatedAt: Date.now() });
    for (const [i, step] of steps.entries()) {
      await ctx.db.insert("projectProgress", {
        clientId: groomer, step, status: i < 2 ? "done" : i === 2 ? "current" : "pending", updatedAt: Date.now(),
        note: step === "details_received" ? "Got your logo and 6 photos." : step === "building" ? "Building your site now." : undefined,
      });
    }
    await ctx.db.insert("editRequests", {
      clientId: florist, requestText: "Can you swap the top photo for the new Valentine's arrangement?", attachments: [],
      category: "included", status: "live", autoHandled: true, completedAt: Date.now() - 5 * 864e5,
    });
    await ctx.db.insert("clientCosts", {
      clientId: florist, month: new Date().toISOString().slice(0, 7), hosting: 2, domain: 1.5, email: 0, aiUsage: 0.8, stripeFees: 2.91, other: 0,
    });
    await ctx.db.insert("sendingInboxes", {
      address: "demo-inbox@example.com", domain: "example.com", displayName: "Acen (demo inbox)", dailyCap: 15, sentToday: 3,
      warmupDay: 0, health: "good", bounceRate: 0, complaintCount: 0, oauthConnected: false,
    });
    await ctx.db.insert("styleRules", { ruleText: "Keep first emails under 100 words.", kind: "style", source: "instruction", status: "active" });
    await ctx.db.insert("styleRules", { ruleText: "Use the owner's first name when we know it.", kind: "style", source: "instruction", status: "active" });
    await ctx.db.insert("replyLibrary", {
      situationType: "asks_about_cancel", inboundText: "What if I want to cancel?",
      responseText: "No contract at all. If you cancel, the site stays up through the month you've paid for, then comes down. No fees.",
      source: "seed",
    });
    return "Seeded demo data.";
  },
});

export const clear = internalMutation({
  args: {},
  handler: async (ctx) => {
    const demo = await ctx.db.query("businesses").withIndex("by_demo", (q) => q.eq("isDemo", true)).collect();
    for (const b of demo) {
      for (const table of ["contacts", "demoSites", "pricingFeedback", "paymentLinks", "calls"] as const) {
        const rows = await ctx.db.query(table).filter((q) => q.eq(q.field("businessId"), b._id)).collect();
        for (const r of rows) await ctx.db.delete(r._id);
      }
      for (const m of await ctx.db.query("messages").withIndex("by_business", (q) => q.eq("businessId", b._id)).collect()) await ctx.db.delete(m._id);
      for (const t of await ctx.db.query("tasks").filter((q) => q.eq(q.field("businessId"), b._id)).collect()) await ctx.db.delete(t._id);
      for (const a of await ctx.db.query("activityLog").withIndex("by_business", (q) => q.eq("businessId", b._id)).collect()) await ctx.db.delete(a._id);
      const client = await ctx.db.query("clients").withIndex("by_business", (q) => q.eq("businessId", b._id)).unique();
      if (client) {
        for (const table of ["projectProgress", "editRequests", "clientUploads"] as const) {
          for (const r of await ctx.db.query(table).withIndex("by_client", (q) => q.eq("clientId", client._id)).collect()) await ctx.db.delete(r._id);
        }
        for (const c of await ctx.db.query("clientCosts").filter((q) => q.eq(q.field("clientId"), client._id)).collect()) await ctx.db.delete(c._id);
        await ctx.db.delete(client._id);
      }
      await ctx.db.delete(b._id);
    }
    const inbox = await ctx.db.query("sendingInboxes").withIndex("by_address", (q) => q.eq("address", "demo-inbox@example.com")).unique();
    if (inbox) await ctx.db.delete(inbox._id);
    return `Removed ${demo.length} demo businesses.`;
  },
});
