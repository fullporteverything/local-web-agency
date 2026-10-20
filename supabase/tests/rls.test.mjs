// Applies the migrations + seed to an in-memory Postgres with Supabase stand-ins, then checks RLS.
// Run: npm run test:db
import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";
import { readFileSync, readdirSync } from "node:fs";

const repo = new URL("../..", import.meta.url).pathname;
const db = new PGlite({ extensions: { vector } });

await db.exec(`
  create role anon nologin; create role authenticated nologin;
  create schema extensions; create schema auth; create schema storage;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create table storage.buckets (id text primary key, name text, public boolean);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  create function storage.foldername(name text) returns text[] language sql immutable as
    $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
  create publication supabase_realtime;
  grant usage on schema public, auth, storage, extensions to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on sequences to anon, authenticated;
  grant all on storage.objects to authenticated;
`);

const dir = `${repo}/supabase/migrations`;
for (const f of readdirSync(dir).sort()) {
  await db.exec(readFileSync(`${dir}/${f}`, "utf8"));
  console.log("applied", f);
}
await db.exec(readFileSync(`${repo}/supabase/seed.sql`, "utf8"));
console.log("seeded");

// Users: one owner, two clients (florist + groomer).
const OWNER = "11111111-1111-4111-8111-111111111111";
const C1 = "22222222-2222-4222-8222-222222222222";
const C2 = "33333333-3333-4333-8333-333333333333";
await db.exec(`
  insert into auth.users values ('${OWNER}', 'owner@x.test'), ('${C1}', 'c1@x.test'), ('${C2}', 'c2@x.test');
  insert into public.profiles (id, role) values ('${OWNER}', 'owner'), ('${C1}', 'client'), ('${C2}', 'client');
  update public.clients set auth_user_id = '${C1}' where id = '00000000-0000-4000-b000-000000000010';
  update public.clients set auth_user_id = '${C2}' where id = '00000000-0000-4000-b000-000000000012';
  insert into public.messages (business_id, channel, direction, body, status, written_by)
    values ('00000000-0000-4000-a000-000000000010', 'portal', 'outbound', 'florist portal msg', 'sent', 'ai'),
           ('00000000-0000-4000-a000-000000000012', 'portal', 'outbound', 'groomer portal msg', 'sent', 'ai');
`);

let failures = 0;
const check = (label, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? "  " + extra : ""}`);
  if (!ok) failures++;
};

async function as(role, sub, fn) {
  await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub', '${sub ?? ""}', false);`);
  try { return await fn(); } finally { await db.exec(`reset role;`); }
}
const count = async (sql) => Number((await db.query(sql)).rows[0].n);
const tryExec = async (sql) => { try { await db.exec(sql); return true; } catch { return false; } };

// Anonymous visitors see nothing.
await as("anon", null, async () => {
  for (const t of ["businesses", "clients", "messages", "settings", "suppression", "pipeline"]) {
    check(`anon sees 0 rows in ${t}`, (await count(`select count(*) n from public.${t}`)) === 0);
  }
  check("anon cannot call ingest_inbound_lead", !(await tryExec(`select public.ingest_inbound_lead('{}'::jsonb)`)));
});

// Owner sees everything.
await as("authenticated", OWNER, async () => {
  check("owner sees all 12 businesses", (await count(`select count(*) n from public.businesses`)) === 12);
  check("owner sees settings", (await count(`select count(*) n from public.settings`)) === 1);
  check("owner can update kill switch", await tryExec(`update public.settings set kill_switch_on = false`));
});

