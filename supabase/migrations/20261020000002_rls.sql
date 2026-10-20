-- Row-level security (spec: RLS on every table; clients only ever see their own data).

-- Which client record belongs to the signed-in user (null for owner/anon).
create or replace function public.my_client_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select id from public.clients where auth_user_id = (select auth.uid());
$$;

create or replace function public.my_business_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select business_id from public.clients where auth_user_id = (select auth.uid());
$$;

-- Turn on RLS everywhere and give the owner full access.
do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'businesses', 'business_assessment', 'pricing_feedback', 'contacts', 'pipeline',
    'demo_sites', 'sending_inboxes', 'messages', 'reply_library', 'style_rules', 'payment_links',
    'calls', 'clients', 'client_costs', 'edit_requests', 'project_progress', 'client_uploads',
    'assistant_conversations', 'assistant_messages', 'tasks', 'suppression', 'settings',
    'activity_log', 'job_runs'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy owner_all on public.%I for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()))',
      t
    );
  end loop;
end;
$$;

-- profiles: everyone can read their own row (needed to know their role).
create policy self_read on public.profiles for select to authenticated
  using (id = (select auth.uid()));

-- Client: their own client record and business details.
create policy client_read_own on public.clients for select to authenticated
  using (auth_user_id = (select auth.uid()));

create policy client_read_own on public.businesses for select to authenticated
  using (id = (select public.my_business_id()));

-- Clients never write to businesses directly. Onboarding edits go through server code that
-- validates and only touches client-editable fields.

-- Client: progress tracker (read only).
create policy client_read_own on public.project_progress for select to authenticated
  using (client_id = (select public.my_client_id()));

-- Client: edit requests (read + create their own; status is changed by the system).
create policy client_read_own on public.edit_requests for select to authenticated
  using (client_id = (select public.my_client_id()));
create policy client_insert_own on public.edit_requests for insert to authenticated
  with check (client_id = (select public.my_client_id()) and status = 'received');

-- Client: uploads.
create policy client_read_own on public.client_uploads for select to authenticated
  using (client_id = (select public.my_client_id()));
create policy client_insert_own on public.client_uploads for insert to authenticated
  with check (client_id = (select public.my_client_id()));

-- Client: portal message thread with the agency only (never email/call internals).
create policy client_read_own on public.messages for select to authenticated
  using (
    channel = 'portal'
    and business_id = (select public.my_business_id())
    and status in ('sent', 'delivered', 'received')
  );
create policy client_insert_own on public.messages for insert to authenticated
  with check (
    channel = 'portal' and direction = 'inbound' and written_by = 'client'
    and status = 'received' and auto_sent = false
    and business_id = (select public.my_business_id())
  );

-- Storage bucket for client uploads: path must start with the client's own id.
insert into storage.buckets (id, name, public) values ('client-uploads', 'client-uploads', false)
  on conflict (id) do nothing;

create policy client_uploads_rw on storage.objects for all to authenticated
  using (
    bucket_id = 'client-uploads'
    and ((select public.is_owner()) or (storage.foldername(name))[1] = (select public.my_client_id())::text)
  )
  with check (
    bucket_id = 'client-uploads'
    and ((select public.is_owner()) or (storage.foldername(name))[1] = (select public.my_client_id())::text)
  );

-- Helper functions are only for signed-in users.
revoke execute on function public.my_client_id() from public, anon;
revoke execute on function public.my_business_id() from public, anon;
revoke execute on function public.is_owner() from public, anon;
grant execute on function public.my_client_id() to authenticated;
grant execute on function public.my_business_id() to authenticated;
grant execute on function public.is_owner() to authenticated;

-- Live updates for the CRM.
alter publication supabase_realtime add table public.pipeline, public.messages, public.tasks, public.activity_log,
  public.edit_requests, public.project_progress;
