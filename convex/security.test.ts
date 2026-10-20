/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { beforeEach, describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

// Proves the access rules: owner sees everything, each client sees only their own data,
// signed-out visitors see nothing, and the hard pricing rules can't be broken.

const modules = import.meta.glob("./**/*.*s");
const OWNER = "owner@agency.test";

async function setup() {
  process.env.OWNER_EMAIL = OWNER;
  process.env.INBOUND_SECRET = "test-secret";
  const t = convexTest(schema, modules);
  await t.mutation(internal.seed.run, {});
  const ids = await t.run(async (ctx) => {
    const owner = await ctx.db.insert("users", { email: OWNER });
    const florist = await ctx.db.insert("users", { email: "demo-florist@example.com" });
    const groomer = await ctx.db.insert("users", { email: "demo-lucy@example.com" });
    const stranger = await ctx.db.insert("users", { email: "stranger@example.com" });
    const clients = await ctx.db.query("clients").collect();
    const floristClient = clients.find((c) => c.email === "demo-florist@example.com")!;
    const groomerClient = clients.find((c) => c.email === "demo-lucy@example.com")!;
    await ctx.db.patch(floristClient._id, { userId: florist });
    const family = (await ctx.db.query("businesses").collect()).find((b) => b.name === "Rivera Family Lawn Care")!;
    const pending = (await ctx.db.query("messages").withIndex("by_status", (q) => q.eq("status", "pending_approval")).first())!;
    return { owner, florist, groomer, stranger, floristClient, groomerClient, family, pending };
  });
  const as = (userId: Id<"users">) => t.withIdentity({ subject: `${userId}|session` });
  return { t, ids, as };
}

let ctx: Awaited<ReturnType<typeof setup>>;
beforeEach(async () => {
  ctx = await setup();
});

describe("signed-out visitors", () => {
  test("can't read CRM or portal data", async () => {
    await expect(ctx.t.query(api.crm.leads, {})).rejects.toThrow(/Owner only/);
    await expect(ctx.t.query(api.crm.tasks, {})).rejects.toThrow(/Owner only/);
    await expect(ctx.t.query(api.portal.me, {})).rejects.toThrow(/Clients only/);
  });
  test("can't change anything", async () => {
    await expect(ctx.t.mutation(api.crm.setKillSwitch, { on: true })).rejects.toThrow(/Owner only/);
    await expect(ctx.t.mutation(api.crm.moveStage, { businessId: ctx.ids.family._id, stage: "lost" })).rejects.toThrow(/Owner only/);
  });
  test("can only see showcase-safe fields on the public work page", async () => {
    const list = await ctx.t.query(api.showcase.list, {});
    expect(list).toEqual([]); // demo clients never show, and none gave permission
  });
});

describe("owner", () => {
  test("sees every lead and the needs-you list", async () => {
    const leads = await ctx.as(ctx.ids.owner).query(api.crm.leads, {});
    expect(leads).toHaveLength(12);
    const tasks = await ctx.as(ctx.ids.owner).query(api.crm.tasks, {});
    expect(tasks.length).toBe(3);
  });
  test("can flip the kill switch", async () => {
    await ctx.as(ctx.ids.owner).mutation(api.crm.setKillSwitch, { on: true });
    const health = await ctx.as(ctx.ids.owner).query(api.crm.health, {});
    expect(health.killSwitchOn).toBe(true);
  });
  test("owner email match is case-insensitive", async () => {
    const upper = await ctx.t.run((c) => c.db.insert("users", { email: "OWNER@Agency.test" }));
    await expect(ctx.as(upper).query(api.crm.leads, {})).resolves.toHaveLength(12);
  });
});

describe("clients", () => {
  test("a client sees only their own business, progress, and edits", async () => {
    const me = await ctx.as(ctx.ids.florist).query(api.portal.me, {});
    expect(me.business?.name).toBe("Main Street Florist");
    expect(me.progress).toHaveLength(6);
    const edits = await ctx.as(ctx.ids.florist).query(api.portal.editRequests, {});
    expect(edits).toHaveLength(1);
  });
  test("a client is matched by login email before their account is linked", async () => {
    const me = await ctx.as(ctx.ids.groomer).query(api.portal.me, {});
    expect(me.business?.name).toBe("Lucy's Pet Grooming");
    expect(await ctx.as(ctx.ids.groomer).query(api.portal.editRequests, {})).toHaveLength(0);
  });
  test("a client can't use any owner function", async () => {
    const florist = ctx.as(ctx.ids.florist);
    await expect(florist.query(api.crm.leads, {})).rejects.toThrow(/Owner only/);
    await expect(florist.query(api.crm.messages, {})).rejects.toThrow(/Owner only/);
    await expect(florist.mutation(api.crm.overridePrice, { businessId: ctx.ids.family._id, setup: 1, monthly: 1 })).rejects.toThrow(/Owner only/);
    await expect(florist.mutation(api.crm.approveMessage, { messageId: ctx.ids.pending._id })).rejects.toThrow(/Owner only/);
  });
  test("edit requests land on the client's own account only", async () => {
    await ctx.as(ctx.ids.groomer).mutation(api.portal.createEditRequest, { text: "Add Saturday hours" });
    expect(await ctx.as(ctx.ids.groomer).query(api.portal.editRequests, {})).toHaveLength(1);
    expect(await ctx.as(ctx.ids.florist).query(api.portal.editRequests, {})).toHaveLength(1); // still just their own
  });
  test("portal messages only show the client's own portal thread, never email internals", async () => {
    const msgs = await ctx.as(ctx.ids.florist).query(api.portal.messages, {});
    expect(msgs.length).toBe(2);
    expect(await ctx.as(ctx.ids.groomer).query(api.portal.messages, {})).toHaveLength(0);
  });
  test("a signed-in stranger with no client record gets nothing", async () => {
    await expect(ctx.as(ctx.ids.stranger).query(api.portal.me, {})).rejects.toThrow(/Clients only/);
    await expect(ctx.as(ctx.ids.stranger).query(api.crm.leads, {})).rejects.toThrow(/Owner only/);
  });
});

describe("hard rules", () => {
  test("family businesses can't be priced over $500 setup or $100/month", async () => {
    const owner = ctx.as(ctx.ids.owner);
    await expect(owner.mutation(api.crm.overridePrice, { businessId: ctx.ids.family._id, setup: 600, monthly: 90 })).rejects.toThrow(/capped/);
    await expect(owner.mutation(api.crm.overridePrice, { businessId: ctx.ids.family._id, setup: 400, monthly: 120 })).rejects.toThrow(/capped/);
    await owner.mutation(api.crm.overridePrice, { businessId: ctx.ids.family._id, setup: 350, monthly: 80, note: "tiny lawn crew" });
    const lead = await owner.query(api.crm.lead, { id: ctx.ids.family._id });
    expect(lead?.assessment?.setup_price).toBe(350);
    expect(lead?.assessment?.overridden_by_acen).toBe(true);
  });
  test("'not interested' on a call suppresses the lead immediately", async () => {
    const owner = ctx.as(ctx.ids.owner);
    await owner.mutation(api.crm.logCallOutcome, { businessId: ctx.ids.family._id, outcome: "not_interested" });
    const lead = await owner.query(api.crm.lead, { id: ctx.ids.family._id });
    expect(lead?.stage).toBe("suppressed");
    const hit = await ctx.t.run((c) => c.db.query("suppression").withIndex("by_email", (q) => q.eq("email", "demo-rivera@example.com")).first());
    expect(hit).not.toBeNull();
  });
  test("approving with edits feeds the learning loop and closes the task", async () => {
    const owner = ctx.as(ctx.ids.owner);
    await owner.mutation(api.crm.approveMessage, { messageId: ctx.ids.pending._id, editedBody: "Hey Luis, sure thing." });
    const lib = await ctx.t.run((c) => c.db.query("replyLibrary").collect());
    expect(lib.some((r) => r.source === "acen_edited" && r.responseText === "Hey Luis, sure thing.")).toBe(true);
    const tasks = await owner.query(api.crm.tasks, {});
    expect(tasks.some((t) => t.ref_id === ctx.ids.pending._id)).toBe(false);
    await expect(owner.mutation(api.crm.approveMessage, { messageId: ctx.ids.pending._id })).rejects.toThrow(/already handled/);
  });
  test("stage changes are logged automatically", async () => {
    await ctx.as(ctx.ids.owner).mutation(api.crm.moveStage, { businessId: ctx.ids.family._id, stage: "lost" });
    const acts = await ctx.as(ctx.ids.owner).query(api.crm.activity, { businessId: ctx.ids.family._id });
    expect(acts.some((a) => a.action === "stage_changed")).toBe(true);
  });
});

describe("website forms", () => {
  const form = { kind: "free_preview" as const, name: "Pat", businessName: "Pat's Tacos", email: "Pat@Example.com", phone: "", city: "Greensboro", currentUrl: "facebook.com/pats", message: "we sell tacos" };
  test("need the server secret", async () => {
    await expect(ctx.t.mutation(api.inbound.submit, { ...form, secret: "wrong" })).rejects.toThrow(/Not allowed/);
  });
  test("create a high-score lead and don't duplicate repeat submissions", async () => {
    const id1 = await ctx.t.mutation(api.inbound.submit, { ...form, secret: "test-secret" });
    const id2 = await ctx.t.mutation(api.inbound.submit, { ...form, secret: "test-secret", kind: "contact" });
    expect(id1).toBe(id2);
    const lead = await ctx.as(ctx.ids.owner).query(api.crm.lead, { id: id1 });
    expect(lead).toMatchObject({ web_presence: "facebook_only", stage: "new", lead_score: 85, email: "pat@example.com" });
  });
});