// Client 1 (florist) only sees their own stuff.
await as("authenticated", C1, async () => {
  check("client sees exactly 1 client row", (await count(`select count(*) n from public.clients`)) === 1);
  check("client sees only own business", (await count(`select count(*) n from public.businesses`)) === 1);
  check("client sees own progress only", (await count(`select count(*) n from public.project_progress where client_id <> '00000000-0000-4000-b000-000000000010'`)) === 0);
  check("client sees own portal messages only", (await count(`select count(*) n from public.messages`)) === 1);
  check("client cannot see pipeline", (await count(`select count(*) n from public.pipeline`)) === 0);
  check("client cannot see assessments/pricing", (await count(`select count(*) n from public.business_assessment`)) === 0);
  check("client cannot see settings", (await count(`select count(*) n from public.settings`)) === 0);
  check("client cannot see suppression", (await count(`select count(*) n from public.suppression`)) === 0);
  check("client can create own edit request",
    await tryExec(`insert into public.edit_requests (client_id, request_text) values ('00000000-0000-4000-b000-000000000010', 'new photo')`));
  check("client CANNOT create edit request for another client",
    !(await tryExec(`insert into public.edit_requests (client_id, request_text) values ('00000000-0000-4000-b000-000000000012', 'hack')`)));
  check("client CANNOT mark own edit as live",
    !(await tryExec(`insert into public.edit_requests (client_id, request_text, status) values ('00000000-0000-4000-b000-000000000010', 'x', 'live')`)));
  check("client CANNOT post as AI in portal",
    !(await tryExec(`insert into public.messages (business_id, channel, direction, body, status, written_by) values ('00000000-0000-4000-a000-000000000010', 'portal', 'outbound', 'x', 'sent', 'ai')`)));
  check("client can post own portal message",
    await tryExec(`insert into public.messages (business_id, channel, direction, body, status, written_by) values ('00000000-0000-4000-a000-000000000010', 'portal', 'inbound', 'hi', 'received', 'client')`));
  check("client CANNOT update their price",
    (await db.query(`update public.clients set monthly_price = 1 returning id`)).rows.length === 0);
  check("client CANNOT update a business", (await db.query(`update public.businesses set name = 'x' returning id`)).rows.length === 0);
  check("client CANNOT make themselves owner",
    !(await tryExec(`insert into public.profiles (id, role) values ('${C1}', 'owner')`)) &&
    (await db.query(`update public.profiles set role = 'owner' returning id`)).rows.length === 0);
  check("client can upload into own folder",
    await tryExec(`insert into storage.objects (bucket_id, name) values ('client-uploads', '00000000-0000-4000-b000-000000000010/logo.png')`));
  check("client CANNOT upload into another client's folder",
    !(await tryExec(`insert into storage.objects (bucket_id, name) values ('client-uploads', '00000000-0000-4000-b000-000000000012/x.png')`)));
});

// Client 2 can't see client 1's data.
await as("authenticated", C2, async () => {
  check("client 2 cannot see florist's edit requests", (await count(`select count(*) n from public.edit_requests`)) === 0);
  check("client 2 cannot see florist's uploads", (await count(`select count(*) n from storage.objects`)) === 0);
  check("client 2 sees only own business", (await count(`select count(*) n from public.businesses where id <> '00000000-0000-4000-a000-000000000012'`)) === 0);
});

// Hard pricing rule enforced by the database.
check("DB rejects a family business priced over $500",
  !(await tryExec(`update public.business_assessment set setup_price = 600 where business_id = '00000000-0000-4000-a000-000000000001'`)));
check("DB rejects family monthly over $100",
  !(await tryExec(`update public.business_assessment set monthly_price = 120 where business_id = '00000000-0000-4000-a000-000000000001'`)));
check("settings cannot raise family ceiling above $500",
  !(await tryExec(`update public.settings set family_setup_ceiling = 700`)));

// Inbound form ingestion (service role path).
const id = (await db.query(`select public.ingest_inbound_lead('{"kind":"free_preview","name":"Pat","business_name":"Pat''s Tacos","email":"Pat@Example.com","city":"Greensboro","current_url":"facebook.com/pats","message":"we sell tacos"}'::jsonb) id`)).rows[0].id;
const lead = (await db.query(`select b.web_presence, b.facebook_url, b.email, p.stage, p.lead_score from public.businesses b join public.pipeline p on p.business_id = b.id where b.id = '${id}'`)).rows[0];
check("inbound lead created as facebook_only, new, score 85",
  lead.web_presence === "facebook_only" && lead.stage === "new" && lead.lead_score === 85 && lead.email === "pat@example.com", JSON.stringify(lead));
const id2 = (await db.query(`select public.ingest_inbound_lead('{"kind":"contact","name":"Pat","email":"pat@example.com","message":"again"}'::jsonb) id`)).rows[0].id;
check("second submission with same email reuses the lead", id === id2);

// Stage change auto-logged.
await db.exec(`update public.pipeline set stage = 'qualified' where business_id = '${id}'`);
check("stage change is logged automatically",
  (await count(`select count(*) n from public.activity_log where business_id = '${id}' and action = 'stage_changed'`)) === 1);

await db.exec(`insert into public.suppression (email, reason) values ('Stop@Example.com', 'opt_out')`);
check("suppression check is case-insensitive", (await db.query(`select public.is_suppressed('stop@example.com') s`)).rows[0].s === true);
check("unsuppressed email passes", (await db.query(`select public.is_suppressed('ok@example.com') s`)).rows[0].s === false);

console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
