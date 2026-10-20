# Storefront and operations overhaul

This change strengthens the existing Next.js/Supabase shop and refreshes the customer and staff interfaces. It does not establish an uptime SLA, payment processing, email delivery, or a compliance certification.

## Inventory and checkout

New public orders are requests: they do not decrement inventory. Staff confirmation locks products in a deterministic order, verifies available stock, and reserves all items in one transaction. If any item cannot be reserved, the entire confirmation fails and the order stays pending. Pre-orders do not decrement stock. Cancellation restores only inventory that was actually reserved. Existing reservations created before this release retain their existing behavior and are not decremented twice on confirmation.

Product edit forms submit their original database snapshot. Saving a stale form after an intervening inventory or content change fails rather than silently overwriting the newer state. Blog edits use the same guard. Analytics-only product/blog view increments do not invalidate apply or undo; price, stock and content changes still do.

Before submitting, the browser saves the exact pending order body and its idempotency key in session storage. Reloading the same tab restores a recovery action that replays that original submission before any new stock refresh or order. Success clears the saved request. Explicit validation/conflict rejections permit a revised request; uncertain network/service failures retain the recovery key. Storage must be available before sending. Session storage contains the pending customer details and lasts for that browser tab; deliberately closing or clearing the tab can remove recovery information. There is no public order lookup by email or customer name.

Newsletter submissions now have global, trusted-source and per-address budgets, plus a streamed 2 KB body limit. Checkout JSON is bounded to 30 KB during streaming. On Vercel, source identity uses its platform-controlled `x-vercel-forwarded-for` header. Other hosts use one conservative shared fallback budget unless a trusted adapter is implemented. The newsletter stores consent; confirmation emails and a marketing delivery service remain separate integrations.

## Interface changes

The storefront has a new navy/lime identity, persistent search, a mobile navigation dialog, a dedicated screen-compatibility entry point, and redesigned category and product cards. The homepage continues to use CMS hero copy, imagery, section visibility and ordering. The decorative repair-parts illustration is code-native and does not represent an actual product photograph. Uploaded product photos remain authoritative.

The staff workspace has contextual navigation, visible access role, a revised order/inventory dashboard, failure states that do not invent zero totals, and real monthly revenue/order-pipeline analytics computed in PostgreSQL. Shared typography, cards, forms and tables carry the design across existing screens. Skip navigation, focus visibility, reduced-motion preferences and existing dialog focus handling are retained or improved.

## Database rollout

For an existing installation with the October 8 migrations applied, run:

`supabase/migrations/20261020090000_enterprise_inventory_and_conflicts.sql`

Apply this migration **before** deploying the new application: the new analytics screen calls `get_commerce_analytics`. The migration replaces the shared checkout, order-status and preview functions, so it must be applied once through the normal migration workflow. It also scopes the legacy `Admin full…` policies to authenticated users, fixing anonymous catalogue reads without granting anonymous access to the admin-role helper.

For a fresh installation, execute `supabase_sql_editor.sql` followed by every SQL file in `supabase/migrations` in chronological order. The complete bootstrap already includes the CMS and AI change-request tables. Do not replay the bootstrap over a live hardened installation as an update mechanism; the migrations are the update path.

Existing application environment keys remain unchanged.

After migration, verify anonymous active-product reads, hidden-product isolation, admin sign-in, a disposable pending request, confirmation and cancellation, stale product-edit rejection, and apply/undo after an unrelated view increment. Check monthly totals against delivered orders. Perform these checks in staging before production.

## Verification

Run `npm run lint -- --max-warnings 0`, `npm run typecheck`, `npm test`, `npm run build` and `npm audit --omit=dev --audit-level=high`. CI now includes the production build.

The automated suite exercises complete bootstrap SQL with actual triggers/RLS policies and Supabase-style default grants in addition to the isolated checkout/admin transaction tests. It checks anonymous product visibility, denied privileged RPC execution, pending/confirmed stock handling, competing confirmations, cancellation, legacy reservations, stale form rejection, analytics-insensitive conflict handling, persisted pending checkout data, streamed body limits and source-based newsletter throttling. PGlite runs statements serially; production PostgreSQL lock scheduling and multi-process load still need staging/load testing.

Visual review uses disposable local fixtures, not production data. Local test fixture services and browser binaries are outside the repository.

## Operational follow-through

Production Supabase state, Vercel configuration and live deployment are not automatically changed by this source PR. Back up the database before rollout and retain a rollback plan for both code and SQL. Restoring the old code alone does not restore old database function behavior. If this migration must be reversed, use a reviewed compensating migration and reconcile reservations created since rollout; do not drop live orders or reset stock blindly.

Before treating this installation as an enterprise service, configure production monitoring, backups with restore drills, deployment ownership, outbound order notifications if desired, newsletter confirmation/delivery, and a measured load target. These require actual service/account configuration and are not claimed as completed by a UI/code upgrade.
