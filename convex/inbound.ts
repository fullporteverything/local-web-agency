import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { isSuppressed, logActivity } from "./lib/helpers";

// Agency-site contact + "free preview" forms. Called only by the Next.js API route, which
// passes INBOUND_SECRET (set on both Vercel and Convex) after validating and rate-limiting the form.

export const submit = mutation({
  args: {
    secret: v.string(),
    kind: v.union(v.literal("contact"), v.literal("free_preview")),
    name: v.string(),
    businessName: v.string(),
    email: v.string(),
    phone: v.string(),
    city: v.string(),
    currentUrl: v.string(),
    message: v.string(),
  },
  handler: async (ctx, a) => {
    if (!process.env.INBOUND_SECRET || a.secret !== process.env.INBOUND_SECRET) throw new ConvexError("Not allowed.");
    const email = a.email.trim().toLowerCase();
    const url = a.currentUrl.trim() || undefined;
    const isFb = !!url && /facebook\.com/i.test(url);

    // Reuse an existing lead with the same email instead of creating a duplicate.
    let business = await ctx.db.query("businesses").withIndex("by_email", (q) => q.eq("email", email)).first();
    if (!business) {
      const id = await ctx.db.insert("businesses", {
        name: a.businessName.trim() || a.name.trim(),
        city: a.city.trim() || undefined,
        phone: a.phone.trim() || undefined,
        email,
        emailSource: "inbound_form",
        emailConfidence: 1,
        websiteUrl: isFb ? undefined : url,
        facebookUrl: isFb ? url : undefined,
        webPresence: !url ? "none" : isFb ? "facebook_only" : undefined,
        websiteIssues: [],
        services: [],
        photos: [],
        reviews: [],
        isChain: false,
        source: "inbound",
        isDemo: false,
        contactName: a.name.trim(),
        stage: "new",
        stageChangedAt: Date.now(),
        owner: "auto",
        leadScore: 85,
        nextAction: "assess_and_build_demo",
        nextActionAt: Date.now(),
      });
      await ctx.db.insert("contacts", { businessId: id, name: a.name.trim(), email, phone: a.phone.trim() || undefined, isPrimary: true });
      business = (await ctx.db.get(id))!;
    } else {
      await ctx.db.patch(business._id, {
        leadScore: Math.max(business.leadScore, 85),
        nextAction: "reply_to_inbound",
        nextActionAt: Date.now(),
      });
    }

    // People who write to us opted in for this conversation. A prior opt-out is still respected
    // for cold outreach, so it's flagged for the AI/Acen rather than silently dropped.
    await ctx.db.insert("messages", {
      businessId: business._id,
      channel: "web_form",
      direction: "inbound",
      subject: a.kind === "free_preview" ? "Free preview request" : "Contact form",
      body: a.message.trim(),
      status: "received",
      writtenBy: "lead",
      autoSent: false,
      metadata: { kind: a.kind, name: a.name.trim(), previouslySuppressed: await isSuppressed(ctx, email) },
    });
    await logActivity(ctx, { businessId: business._id, actor: "lead", action: "inbound_form", detail: { kind: a.kind } });
    return business._id;
  },
});
