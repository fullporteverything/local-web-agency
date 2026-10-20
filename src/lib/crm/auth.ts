import "server-only";
import { redirect } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { isConvexConfigured, query } from "@/lib/convex/server";

// The CRM is owner-only. In demo mode (no database yet) it shows fake data to anyone,
// which is safe because nothing real exists and every action is a no-op.
export async function requireOwner() {
  if (!isConvexConfigured()) return { demo: true as const };
  const me = await query(api.portal.whoami, {}).catch(() => null);
  if (!me) redirect("/admin/login");
  if (me.role !== "owner") redirect("/admin/login?error=not_owner");
  return { demo: false as const };
}
