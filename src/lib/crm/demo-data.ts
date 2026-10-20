import type { Activity, CallLog, Health, Lead, Message, Metrics, Stage, Task, Tier } from "./types";

// Fake demo data, used two ways: the CRM shows it directly before the database is connected,
// and convex/seed.ts loads it into Convex.
// Every business is fictional; emails use example.com and phones use 555-01xx.

const H = 3600_000;
const D = 24 * H;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const ahead = (ms: number) => new Date(Date.now() + ms).toISOString();

type Seed = {
  n: number; name: string; category: string; city: string; phone: string; email: string | null; contact: string | null;
  presence: Lead["web_presence"]; issues?: string[]; rating: number; reviews: number; services: string[]; family: boolean;
  stage: Stage; score: number; owner: "auto" | "acen"; next: string | null; nextAt: number | null; changed: number;
  q: number; size: NonNullable<Lead["assessment"]>["size_signal"]; tier: Tier; setup: number; monthly: number; why: string; rules: string[];
  demo?: { views: number; unique: number; viewed: number | null };
};

const seeds: Seed[] = [
  { n: 1, name: "Rivera Family Lawn Care", category: "Lawn care", city: "High Point", phone: "(336) 555-0101", email: "demo-rivera@example.com", contact: "Luis Rivera", presence: "none", rating: 4.9, reviews: 27, services: ["Mowing", "Edging", "Leaf removal", "Mulch"], family: true, stage: "replied", score: 92, owner: "acen", next: "approve_reply", nextAt: 0, changed: -1 * H, q: 62, size: "family_solo", tier: "basic", setup: 400, monthly: 85, why: "Owner's name in business name, one location, 27 reviews. Family business, so capped at Basic and priced below the ceiling.", rules: ["family_cap", "lean_low_under_30_reviews"], demo: { views: 6, unique: 2, viewed: 2 * H } },
  { n: 2, name: "Nguyen's Nail Studio", category: "Nail salon", city: "Greensboro", phone: "(336) 555-0102", email: "demo-nguyen@example.com", contact: "Kim Nguyen", presence: "facebook_only", rating: 4.7, reviews: 64, services: ["Manicures", "Pedicures", "Gel", "Dip powder"], family: true, stage: "emailed", score: 74, owner: "auto", next: "send_follow_up_1", nextAt: 2 * D, changed: -1 * D, q: 58, size: "family_solo", tier: "basic", setup: 450, monthly: 90, why: "Facebook-only, owner-run, 64 reviews. Family cap applies.", rules: ["family_cap"], demo: { views: 0, unique: 0, viewed: null } },
  { n: 3, name: "Summit Roofing & Exteriors", category: "Roofing", city: "Winston-Salem", phone: "(336) 555-0103", email: "demo-summit@example.com", contact: null, presence: "weak_site", issues: ["Not mobile friendly", "No click-to-call", "Copyright says 2014"], rating: 4.8, reviews: 212, services: ["Roof replacement", "Repairs", "Gutters", "Siding"], family: false, stage: "payment_clicked", score: 95, owner: "auto", next: "send_payment_nudge", nextAt: 20 * H, changed: -4 * H, q: 84, size: "established", tier: "premium", setup: 950, monthly: 145, why: "Roofing (high-ticket), 212 reviews, 22 years. Existing site is outdated. Premium fits.", rules: ["premium_category", "100_plus_reviews"], demo: { views: 9, unique: 3, viewed: 4 * H } },
  { n: 4, name: "Bea's Home Bakery", category: "Bakery", city: "Thomasville", phone: "(336) 555-0104", email: null, contact: null, presence: "social_only", rating: 5.0, reviews: 18, services: ["Custom cakes", "Cupcakes", "Cookies"], family: true, stage: "needs_call", score: 70, owner: "acen", next: "call", nextAt: 0, changed: -2 * D, q: 40, size: "family_solo", tier: "basic", setup: 300, monthly: 75, why: "Home bakery, 18 reviews, 3 years. Very small, so priced at the low end.", rules: ["family_cap", "home_based_lean_lower"], demo: { views: 0, unique: 0, viewed: null } },
  { n: 5, name: "Carter HVAC Services", category: "HVAC", city: "Charlotte", phone: "(704) 555-0105", email: "demo-carter@example.com", contact: "Dana Carter", presence: "none", rating: 4.6, reviews: 141, services: ["AC repair", "Heating", "Installs", "Maintenance plans"], family: false, stage: "demo_built", score: 81, owner: "auto", next: "send_first_email", nextAt: 14 * H, changed: -6 * H, q: 80, size: "established", tier: "premium", setup: 900, monthly: 140, why: "HVAC (high-ticket), 141 reviews, 15 years, no website.", rules: ["premium_category", "100_plus_reviews"], demo: { views: 0, unique: 0, viewed: null } },
  { n: 6, name: "Joe's Barber Shop", category: "Barber", city: "Lexington", phone: "(336) 555-0106", email: "demo-joes@example.com", contact: "Joe Simmons", presence: "none", rating: 4.8, reviews: 39, services: ["Haircuts", "Fades", "Beard trims"], family: true, stage: "follow_up_1", score: 66, owner: "auto", next: "send_follow_up_2", nextAt: 4 * D, changed: -3 * D, q: 55, size: "family_solo", tier: "basic", setup: 400, monthly: 85, why: "Single-chair shop, family run.", rules: ["family_cap"], demo: { views: 2, unique: 1, viewed: 1 * D } },
  { n: 7, name: "Patel Family Dental", category: "Dental", city: "Raleigh", phone: "(919) 555-0107", email: "demo-patel@example.com", contact: null, presence: "weak_site", issues: ["Slow to load", "No online booking"], rating: 4.9, reviews: 188, services: ["Cleanings", "Fillings", "Crowns", "Whitening"], family: false, stage: "call_booked", score: 90, owner: "acen", next: "call", nextAt: 1 * D, changed: -1 * D, q: 88, size: "premium", tier: "all_out", setup: 1800, monthly: 225, why: "Dental practice, 188 reviews, wants booking. All-Out fits.", rules: ["premium_category", "100_plus_reviews"], demo: { views: 4, unique: 2, viewed: 1 * D } },
  { n: 8, name: "Greenway Pressure Washing", category: "Pressure washing", city: "Kernersville", phone: "(336) 555-0108", email: "demo-greenway@example.com", contact: null, presence: "facebook_only", rating: 4.9, reviews: 22, services: ["House washing", "Driveways", "Decks"], family: true, stage: "priced", score: 60, owner: "auto", next: "build_demo", nextAt: 3 * H, changed: -2 * H, q: 45, size: "family_solo", tier: "basic", setup: 350, monthly: 80, why: "New business, 22 reviews.", rules: ["family_cap", "lean_low_under_30_reviews"] },
  { n: 9, name: "Holloway Auto Repair", category: "Auto repair", city: "Asheboro", phone: "(336) 555-0109", email: "demo-holloway@example.com", contact: null, presence: "none", rating: 4.5, reviews: 56, services: ["Brakes", "Oil changes", "Diagnostics"], family: true, stage: "new", score: 55, owner: "auto", next: "assess", nextAt: 1 * H, changed: 0, q: 60, size: "family_solo", tier: "basic", setup: 450, monthly: 95, why: "Family-owned shop, 19 years.", rules: ["family_cap"] },
  { n: 10, name: "Main Street Florist", category: "Florist", city: "Burlington", phone: "(336) 555-0110", email: "demo-florist@example.com", contact: "Grace Lee", presence: "none", rating: 4.8, reviews: 73, services: ["Weddings", "Funerals", "Daily arrangements"], family: true, stage: "retainer_active", score: 100, owner: "auto", next: null, nextAt: null, changed: -20 * D, q: 63, size: "family_solo", tier: "basic", setup: 450, monthly: 90, why: "Small florist, one location.", rules: ["family_cap"] },
  { n: 11, name: "Oakline Painting Co.", category: "Painting", city: "Durham", phone: "(919) 555-0111", email: "demo-oakline@example.com", contact: null, presence: "weak_site", issues: ["Placeholder text on home page"], rating: 4.7, reviews: 95, services: ["Interior", "Exterior", "Cabinets"], family: false, stage: "later", score: 45, owner: "auto", next: "resurface", nextAt: 80 * D, changed: -10 * D, q: 70, size: "small", tier: "premium", setup: 800, monthly: 130, why: "Crew-based painter, 95 reviews.", rules: [] },
  { n: 12, name: "Lucy's Pet Grooming", category: "Pet grooming", city: "Jamestown", phone: "(336) 555-0112", email: "demo-lucy@example.com", contact: null, presence: "social_only", rating: 4.9, reviews: 31, services: ["Baths", "Haircuts", "Nail trims"], family: true, stage: "building", score: 100, owner: "auto", next: "post_preview_in_portal", nextAt: 1 * D, changed: -1 * D, q: 50, size: "family_solo", tier: "basic", setup: 350, monthly: 80, why: "Solo groomer.", rules: ["family_cap"] },
];

