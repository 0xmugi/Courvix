# Courvix

Interactive sports club management demo, built with React 19, TypeScript, Vinext, Tailwind, and Cloudflare D1. The public marketing experience and the operational workspace share the same orange/white Manrope design system.

## Run locally

Requires Node 22.13+.

```sh
npm install
npm run dev
```

Open http://localhost:5173. Click the Courvix logo to view the landing page, or open http://localhost:5173/#landing. The sidebar contains the demo role and club switchers.

On a Windows installation where the npm shim fails, the equivalent development command is `node scripts/run-framework.mjs dev` after dependencies are installed.

## Implemented demo workflows

- Four role-specific experiences; Batam Basketball Club (520 seeded members) and Rally Badminton Academy (64).
- Dashboard totals calculated from records; team cards and roster counts.
- Searchable, paginated member lists, member detail tabs, create/edit/archive, duplicate-email validation.
- Coaches, training, competitions, membership plans, announcements, textual documents, support tickets, and custom-project records.
- Month/agenda calendar, schedule creation and exact-slot conflict checks.
- Coach attendance writes, paginated rosters, personal member attendance history.
- Invoice creation, simulation of successful/failed payments, full refund confirmation, immutable historical fees on the server.
- Default fee 0.5%, minimum Rp1,000, maximum Rp7,500; percentage/fixed policy and demo VA gateway cost are configurable by the platform-administrator experience.
- Finance, cash flow, CSV exports protected against spreadsheet formula injection.
- Club website content editor with preview; landing page service inquiry records.
- Accessible dialogs/tabs/sidebar, reduced-motion support, loading/error/empty states, mutation feedback, duplicate-click lock.
- Private per-signed-in-viewer D1 demo persistence; unauthenticated local preview falls back to clearly labeled browser-local data.
- API origin checks, owner scoping, schema validation, optimistic concurrency, server fee calculation, invoice/member club validation, and protected paid-payment history.

## Important scope boundaries

This is a demonstration workspace, **not a production financial or multi-tenant club service**. The role switcher deliberately allows the owner to explore every simulated role. It is not authentication or server-enforced staff RBAC. Private D1 state is scoped to the signed-in Sites viewer, not shared between real coach/member accounts.

No real money moves. Payment success is a demo command, not a verified provider webhook. Merchant onboarding, a live provider adapter, signed webhooks, reconciliation, split settlement, partial refunds, rate limiting, production account invitations/MFA, and organization-specific server authorization still need implementation before real use.

Documents are text records, not private file uploads. No email/WhatsApp is sent. Custom domains, real subscriptions, CSV import, invoice PDFs, advanced sport-specific scoring, facility/equipment management, configurable fee overrides per club, and full reporting date filters are not enabled. Calendar covers the September 2026 demo period. Schedule conflict detection currently matches exact date/time/team/venue; overlapping durations are a production follow-up.

The D1 snapshot model is suitable for an isolated demo. Production should replace it with normalized tenant-owned entities, paginated queries, immutable ledger events, and narrowly scoped server commands. Do not upload real personal or payment information to this demo.

## Storage and local database

The Sites manifest declares D1 binding `DB`. The schema and generated migration are in `db/schema.ts` and `drizzle/`. In hosted private Sites, the dispatcher provides authenticated viewer identity; the API never reads a user identity from request JSON.

For local backend testing after a build:

```sh
node node_modules/wrangler/bin/wrangler.js d1 execute DB --local --persist-to .wrangler/state --config dist/server/wrangler.json --file drizzle/0000_lively_the_phantom.sql
```

The starter provides local-only mock sign-in at `/signin-with-chatgpt?return_to=/`; this is not production password authentication. Real hosted authentication is provided by Sites. Local mock identity headers are stripped from browser requests before the mock session is resolved.

## Verification

```sh
node node_modules/typescript/bin/tsc --noEmit
node --experimental-strip-types tests/domain.test.mjs
node tests/api-smoke.mjs
node scripts/run-framework.mjs build
```

The API smoke test requires the local server and migrated local D1 database. It adds one explicitly named synthetic test invoice per run. It checks unauthorized access, cross-origin mutation rejection, schema validation, fee recalculation, stale-write conflict, immutable history, and cross-club references.

Browser checks completed: add member, search without focus loss, successful payment and outstanding-count update, coach/team filtering, attendance reflected in the member view, role navigation, and valid/invalid WebMCP navigation. Responsive verification is documented in the task delivery.

## Production migration

Keep the UI and domain concepts; implement actual `organizations`, `organization_memberships`, `role_assignments`, `teams`, `members`, `sessions`, `attendance`, `invoices`, `payment_attempts`, `gateway_events`, `ledger_entries`, `refunds`, and `audit_events`. Resolve tenant and role from a verified session for every query and mutation. Never move the demo role selector or snapshot-write API into the real financial environment.
