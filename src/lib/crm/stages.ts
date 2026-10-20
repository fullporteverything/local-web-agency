import type { Stage, Tier, WebPresence } from "./types";

export const stageLabels: Record<Stage, string> = {
  new: "New",
  qualified: "Qualified",
  priced: "Priced",
  demo_built: "Demo built",
  emailed: "Emailed",
  follow_up_1: "Follow-up 1",
  follow_up_2: "Follow-up 2",
  replied: "Replied",
  payment_clicked: "Payment link clicked",
  needs_call: "Needs call",
  call_booked: "Call booked",
  paid: "Paid",
  onboarding: "Onboarding",
  building: "Building",
  live: "Live",
  retainer_active: "Retainer active",
  canceled: "Canceled",
  site_removed: "Site removed",
  lost: "Lost",
  later: "Later",
  suppressed: "Suppressed",
};

// Board columns: related stages are grouped so the board stays readable on a phone.
export const boardColumns: { key: string; label: string; stages: Stage[] }[] = [
  { key: "prep", label: "Finding & prep", stages: ["new", "qualified", "priced", "demo_built"] },
  { key: "outreach", label: "Outreach", stages: ["emailed", "follow_up_1", "follow_up_2"] },
  { key: "hot", label: "Hot", stages: ["replied", "payment_clicked"] },
  { key: "calls", label: "Calls", stages: ["needs_call", "call_booked"] },
  { key: "won", label: "Won", stages: ["paid", "onboarding", "building", "live"] },
  { key: "clients", label: "Clients", stages: ["retainer_active"] },
  { key: "closed", label: "Closed", stages: ["later", "lost", "canceled", "site_removed", "suppressed"] },
];

export const allStages = Object.keys(stageLabels) as Stage[];

export const tierLabels: Record<Tier, string> = { basic: "Basic", premium: "Premium", all_out: "All-Out" };

export const presenceLabels: Record<WebPresence, string> = {
  none: "No website",
  weak_site: "Weak site",
  facebook_only: "Facebook only",
  social_only: "Social only",
  ok: "Has a decent site",
};

export const nextActionLabels: Record<string, string> = {
  assess: "Assess and price",
  assess_and_build_demo: "Assess, price, and build demo",
  build_demo: "Build demo",
  send_first_email: "Send first email",
  send_follow_up_1: "Send follow-up 1",
  send_follow_up_2: "Send follow-up 2",
  send_payment_nudge: "Send payment nudge",
  approve_reply: "Approve AI reply",
  reply_to_inbound: "Reply to inbound",
  call: "Call",
  resurface: "Check back in",
  post_preview_in_portal: "Post preview in portal",
};

export function stageTone(stage: Stage): "green" | "amber" | "red" | "blue" | "muted" {
  if (["replied", "payment_clicked", "paid", "live", "retainer_active"].includes(stage)) return "green";
  if (["needs_call", "call_booked", "onboarding", "building"].includes(stage)) return "amber";
  if (["lost", "suppressed", "canceled", "site_removed"].includes(stage)) return "red";
  if (["emailed", "follow_up_1", "follow_up_2"].includes(stage)) return "blue";
  return "muted";
}