export const demoId = (n: number) => `00000000-0000-4000-a000-${String(n).padStart(12, "0")}`;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function demoLeads(): Lead[] {
  return seeds.map((s) => ({
    id: demoId(s.n),
    name: s.name,
    category: s.category,
    city: s.city,
    address: null,
    phone: s.phone,
    email: s.email,
    email_source: s.email ? "google_business_listing" : null,
    website_url: s.presence === "weak_site" ? "https://example.com" : null,
    facebook_url: s.presence === "facebook_only" ? "https://facebook.com/example" : null,
    web_presence: s.presence,
    website_issues: s.issues ?? [],
    google_rating: s.rating,
    review_count: s.reviews,
    services: s.services,
    is_family_business: s.family,
    source: "seed",
    created_at: ago(Math.max(-s.changed, 0) + 2 * D),
    contact_name: s.contact,
    stage: s.stage,
    stage_changed_at: ago(-s.changed),
    lead_score: s.score,
    owner: s.owner,
    next_action: s.next,
    next_action_at: s.nextAt === null ? null : ahead(s.nextAt),
    lost_reason: null,
    assessment: {
      quality_score: s.q, size_signal: s.size, recommended_tier: s.tier, setup_price: s.setup,
      monthly_price: s.monthly, reasoning: s.why, rules_applied: s.rules, overridden_by_acen: false,
    },
    demo: s.demo
      ? { url: `https://${slug(s.name)}.preview.example.com`, screenshot_url: null, qa_passed: true, views: s.demo.views, unique_views: s.demo.unique, last_viewed_at: s.demo.viewed === null ? null : ago(s.demo.viewed) }
      : null,
  }));
}

