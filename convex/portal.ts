import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getViewer, requireClient } from "./lib/access";
import { logActivity } from "./lib/helpers";

// Client portal (spec Section 19). Every function is scoped to the signed-in client's own records;
// there is no argument that lets a client point at someone else's data.

export const whoami = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    return viewer ? { role: viewer.role, email: viewer.email } : null;
  },
});

export const me = query({
  args: {},
  handler: async (ctx) => {
    const { client } = await requireClient(ctx);
    const business = await ctx.db.get(client.businessId);
    const progress = await ctx.db.query("projectProgress").withIndex("by_client", (q) => q.eq("clientId", client._id)).collect();
    return {
      business: business && {
        name: business.name, category: business.category, city: business.city, phone: business.phone,
        email: business.email, hours: business.hours, services: business.services,
      },
      plan: {
        tier: client.tier, setupPrice: client.setupPrice, monthlyPrice: client.monthlyPrice, status: client.retainerStatus,
        liveUrl: client.customDomain ? `https://${client.customDomain}` : client.liveUrl, nextBillingAt: client.nextBillingAt,
        editsUsedThisMonth: client.editsUsedThisMonth, editAllowance: client.editAllowance,
      },
      progress: progress.map((p) => ({ step: p.step, status: p.status, note: p.note, updatedAt: p.updatedAt })),
    };
  },
});

export const editRequests = query({
  args: {},
  handler: async (ctx) => {
    const { client } = await requireClient(ctx);
    const rows = await ctx.db.query("editRequests").withIndex("by_client", (q) => q.eq("clientId", client._id)).order("desc").collect();
    return rows.map((r) => ({
      id: r._id, text: r.requestText, status: r.status, category: r.category, quotedPrice: r.quotedPrice,
      previewUrl: r.previewUrl, createdAt: r._creationTime,
    }));
  },
});

export const createEditRequest = mutation({
  args: { text: v.string(), attachments: v.optional(v.array(v.id("_storage"))) },
  handler: async (ctx, { text, attachments }) => {
    const { client } = await requireClient(ctx);
    const requestText = text.trim();
    if (!requestText) throw new ConvexError("Describe the change you'd like.");
    if (requestText.length > 4000) throw new ConvexError("That's a bit long. Keep it under 4,000 characters.");
    const id = await ctx.db.insert("editRequests", {
      clientId: client._id, requestText, attachments: attachments ?? [], status: "received", autoHandled: false,
    });
    await logActivity(ctx, { businessId: client.businessId, actor: "client", action: "edit_requested" });
    return id;
  },
});

export const messages = query({
  args: {},
  handler: async (ctx) => {
    const { client } = await requireClient(ctx);
    const rows = await ctx.db.query("messages").withIndex("by_business", (q) => q.eq("businessId", client.businessId)).collect();
    return rows
      .filter((m) => m.channel === "portal" && ["sent", "delivered", "received"].includes(m.status))
      .sort((a, b) => a._creationTime - b._creationTime)
      .map((m) => ({ id: m._id, fromAgency: m.direction === "outbound", body: m.body ?? "", at: m._creationTime }));
  },
});

export const sendMessage = mutation({
  args: { body: v.string() },
  handler: async (ctx, { body }) => {
    const { client } = await requireClient(ctx);
    const text = body.trim();
    if (!text) throw new ConvexError("Write something first.");
    await ctx.db.insert("messages", {
      businessId: client.businessId, threadId: `portal-${client._id}`, channel: "portal", direction: "inbound",
      body: text.slice(0, 4000), status: "received", writtenBy: "client", autoSent: false,
    });
    await logActivity(ctx, { businessId: client.businessId, actor: "client", action: "portal_message" });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireClient(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveUpload = mutation({
  args: { storageId: v.id("_storage"), type: v.union(v.literal("logo"), v.literal("photo"), v.literal("doc")) },
  handler: async (ctx, { storageId, type }) => {
    const { client } = await requireClient(ctx);
    const meta = await ctx.db.system.get(storageId);
    if (!meta) throw new ConvexError("Upload not found.");
    if (meta.size > 15 * 1024 * 1024) {
      await ctx.storage.delete(storageId);
      throw new ConvexError("Files must be under 15 MB.");
    }
    await ctx.db.insert("clientUploads", { clientId: client._id, storageId, type });
  },
});

export const uploads = query({
  args: {},
  handler: async (ctx) => {
    const { client } = await requireClient(ctx);
    const rows = await ctx.db.query("clientUploads").withIndex("by_client", (q) => q.eq("clientId", client._id)).collect();
    return await Promise.all(rows.map(async (u) => ({ id: u._id, type: u.type, url: await ctx.storage.getUrl(u.storageId) })));
  },
});
