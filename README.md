# Local Web Agency

An automated local web agency: public agency website, owner CRM, and client portal in one Next.js app.
The full plan lives in the master spec (v6). This README tracks build progress and setup.

## Build progress (spec Section 17)

| Step | What | Status |
|---|---|---|
| 1 | Connection check | Done. Waiting on Workspace inbox, Stripe, Places, Claude, booking link |
| 2 | Public agency website | Built (not deployed yet) |
| 3 | Supabase schema, RLS, seed data | Written and tested locally. Needs a Supabase project |
| 4 | CRM UI (Command Center, Pipeline, Inbox, Call Queue, Lead detail, PWA) | Next |
| 5–14 | Lead finder → pricing → demos → outreach → replies → Stripe → portal → assistant → analytics → launch | Not started |

## Run it on your computer

```bash
npm install
cp .env.example .env.local   # fill in what you have; everything else runs in demo mode
npm run dev                  # open http://localhost:3000
```

Without Supabase keys the site still works, and form submissions are logged instead of saved (demo mode).

## Checks

```bash
npm run lint
npm run test:db   # applies all migrations + seed to an in-memory Postgres and checks every security rule
npm run build
```

## Project layout

```
src/config/brand.ts        Agency name, contact info, tiers, FAQ. Change the name here (or via env vars).
src/app/(site)/            Public agency website
src/app/portal/            Client portal (login only so far)
src/app/api/inbound/       Contact + free-preview forms → new lead in the CRM
supabase/migrations/       Database schema + security rules (RLS)
supabase/seed.sql          Fake demo data (example.com emails, 555 numbers). Never contacts anyone real.
supabase/tests/            Database security tests
```

## Things only Acen can do

- [ ] Pick the agency name and buy the domain (Vercel → Domains → Buy)
- [ ] Set up Google Workspace on that domain, with one inbox to start
- [ ] Get a mailing address for email footers (PO box or virtual mailbox)
- [ ] Form the LLC and connect a business bank account to Stripe
- [ ] Read and approve the Terms of Service and Privacy Policy drafts (`/terms`, `/privacy`). They are not legal advice.
- [ ] Create API keys when we reach those steps: Google Places, Claude (console.anthropic.com), Stripe
- [ ] Make a Cal.com or Calendly booking link
