import type { Activity } from "./types";

// Plain-English lines for the live activity feed.
export function describeActivity(a: Activity): string {
  const d = a.detail as Record<string, unknown>;
  switch (a.action) {
    case "lead_found": return `Found a new lead${d.source === "google_places" ? " on Google" : ""}`;
    case "inbound_form": return d.kind === "free_preview" ? "Asked for a free preview on the website" : "Sent a message through the website";
    case "priced": return `Priced at ${String(d.tier ?? "").replace("_", "-")}${d.setup ? `, $${d.setup} setup` : ""}`;
    case "demo_built": return d.qa_passed ? "Demo built and passed QA" : "Demo built, QA failed";
    case "drafted_reply": return d.pinned_for_acen ? `Drafted a reply, pinned for you (${Math.round(Number(d.confidence) * 100)}% sure)` : "Drafted and sent a reply";
    case "email_reply_received": return "Replied to our email";
    case "payment_link_clicked": return "Clicked the payment link";
    case "edit_auto_handled": return "Edit request handled automatically";
    case "stage_changed": return `Moved from ${String(d.from).replaceAll("_", " ")} to ${String(d.to).replaceAll("_", " ")}`;
    case "reply_approved": return "You approved a reply";
    case "reply_edited_and_approved": return "You edited and approved a reply";
    case "price_overridden": return "You changed the price";
    case "call_logged": return `Call logged: ${String(d.outcome).replaceAll("_", " ")}`;
    case "kill_switch_on": return "Outreach turned ON";
    case "kill_switch_off": return "Outreach turned OFF";
    default: return a.action.replaceAll("_", " ");
  }
}

export const actorLabel: Record<Activity["actor"], string> = {
  system: "System", ai: "AI", acen: "You", client: "Client", lead: "Lead",
};