export function demoMessages(): Message[] {
  const base = { ai_reasoning: null, auto_sent: false } as const;
  return [
    { ...base, id: "m1", thread_id: "demo-thread-1", business_id: demoId(1), channel: "email", direction: "outbound", subject: "website for Rivera Family Lawn Care",
      body: "Hey Luis,\n\nI run a small agency that builds websites for local businesses around High Point. I came across Rivera Family Lawn Care on Google. Your reviews are great, but I noticed you don't have a website yet.\n\nSo I went ahead and built you one to check out:\nhttps://rivera-family-lawn-care.preview.example.com\n(That link is just a preview. The real site goes on your own domain.)\n\nIf you like it, it's $400 to put it live, then $85/month and I handle hosting, updates, and any changes. No contract.\n\nOr just reply here with any questions.\n\nAcen",
      status: "sent", ai_classification: null, ai_confidence: null, auto_sent: true, written_by: "ai", sent_at: ago(2 * D), created_at: ago(2 * D) },
    { ...base, id: "m2", thread_id: "demo-thread-1", business_id: demoId(1), channel: "email", direction: "inbound", subject: "Re: website for Rivera Family Lawn Care",
      body: "This looks great. Can you add a page for our spring cleanup special? And what's the deal if I want to cancel later?",
      status: "received", ai_classification: "interested_with_questions", ai_confidence: 0.71, written_by: "lead", sent_at: null, created_at: ago(1 * H) },
    { ...base, id: "m3", thread_id: "demo-thread-1", business_id: demoId(1), channel: "email", direction: "outbound", subject: "Re: website for Rivera Family Lawn Care",
      body: "Hey Luis, glad you like it. I can add a spring cleanup section, just send me what you'd like it to say. If you ever want to cancel, the site stays up through the month you've paid for, then comes down. No fees, no contract.\n\nReady when you are: [payment link]\n\nAcen",
      status: "pending_approval", ai_classification: "interested_with_questions", ai_confidence: 0.71,
      ai_reasoning: "Lead asked for a content change and about canceling. Both are covered by the FAQ, but the spring special is a new section, so confidence is below your 80% threshold.",
      written_by: "ai", sent_at: null, created_at: ago(50 * 60_000) },
    { ...base, id: "m4", thread_id: "demo-thread-2", business_id: demoId(2), channel: "email", direction: "outbound", subject: "website for Nguyen's Nail Studio",
      body: "Hey Kim,\n\nI found Nguyen's Nail Studio through your Facebook page. Looks like that's where most of your info lives right now, but there's no website people can find on Google...",
      status: "sent", ai_classification: null, ai_confidence: null, auto_sent: true, written_by: "ai", sent_at: ago(1 * D), created_at: ago(1 * D) },
    { ...base, id: "m5", thread_id: "demo-thread-3", business_id: demoId(3), channel: "email", direction: "outbound", subject: "website for Summit Roofing & Exteriors",
      body: "Hey there,\n\nI was checking out Summit Roofing's website and noticed it's hard to use on a phone and there's no tap-to-call button...",
      status: "sent", ai_classification: null, ai_confidence: null, auto_sent: true, written_by: "ai", sent_at: ago(3 * D), created_at: ago(3 * D) },
    { ...base, id: "m6", thread_id: "demo-thread-4", business_id: demoId(10), channel: "portal", direction: "inbound", subject: "Portal message",
      body: "Can we put our Mother's Day hours on the site?", status: "received", ai_classification: "edit_request", ai_confidence: 0.94, written_by: "client", sent_at: null, created_at: ago(5 * H) },
    { ...base, id: "m7", thread_id: "demo-thread-4", business_id: demoId(10), channel: "portal", direction: "outbound", subject: "Portal message",
      body: "Done! Your Mother's Day hours are up on the site now. That one's included in your plan.", status: "sent", ai_classification: "edit_request", ai_confidence: 0.94, auto_sent: true, written_by: "ai", sent_at: ago(4 * H), created_at: ago(4 * H) },
  ];
}

