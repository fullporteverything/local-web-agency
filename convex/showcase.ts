import { query } from "./_generated/server";

// Public "Our work" list: live clients who gave permission. Returns only what's safe to show anyone.
export const list = query({
  args: {},
  handler: async (ctx) => {
    const clients = await ctx.db.query("clients").withIndex("by_status", (q) => q.eq("retainerStatus", "active")).collect();
    const out = [];
    for (const c of clients) {
      if (!c.showcasePermission || !(c.customDomain || c.liveUrl)) continue;
      const b = await ctx.db.get(c.businessId);
      if (!b || b.isDemo) continue;
      out.push({
        name: b.name,
        category: b.category ?? null,
        city: b.city ?? null,
        live_url: c.customDomain ? `https://${c.customDomain}` : c.liveUrl!,
        screenshot_url: c.screenshotUrl ?? null,
      });
    }
    return out.slice(0, 24);
  },
});
