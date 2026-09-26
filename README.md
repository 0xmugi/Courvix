# Courvix

Interactive sports club management demo, built with React 19, TypeScript, Vinext, Tailwind, and Cloudflare D1. The public marketing experience and the operational workspace share the same orange/white Manrope design system.

## Run locally

Requires Node 22.13+.

```sh
npm install
npm run dev
```

Open http://localhost:5173 for the landing page or /login for the demo identity picker. The dashboard has no role or club switchers. If port 5173 is occupied, use `node scripts/run-framework.mjs dev --port 5181`.

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
- Private per-signed-in-viewer D1 demo persistence; server-scoped demo sessions gate workspace access. Localhost uses a separate local-preview owner.
- API origin checks, owner scoping, schema validation, optimistic concurrency, server fee calculation, invoice/member club validation, and protected paid-payment history.

## Important scope boundaries

This is a demonstration workspace, **not a production financial or multi-tenant club service**. The login page deliberately allows the owner to select a simulated identity. Server-side session checks enforce that identity’s club and role until logout. The picker is not production user authentication. Private D1 state is scoped to the signed-in Sites viewer, not shared between real coach/member accounts.

No real money moves. Payment success is a demo command, not a verified provider webhook. Merchant onboarding, a live provider adapter, signed webhooks, reconciliation, split settlement, partial refunds, rate limiting, verified account invitations/MFA, and a full production authorization review still need implementation before real use.

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

The API smoke test requires the local server and migrated local D1 database. It creates synthetic clubs, identities, and invitations in the local preview. It verifies session gates, club-scoped reads and writes, platform-fee permissions, valid admin writes, coach scope, registration, subscription activation, revocation, email matching, invitation replay rejection, and logout.

Browser checks completed: add member, search without focus loss, successful payment and outstanding-count update, coach/team filtering, attendance reflected in the member view, role navigation, and valid/invalid WebMCP navigation. Responsive verification is documented in the task delivery.

## Production migration

Keep the UI and domain concepts; implement actual `organizations`, `organization_memberships`, `role_assignments`, `teams`, `members`, `sessions`, `attendance`, `invoices`, `payment_attempts`, `gateway_events`, `ledger_entries`, `refunds`, and `audit_events`. Resolve tenant and role from a verified session for every query and mutation. Never move the demo role selector or snapshot-write API into the real financial environment.
## Public website

Marketing routes: `/`, `/platform`, `/sports`, `/pricing`, `/custom`, `/contact`. The existing demonstration workspace is available at `/dashboard`. Legacy `#app` and marketing hashes redirect to their routes. Public pages use self-hosted Barlow Condensed and Manrope, one optimized WebP sports visual, responsive layouts, and reduced-motion support.

The pricing page contains illustrative packages and an interactive fee calculator. The contact form stores demonstration project briefs in the existing demo workspace; it does not send email or notify staff. Real payment gateway activation and production role enforcement remain outside this demo.

## Demo accounts and club onboarding

The demonstration now requires a session from `/login`. This is an explicit identity simulator within each private Sites viewer's sandbox, not a production password or email login. Public demo account selection remains intentional. Real multi-user authentication, email verification, subscription webhooks, and delivery of invitations are not connected.

`/register` creates a club, its Admin identity, a first training group, and a 14-day trial. `/join` accepts a unique, email-bound, one-use invitation expiring after seven days. Admin Settings creates/revokes invitations and simulates subscription activation. Existing manually entered members are linked by club and email when joining.

Sessions use opaque random HttpOnly cookies (Secure on HTTPS), expire after 24 hours, and are bound to the private Sites viewer. `/api/demo-state` scopes reads and merges authorized writes on the server. Other clubs' data, private session records, and invitation secrets are excluded from workspace responses. Club Admins cannot change platform fees. Coach access is limited to their team; Member invoices and attendance are personal. Concurrent edits use revision checks. Trial/paid-demo expiry blocks workspace writes until a simulated renewal. No production security guarantee is implied by the demo account picker.

Run `COURVIX_TEST_URL=http://localhost:5181 node tests/access-smoke.mjs` against a local preview for onboarding and access regression checks. On PowerShell set `$env:COURVIX_TEST_URL` separately. Tests create example clubs only in the local preview database. Legacy browser-local demo snapshots are no longer used for authenticated workspaces.

Public anonymous visitors receive an opaque HttpOnly guest workspace cookie (30 days). Their demo state is independent per browser; signed-in Sites viewers continue to use their viewer-scoped workspace. A guest identity is a bearer capability for a demo sandbox, not verified user authentication. Clearing browser cookies starts a new sandbox. Invitations can be explored within the same visitor sandbox; sharing between real users is not implemented.


### Club operations and pricing update
- Subscription assumption: Starter IDR 250,000/month; Club Pro IDR 500,000/month with assisted onboarding/support. Both expose all demo operational modules.
- New successful member payments add IDR 10,000 to the club dues. Gateway is IDR 0 in the demo, not a provider quote. Historical paid amounts remain unchanged.
- Membership packages belong to clubs and generate one invoice per member/period. Payments is an immutable server-created transaction ledger.
- Member/coach profile data is separate from general roster responses. Profile documents are authenticated downloads in D1 `profile_files` (migration 0001); only the subject and their club admin can access. PDF/JPEG/PNG up to 2 MB, 12 files per profile. Use dummy documents only: the identity picker is a demo, not production authentication.
- Schedule includes a team, coach, date/time range and venue. Attendance validates the session roster; Training references a schedule; Competitions tracks team, coach, category, organizer, registration deadline and result.
- Verification: `node tests/professional-smoke.mjs` checks profiles/documents, denied cross-user access, roster mismatch, duplicate billing, authoritative fees, and ledger immutability. Apply `drizzle/0001_profile_files.sql` to local D1 before running this test.
