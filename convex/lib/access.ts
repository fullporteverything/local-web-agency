import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

// Who is calling? Every public function starts with one of the require* helpers below.
// - owner:  the signed-in user whose email matches the OWNER_EMAIL environment variable
// - client: a signed-in user linked to a row in `clients` (by user id or login email)
// - nobody else gets any data.

export type Viewer =
  | { role: "owner"; userId: Id<"users">; email: string }
  | { role: "client"; userId: Id<"users">; email: string; client: Doc<"clients"> };

export function ownerEmail() {
  return (process.env.OWNER_EMAIL ?? "").trim().toLowerCase();
}

export async function getViewer(ctx: QueryCtx): Promise<Viewer | null> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const user = await ctx.db.get(userId);
  const email = user?.email?.toLowerCase();
  if (!email) return null;
  if (ownerEmail() && email === ownerEmail()) return { role: "owner", userId, email };
  const client =
    (await ctx.db.query("clients").withIndex("by_user", (q) => q.eq("userId", userId)).unique()) ??
    (await ctx.db.query("clients").withIndex("by_email", (q) => q.eq("email", email)).first());
  if (client) return { role: "client", userId, email, client };
  return null;
}

export async function requireOwner(ctx: QueryCtx) {
  const viewer = await getViewer(ctx);
  if (viewer?.role !== "owner") throw new ConvexError("Owner only.");
  return viewer;
}

export async function requireClient(ctx: QueryCtx) {
  const viewer = await getViewer(ctx);
  if (viewer?.role !== "client") throw new ConvexError("Clients only.");
  return viewer;
}
