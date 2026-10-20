// Shapes the CRM screens work with. They mirror the Supabase tables (supabase/migrations).

export type Stage =
  | "new" | "qualified" | "priced" | "demo_built" | "emailed" | "follow_up_1" | "follow_up_2" | "replied"
  | "payment_clicked" | "needs_call" | "call_booked" | "paid" | "onboarding" | "building" | "live"
  | "retainer_active" | "canceled" | "site_removed" | "lost" | "later" | "suppressed";

export type Tier = "basic" | "premium" | "all_out";
export type WebPresence = "none" | "weak_site" | "facebook_only" | "social_only" | "ok";

export type Assessment = {
  quality_score: number | null;
  size_signal: "family_solo" | "small" | "established" | "premium" | null;
  recommended_tier: Tier | null;
  setup_price: number | null;
  monthly_price: number | null;
  reasoning: string | null;
  rules_applied: string[];
  overridden_by_acen: boolean;
};

export type DemoSite = {
  url: string | null;
  screenshot_url: string | null;
  qa_passed: boolean | null;
  views: number;
  unique_views: number;
  last_viewed_at: string | null;
};

export type Lead = {
  id: string;
  name: string;
  category: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  email_source: string | null;
  website_url: string | null;
  facebook_url: string | null;
  web_presence: WebPresence | null;
  website_issues: string[];
  google_rating: number | null;
  review_count: number | null;
  services: string[];
  is_family_business: boolean | null;
  source: string;
  created_at: string;
  contact_name: string | null;
  stage: Stage;
  stage_changed_at: string;
  lead_score: number;
  owner: "auto" | "acen";
  next_action: string | null;
  next_action_at: string | null;
  lost_reason: string | null;
  assessment: Assessment | null;
  demo: DemoSite | null;
};

export type Message = {
  id: string;
  thread_id: string | null;
  business_id: string | null;
  channel: "email" | "portal" | "call" | "web_form";
  direction: "inbound" | "outbound";
  subject: string | null;
  body: string | null;
  status: string;
  ai_classification: string | null;
  ai_confidence: number | null;
  ai_reasoning: string | null;
  auto_sent: boolean;
  written_by: string | null;
  sent_at: string | null;
  created_at: string;
};

export type Thread = {
  id: string;
  business_id: string | null;
  business_name: string;
  subject: string;
  channel: Message["channel"];
  last_at: string;
  last_snippet: string;
  needs_approval: boolean;
  unread_inbound: boolean;
  messages: Message[];
};

export type Task = {
  id: string;
  business_id: string | null;
  business_name: string | null;
  kind: string;
  title: string;
  detail: string | null;
  priority: number;
  ref_id: string | null;
  created_at: string;
};

export type Activity = {
  id: number;
  business_id: string | null;
  business_name: string | null;
  actor: "system" | "ai" | "acen" | "client" | "lead";
  action: string;
  detail: Record<string, unknown>;
  created_at: string;
};

export type Inbox = {
  address: string;
  daily_cap: number;
  sent_today: number;
  warmup_day: number;
  health: "good" | "watch" | "paused";
  bounce_rate: number;
};

export type Metrics = {
  mrr: number;
  setupRevenue: number;
  monthCosts: number;
  activeClients: number;
  leadsToday: number;
  emailsToday: number;
  repliesToday: number;
  demosViewedToday: number;
  autoActionsToday: number;
  acenActionsToday: number;
};

export type Health = {
  killSwitchOn: boolean;
  demoMode: boolean;
  inboxes: Inbox[];
  failedJobs: number;
};

export type CallLog = {
  id: string;
  business_id: string;
  scheduled_at: string | null;
  outcome: string | null;
  notes: string | null;
  created_at: string;
};
