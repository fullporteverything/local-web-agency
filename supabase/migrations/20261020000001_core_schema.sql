-- Core schema for the local web agency (spec Section 4.1).
-- Every table has RLS enabled. Owner (Acen) gets full access; clients only see their own rows;
-- anonymous users get nothing (public forms go through server code using the service role).

create extension if not exists vector with schema extensions;

-- ---------------------------------------------------------------------------
-- Auth roles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'client')),
  display_name text,
  created_at timestamptz not null default now()
);

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'owner');
$$;

-- ---------------------------------------------------------------------------
-- Leads
-- ---------------------------------------------------------------------------
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  address text,
  city text,
  county text,
  lat double precision,
  lng double precision,
  phone text,
  email text,
  email_source text,
  email_confidence numeric(3, 2) check (email_confidence between 0 and 1),
  email_verified_at timestamptz,
  website_url text,
  web_presence text check (web_presence in ('none', 'weak_site', 'facebook_only', 'social_only', 'ok')),
  website_issues text[] not null default '{}',
  facebook_url text,
  instagram_url text,
  google_rating numeric(2, 1),
  review_count integer,
  hours jsonb,
  services text[] not null default '{}',
  photos jsonb not null default '[]',
  reviews jsonb not null default '[]',
  years_in_business integer,
  is_family_business boolean,
  is_chain boolean not null default false,
  source text not null default 'google_places' check (source in ('google_places', 'google_search', 'inbound', 'manual', 'seed')),
  place_id text unique,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index businesses_city_category_idx on public.businesses (city, category);
create index businesses_email_idx on public.businesses (lower(email));

create table public.business_assessment (
  business_id uuid primary key references public.businesses (id) on delete cascade,
  quality_score integer check (quality_score between 0 and 100),
  size_signal text check (size_signal in ('family_solo', 'small', 'established', 'premium')),
  recommended_tier text check (recommended_tier in ('basic', 'premium', 'all_out')),
  setup_price integer check (setup_price >= 0),   -- whole dollars
  monthly_price integer check (monthly_price >= 0),
  reasoning text,
  rules_applied text[] not null default '{}',
  overridden_by_acen boolean not null default false,
  assessed_at timestamptz not null default now(),
  -- Hard rule (spec 5.3.1): family/solo businesses are capped at $500 setup and $100/month.
  constraint family_price_cap check (
    size_signal is distinct from 'family_solo' or (setup_price <= 500 and monthly_price <= 100)
  )
);

