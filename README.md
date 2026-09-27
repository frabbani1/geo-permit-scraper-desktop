# Columbus Permit Leads

A lead-generation web app for Columbus, Ohio contractors. Pulls building permit data from the city's open data portal, matches each permit to a trade vertical (HVAC, roofing, residential remodel, commercial alteration), and lets subscribed contractors claim leads and see contact info.

$99/month per vertical. One codebase, four verticals — config-driven, not four separate apps.

## Stack

- **Frontend + API:** Next.js, deployed on Vercel
- **Database + auth:** Supabase (Postgres)
- **Nightly data pull:** Python script, run on schedule via GitHub Actions
- **Map:** Leaflet
- **Payments:** Stripe
- **Contact lookup:** a skip-trace API (not yet chosen/integrated)

## Project structure

```
permit-leads/
  web/                  Next.js app (frontend + API routes)
    .env.local           Supabase + Stripe keys (gitignored)
  ingest/                Python data job
    ingest.py             pulls permits, matches to a vertical, upserts to Supabase
    .env.local             Supabase + permits URL (gitignored)
    requirements.txt
  supabase/
    schema.sql             full database schema (reference copy)
  .github/workflows/
    ingest.yml             schedules ingest.py to run nightly
```

## Setup (fresh machine)

1. Install Node 20+, Python 3.12, git, the Stripe CLI.
   - This project specifically needs `python3.12` — not `python3` — since other Python versions may be installed system-wide.
2. Clone the repo, `cd web && npm install`.
3. Create `web/.env.local` with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   SKIPTRACE_API_KEY=
   ```
   Values come from Supabase → Project Settings → API, and Stripe → Developers → API keys.
4. Create `ingest/.env.local` with:
   ```
   SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   PERMITS_URL=https://services1.arcgis.com/9yy6msODkIBzkUXU/arcgis/rest/services/Building_Permits/FeatureServer/0
   ```
5. In Supabase SQL Editor, run `supabase/schema.sql` (creates tables + security rules + the 4 vertical rows).
6. `cd ingest && pip3.12 install -r requirements.txt --break-system-packages`
7. `cd web && npm run dev` → confirm signup/login works at localhost:3000.

## Database

7 tables: `verticals`, `permits`, `profiles`, `subscriptions`, `lead_claims`, `lead_contacts`, `parcels`. Row Level Security is on for all of them — users can only see permits for verticals they're subscribed to, only their own profile/subscriptions/claims.

Each vertical's matching rules (which permit type/subtype counts as a lead) live in its `config` JSON column, not in code — new verticals or filter tweaks are a database update, not a deploy.

### Real Columbus permit categories (confirmed from the city's API)

Columbus doesn't have exact "roofing" or "HVAC" labels. Current best-fit mapping:

| Vertical | B1_PER_TYPE | B1_PER_SUB_TYPE |
|---|---|---|
| HVAC | `1,2,3 Family` / `Residential` | `MEP` |
| Roofing | `1,2,3 Family` / `Residential` | `Repair Replace` |
| Residential remodel | `Residential` | `Major Alteration`, `Addition` |
| Commercial | `Commercial` | `Major Alteration` |

`MEP` covers HVAC, plumbing, and electrical together — not HVAC-specific. `Repair Replace` isn't roofing-specific either. Both need refining later using the `VALUE_DESC` text field (keyword matching) to narrow further.

## Ingest job

`ingest/ingest.py` pulls permits issued in the last 3 days, checks each one against every active vertical's `config.match` rules (in priority order), and upserts matches into the `permits` table. Run manually with:

```bash
cd ingest
python3.12 ingest.py
```

Scheduled nightly via `.github/workflows/ingest.yml` — needs 3 GitHub repo secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PERMITS_URL`) under Settings → Secrets → Actions.

## Status

- [x] Supabase project created, schema + RLS + verticals live
- [x] Real Columbus permit field names and category values confirmed
- [ ] `ingest.py` written, not yet successfully run end to end
- [ ] `.github/workflows/ingest.yml` — folder created, file empty
- [ ] Frontend pages (leads, pricing, profile) — not started
- [ ] Stripe products/prices — account created (test/sandbox mode), products not yet created
- [ ] Skip-trace provider — not yet chosen
- [ ] Deployment — not started

## Notes

- Node must be v26+ (not the shadowed v20 that Homebrew can leave active — check with `which node`).
- Two separate `.env.local` files exist (`web/` and `ingest/`) because each program only reads its own folder's file by default. They duplicate the Supabase URL/service key intentionally — update both if a key is ever rotated.
- Not a lawyer: Do-Not-Call compliance and a Terms of Service/Privacy Policy still need review before charging real customers.