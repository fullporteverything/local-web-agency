# Local Web Agency

An automated local web agency: public agency website, owner CRM, and client portal in one Next.js app,
with Convex as the database. The full plan lives in the master spec (v6). This README tracks build progress and setup.

## Build progress (spec Section 17)

| Step | What | Status |
|---|---|---|
| 1 | Connection check | Done. Waiting on Workspace inbox, Places, Claude, booking link |
| 2 | Public agency website | Live at https://local-web-agency-one.vercel.app |
| 3 | Database, access rules, seed data | Done on Convex, with security tests. Needs a Convex cloud project for production |
| 4 | CRM UI (Command Center, Pipeline, Inbox, Call Queue, Lead detail, PWA) | Done at `/admin`. Production shows demo data until Convex is connected |
| 5–14 | Lead finder → pricing → demos → outreach → replies → Stripe → portal → assistant → analytics → launch | Not started |

## Run it on your computer

```bash
npm install
npx convex dev               # first run: log in (or pick "run locally"); keeps running and syncs convex/
node scripts/setup-convex-env.mjs --owner you@example.com --site http://localhost:3000
                             # copy the printed INBOUND_SECRET into .env.local
npx convex run seed:run      # optional: load fake demo data
npm run dev                  # http://localhost:3000, CRM at /admin
```

Without Resend set up, login links are printed in the Convex logs (`npx convex logs`) instead of emailed.
Without Convex at all, the site still works and the CRM shows built-in demo data with every action disabled.

## Checks

```bash
npm run lint
npm test        # Convex security tests: owner/client/visitor access, pricing hard rules, forms
npm run build
```

## Going live on Vercel (one time)

1. Create a project at convex.dev, then Settings → **Deploy key** → generate a production key.
2. Vercel → `local-web-agency` → Settings → Environment Variables: add `CONVEX_DEPLOY_KEY` and `INBOUND_SECRET`.
3. `CONVEX_DEPLOY_KEY=... node scripts/setup-convex-env.mjs --prod --owner you@example.com --site https://your-domain`
4. Redeploy. The build (`npm run build:vercel`) pushes the Convex functions and points the site at them.

## Project layout

```
src/config/brand.ts        Agency name, contact info, tiers, FAQ. Change the name here (or via env vars).
src/app/(site)/            Public agency website
src/app/admin/             Owner CRM (Command Center, Pipeline, Inbox, Calls, Lead detail)
src/app/portal/            Client portal (login so far; full portal in Step 11)
src/app/api/inbound/       Contact + free-preview forms → new lead in the CRM
src/lib/crm/               CRM data access, one-tap actions, demo data, call script
convex/schema.ts           Database tables
convex/lib/access.ts       Who can see what (owner / client / nobody)
convex/crm.ts              Owner-only reads and actions
convex/portal.ts           Client-only reads and actions (own data only)
convex/auth.ts             Magic-link login (owner email + paying clients only)
convex/seed.ts             Fake demo data (example.com emails, 555 numbers)
convex/security.test.ts    Security tests
```

## Things only Acen can do

- [ ] Create a free Convex account (convex.dev, sign in with GitHub) and a project, then share the deploy key
- [ ] Pick the agency name and buy the domain (Vercel → Domains → Buy)
- [ ] Set up Google Workspace on that domain, with one inbox to start
- [ ] Get a mailing address for email footers (PO box or virtual mailbox)
- [ ] Form the LLC and connect a business bank account to Stripe
- [ ] Connect the Stripe integration to this project (Vercel → Integrations → Stripe → add `local-web-agency`)
- [ ] Read and approve the Terms of Service and Privacy Policy drafts (`/terms`, `/privacy`). They are not legal advice.
- [ ] Create API keys when we reach those steps: Google Places, Claude (console.anthropic.com)
- [ ] Make a Cal.com or Calendly booking link