export function demoTasks(): Task[] {
  return [
    { id: "t1", business_id: demoId(1), business_name: "Rivera Family Lawn Care", kind: "approve_message", title: "Approve reply to Rivera Family Lawn Care", detail: "AI confidence was 71%, below your 80% threshold. Read the draft and tap Approve or Edit.", priority: 90, ref_id: "m3", created_at: ago(50 * 60_000) },
    { id: "t2", business_id: demoId(7), business_name: "Patel Family Dental", kind: "call", title: "Call booked: Patel Family Dental", detail: "Tomorrow. Price, demo, and script are on the call card.", priority: 80, ref_id: null, created_at: ago(1 * D) },
    { id: "t3", business_id: demoId(4), business_name: "Bea's Home Bakery", kind: "call", title: "Call Bea's Home Bakery", detail: "No public email found. Demo is ready; script and price are on the call card.", priority: 70, ref_id: null, created_at: ago(2 * D) },
  ];
}

export function demoActivity(): Activity[] {
  const rows: Omit<Activity, "id">[] = [
    { business_id: demoId(9), business_name: "Holloway Auto Repair", actor: "system", action: "lead_found", detail: { source: "google_places" }, created_at: ago(10 * 60_000) },
    { business_id: demoId(1), business_name: "Rivera Family Lawn Care", actor: "ai", action: "drafted_reply", detail: { confidence: 0.71, pinned_for_acen: true }, created_at: ago(50 * 60_000) },
    { business_id: demoId(1), business_name: "Rivera Family Lawn Care", actor: "lead", action: "email_reply_received", detail: {}, created_at: ago(1 * H) },
    { business_id: demoId(3), business_name: "Summit Roofing & Exteriors", actor: "lead", action: "payment_link_clicked", detail: {}, created_at: ago(4 * H) },
    { business_id: demoId(10), business_name: "Main Street Florist", actor: "ai", action: "edit_auto_handled", detail: {}, created_at: ago(4 * H) },
    { business_id: demoId(5), business_name: "Carter HVAC Services", actor: "ai", action: "demo_built", detail: { qa_passed: true }, created_at: ago(6 * H) },
    { business_id: demoId(8), business_name: "Greenway Pressure Washing", actor: "ai", action: "priced", detail: { tier: "basic", setup: 350 }, created_at: ago(2 * H) },
  ];
  return rows.map((r, i) => ({ ...r, id: i + 1 })).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function demoMetrics(): Metrics {
  return { mrr: 90, setupRevenue: 800, monthCosts: 7.21, activeClients: 1, leadsToday: 4, emailsToday: 3, repliesToday: 1, demosViewedToday: 3, autoActionsToday: 18, acenActionsToday: 1 };
}

export function demoHealth(): Health {
  return {
    killSwitchOn: false,
    demoMode: true,
    inboxes: [{ address: "demo-inbox@example.com", daily_cap: 15, sent_today: 3, warmup_day: 0, health: "good", bounce_rate: 0 }],
    failedJobs: 0,
  };
}

export function demoCalls(): CallLog[] {
  return [{ id: "c1", business_id: demoId(7), scheduled_at: ahead(1 * D), outcome: null, notes: null, created_at: ago(1 * D) }];
}