create table public.pricing_feedback (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  ai_setup_price integer,
  ai_monthly_price integer,
  acen_setup_price integer,
  acen_monthly_price integer,
  acen_note text,
  created_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text,
  role text,
  email text,
  phone text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index contacts_business_idx on public.contacts (business_id);

create table public.pipeline (
  business_id uuid primary key references public.businesses (id) on delete cascade,
  stage text not null default 'new' check (stage in (
    'new', 'qualified', 'priced', 'demo_built', 'emailed', 'follow_up_1', 'follow_up_2', 'replied',
    'payment_clicked', 'needs_call', 'call_booked', 'paid', 'onboarding', 'building', 'live',
    'retainer_active', 'canceled', 'site_removed', 'lost', 'later', 'suppressed'
  )),
  stage_changed_at timestamptz not null default now(),
  next_action text,
  next_action_at timestamptz,
  owner text not null default 'auto' check (owner in ('auto', 'acen')),
  lead_score integer not null default 50 check (lead_score between 0 and 100),
  lost_reason text,
  resurface_at timestamptz,
  updated_at timestamptz not null default now()
);
create index pipeline_stage_score_idx on public.pipeline (stage, lead_score desc);
create index pipeline_needs_acen_idx on public.pipeline (owner, next_action_at) where owner = 'acen';

create table public.demo_sites (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  tier_shown text check (tier_shown in ('basic', 'premium', 'all_out')),
  vercel_project_id text,
  url text,
  screenshot_url text,
  built_at timestamptz not null default now(),
  qa_passed boolean,
  qa_report jsonb,
  attempt integer not null default 1,
  views integer not null default 0,
  unique_views integer not null default 0,
  last_viewed_at timestamptz,
  is_current boolean not null default true
);
create index demo_sites_business_idx on public.demo_sites (business_id) where is_current;

-- ---------------------------------------------------------------------------
-- Messaging + learning
-- ---------------------------------------------------------------------------
create table public.sending_inboxes (
  id uuid primary key default gen_random_uuid(),
  address text not null unique,
  domain text not null,
  display_name text,
  daily_cap integer not null default 15,
  sent_today integer not null default 0,
  warmup_day integer not null default 0,
  health text not null default 'good' check (health in ('good', 'watch', 'paused')),
  paused_reason text,
  bounce_rate numeric(5, 4) not null default 0,
  complaint_count integer not null default 0,
  open_rate_7d numeric(5, 4),
  oauth_connected boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id text,
  gmail_message_id text unique,
  business_id uuid references public.businesses (id) on delete cascade,
  channel text not null check (channel in ('email', 'portal', 'call', 'web_form')),
  direction text not null check (direction in ('inbound', 'outbound')),
  subject text,
  body text,
  status text not null default 'draft' check (status in (
    'draft', 'pending_approval', 'scheduled', 'sent', 'delivered', 'bounced', 'failed', 'received', 'discarded'
  )),
  ai_classification text,
  ai_confidence numeric(3, 2),
  ai_reasoning text,
  auto_sent boolean not null default false,
  written_by text check (written_by in ('ai', 'acen', 'ai_edited_by_acen', 'client', 'lead')),
  sent_from_inbox uuid references public.sending_inboxes (id),
  scheduled_for timestamptz,
  sent_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index messages_business_idx on public.messages (business_id, created_at desc);
create index messages_thread_idx on public.messages (thread_id);
create index messages_pending_idx on public.messages (status) where status = 'pending_approval';

create table public.reply_library (
  id uuid primary key default gen_random_uuid(),
  situation_type text not null,
  inbound_text text,
  response_text text not null,
  ai_draft_text text,
  source text not null check (source in ('acen_written', 'acen_edited', 'ai_approved', 'seed')),
  source_message_id uuid references public.messages (id) on delete set null,
  outcome text check (outcome in ('paid', 'booked', 'replied', 'no_reply', 'unsubscribed')),
  quality_rating integer check (quality_rating between 1 and 5),
  embedding extensions.vector(1024),
  created_at timestamptz not null default now()
);
create index reply_library_embedding_idx on public.reply_library
  using hnsw (embedding extensions.vector_cosine_ops);

create table public.style_rules (
  id uuid primary key default gen_random_uuid(),
  rule_text text not null,
  kind text not null default 'style' check (kind in ('style', 'pricing')),
  scope text, -- e.g. a category like 'roofing', or null for everyone
  learned_from_message_id uuid references public.messages (id) on delete set null,
  source text not null default 'learned' check (source in ('learned', 'instruction')),
  status text not null default 'proposed' check (status in ('proposed', 'active', 'disabled')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Sales + clients
-- ---------------------------------------------------------------------------
create table public.payment_links (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  tier text not null check (tier in ('basic', 'premium', 'all_out')),
  setup_price integer not null,
  monthly_price integer not null,
  stripe_session_id text,
  stripe_session_url text,
  created_at timestamptz not null default now(),
  clicked_at timestamptz,
  paid_at timestamptz
);
create index payment_links_business_idx on public.payment_links (business_id);

create table public.calls (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  scheduled_at timestamptz,
  outcome text check (outcome in (
    'no_answer', 'voicemail', 'interested_send_link', 'wants_payment_link', 'call_back_later', 'not_interested', 'paid', 'wrong_number'
  )),
  notes text,
  duration_seconds integer,
  follow_up_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses (id) on delete cascade,
  auth_user_id uuid unique references auth.users (id) on delete set null,
  tier text not null check (tier in ('basic', 'premium', 'all_out')),
  setup_price integer not null,
  monthly_price integer not null,
  stripe_customer_id text unique,
  subscription_id text unique,
  retainer_status text not null default 'pending' check (retainer_status in (
    'pending', 'active', 'past_due', 'canceling', 'canceled'
  )),
  live_url text,
  custom_domain text,
  screenshot_url text,
  showcase_permission boolean not null default false,
  start_date date,
  edits_used_this_month integer not null default 0,
  edit_allowance integer not null default 2,
  next_billing_at timestamptz,
  canceled_at timestamptz,
  site_removed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.client_costs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  month date not null,
  hosting numeric(10, 2) not null default 0,
  domain numeric(10, 2) not null default 0,
  email numeric(10, 2) not null default 0,
  ai_usage numeric(10, 2) not null default 0,
  stripe_fees numeric(10, 2) not null default 0,
  other numeric(10, 2) not null default 0,
  total numeric(10, 2) generated always as (hosting + domain + email + ai_usage + stripe_fees + other) stored,
  unique (client_id, month)
);

create table public.edit_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  request_text text not null,
  attachments jsonb not null default '[]',
  category text check (category in ('included', 'extra')),
  quoted_price integer,
  status text not null default 'received' check (status in (
    'received', 'in_progress', 'preview_ready', 'approved', 'live', 'declined'
  )),
  auto_handled boolean not null default false,
  preview_url text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.project_progress (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  step text not null check (step in ('paid', 'details_received', 'building', 'preview_ready', 'approved', 'live')),
  status text not null default 'pending' check (status in ('pending', 'current', 'done')),
  note text,
  updated_at timestamptz not null default now(),
  unique (client_id, step)
);

create table public.client_uploads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  file_path text not null,
  type text not null check (type in ('logo', 'photo', 'doc')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Assistant, ops
-- ---------------------------------------------------------------------------
create table public.assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.assistant_conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'tool')),
  content text,
  tool_calls jsonb,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses (id) on delete cascade,
  kind text not null, -- e.g. 'approve_message', 'call', 'qa_failed', 'price_review', 'job_failed', 'inbox_paused'
  title text not null,
  detail text,       -- one sentence telling Acen exactly what to do
  priority integer not null default 50,
  ref_table text,
  ref_id uuid,
  status text not null default 'open' check (status in ('open', 'done', 'dismissed')),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index tasks_open_idx on public.tasks (status, priority desc) where status = 'open';

-- Checked before EVERY email, text, or call.
create table public.suppression (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  business_id uuid references public.businesses (id) on delete set null,
  reason text not null check (reason in ('opt_out', 'bounce', 'complaint', 'manual', 'not_interested')),
  created_at timestamptz not null default now(),
  check (email is not null or phone is not null)
);
create unique index suppression_email_idx on public.suppression (lower(email)) where email is not null;
create unique index suppression_phone_idx on public.suppression (phone) where phone is not null;

create table public.settings (
  id integer primary key default 1 check (id = 1),
  kill_switch_on boolean not null default false,  -- false = NO real outreach is sent
  demo_mode boolean not null default true,
  business_hours_start time not null default '09:00',
  business_hours_end time not null default '17:00',
  timezone text not null default 'America/New_York',
  send_days integer[] not null default '{1,2,3,4,5}',
  reply_delay_min_minutes integer not null default 5,
  reply_delay_max_minutes integer not null default 40,
  target_cities text[] not null default '{"High Point","Greensboro","Winston-Salem","Charlotte","Raleigh","Durham"}',
  tier_ranges jsonb not null default '{
    "basic":   {"setup_min": 250,  "setup_max": 500,  "monthly_min": 75,  "monthly_max": 100},
    "premium": {"setup_min": 750,  "setup_max": 1000, "monthly_min": 125, "monthly_max": 150},
    "all_out": {"setup_min": 1500, "setup_max": 3000, "monthly_min": 200, "monthly_max": 300}
  }',
  family_setup_ceiling integer not null default 500 check (family_setup_ceiling <= 500),
  family_monthly_ceiling integer not null default 100 check (family_monthly_ceiling <= 100),
  margin_target numeric(4, 3) not null default 0.10,
  confidence_threshold numeric(3, 2) not null default 0.80,
  review_first_n_emails integer not null default 50,
  places_daily_budget_usd numeric(8, 2) not null default 5,
  ai_daily_budget_usd numeric(8, 2) not null default 10,
  signature text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1);

create table public.activity_log (
  id bigint generated always as identity primary key,
  business_id uuid references public.businesses (id) on delete set null,
  actor text not null default 'system' check (actor in ('system', 'ai', 'acen', 'client', 'lead')),
  action text not null,
  detail jsonb not null default '{}',
  needed_acen boolean not null default false,
  created_at timestamptz not null default now()
);
create index activity_log_created_idx on public.activity_log (created_at desc);
create index activity_log_business_idx on public.activity_log (business_id, created_at desc);

create table public.job_runs (
  id bigint generated always as identity primary key,
  job text not null,
  status text not null check (status in ('running', 'ok', 'failed', 'retrying')),
  attempt integer not null default 1,
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);
create index job_runs_job_idx on public.job_runs (job, started_at desc);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger businesses_touch before update on public.businesses
  for each row execute function public.touch_updated_at();
create trigger pipeline_touch before update on public.pipeline
  for each row execute function public.touch_updated_at();
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();
create trigger assistant_conversations_touch before update on public.assistant_conversations
  for each row execute function public.touch_updated_at();

-- Stage changes are timestamped and logged automatically.
create or replace function public.pipeline_stage_changed()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.stage is distinct from old.stage then
    new.stage_changed_at = now();
    insert into public.activity_log (business_id, action, detail)
    values (new.business_id, 'stage_changed', jsonb_build_object('from', old.stage, 'to', new.stage));
  end if;
  return new;
end;
$$;
create trigger pipeline_stage_change before update on public.pipeline
  for each row execute function public.pipeline_stage_changed();

-- ---------------------------------------------------------------------------
-- Helpers used by server code
-- ---------------------------------------------------------------------------
create or replace function public.is_suppressed(p_email text, p_phone text default null)
returns boolean language sql stable set search_path = '' as $$
  select exists (
    select 1 from public.suppression
    where (p_email is not null and lower(email) = lower(p_email))
       or (p_phone is not null and phone = p_phone)
  );
$$;

-- Agency-site form -> inbound lead, atomically. Called by /api/inbound with the service role.
create or replace function public.ingest_inbound_lead(payload jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_business_id uuid;
  v_email text := lower(payload ->> 'email');
  v_url text := nullif(payload ->> 'current_url', '');
  v_is_fb boolean := coalesce(v_url ilike '%facebook.com%', false);
begin
  -- Reuse an existing lead with the same email instead of creating a duplicate.
  select id into v_business_id from public.businesses where lower(email) = v_email limit 1;

  if v_business_id is null then
    insert into public.businesses (name, city, phone, email, email_source, email_confidence,
                                   website_url, facebook_url, web_presence, source)
    values (
      coalesce(nullif(payload ->> 'business_name', ''), payload ->> 'name'),
      nullif(payload ->> 'city', ''),
      nullif(payload ->> 'phone', ''),
      v_email, 'inbound_form', 1.0,
      case when v_is_fb then null else v_url end,
      case when v_is_fb then v_url else null end,
      case when v_url is null then 'none' when v_is_fb then 'facebook_only' else null end,
      'inbound'
    )
    returning id into v_business_id;

    insert into public.contacts (business_id, name, email, phone, is_primary)
    values (v_business_id, payload ->> 'name', v_email, nullif(payload ->> 'phone', ''), true);

    insert into public.pipeline (business_id, stage, lead_score, next_action, next_action_at)
    values (v_business_id, 'new', 85, 'assess_and_build_demo', now());
  else
    update public.pipeline
       set lead_score = greatest(lead_score, 85), next_action = 'reply_to_inbound', next_action_at = now()
     where business_id = v_business_id;
  end if;

  -- People who write to us have opted back in for this conversation; a prior opt-out is
  -- still respected for cold outreach, so flag it for the AI/Acen rather than silently dropping it.
  insert into public.messages (business_id, channel, direction, subject, body, status, written_by, metadata)
  values (
    v_business_id, 'web_form', 'inbound',
    case payload ->> 'kind' when 'free_preview' then 'Free preview request' else 'Contact form' end,
    payload ->> 'message', 'received', 'lead',
    jsonb_build_object('kind', payload ->> 'kind', 'name', payload ->> 'name',
                       'previously_suppressed', public.is_suppressed(v_email, null))
  );

  insert into public.activity_log (business_id, actor, action, detail)
  values (v_business_id, 'lead', 'inbound_form', jsonb_build_object('kind', payload ->> 'kind'));

  return v_business_id;
end;
$$;
revoke execute on function public.ingest_inbound_lead(jsonb) from public, anon, authenticated;

-- Public "Our work" list: live clients who gave permission. Read with the service role.
create view public.public_showcase with (security_invoker = true) as
  select b.name, b.category, b.city, coalesce('https://' || c.custom_domain, c.live_url) as live_url, c.screenshot_url
  from public.clients c
  join public.businesses b on b.id = c.business_id
  where c.showcase_permission and c.retainer_status = 'active' and c.live_url is not null and not b.is_demo;
