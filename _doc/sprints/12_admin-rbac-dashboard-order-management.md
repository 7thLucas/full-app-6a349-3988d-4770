# Sprint 12: Admin Console — RBAC, Dashboard & Order Management

**Goal:** Staff can log into a role-gated web console, see KPI/operational dashboards, and run live order operations (board, state overrides, cancel+refund, search) — all audit-logged.

**User flows included:**
- Admin auth + RBAC (PRD §14.1–14.2): role-scoped login; modules permission-gated (view/edit/approve); regional managers scoped to their outlets.
- Dashboard (PRD §14.3): KPI overview (downloads, registered users, % app vs POS, MAU, AOV, app revenue), conversion funnel, loyalty health, operational health; filters (date/country/outlet/mode), compare-to-prior, CSV export, drill-down.
- Order Management (PRD §14.4, §14.19): live order board per outlet (Received → … → Collected/Delivered, color-coded, prep timer, SLA alerts); manual state override (reason); cancel + refund per Rule 10.4; search/filter; third-party orders visible + flagged non-earning.
- Audit logging: every create/update/delete/approve recorded (actor, timestamp, before/after, reason).

**Depends on:** Sprint 5 (orders/transactions), Sprint 6 (status transitions). Builds on the existing `console.*` scaffold (uses base template RBAC per CLAUDE.md).

**Key implementation areas:**
- **Database:** `AdminUser` + `Role`/`Permission` (leverage base template RBAC), `AuditLog` (actor, action, entity, before/after, reason, timestamp), reporting read-models/aggregations.
- **Service (SRP/DIP):** `RbacService` (already in base; map admin roles §14.2); `AuditService` (cross-cutting, applied via middleware/decorator on mutations); `DashboardService` (KPI aggregations from §1.2); `AdminOrderService.overrideState/cancelRefund/resendToPos`. Protect every route with `authGuard` + `permissionGuard` (CLAUDE.md).
- **API (`app/api/routes.ts`):** mount admin order routes (scaffold has `/admin/orders/:id/advance`, `/admin/outlets/:id/orders`); add cancel+refund, search/filter, dashboard endpoints.
- **UI (`app/routes/console.*`):** dashboard with filters + drill-down + CSV; live order board; order detail (items/customizations, breakdown, voucher, payment ref, member, QR, timeline) with override/cancel/refund actions per role.
- **States:** permission-denied (hidden/disabled actions per role); empty board; SLA-breach highlighting.

**Verification steps:**
1. A Store Manager sees only their outlet's orders; an Auditor sees all but cannot mutate; Super Admin sees everything.
2. State override requires a reason and writes an audit-log entry (before/after + actor).
3. Cancel + refund triggers refund to original method per Rule 10.4; peak-hour-proceeded flag surfaced.
4. Dashboard KPIs match underlying records; filters + compare-to-prior + CSV export work; drill-down reaches records.
5. Third-party (GoFood/GrabFood/ShopeeFood) orders shown + flagged non-Sugar-Crystals-earning.

**Test flow:**
1. Log in as Ops Manager → Dashboard shows KPIs; filter by outlet + date; export CSV.
2. Open Order board → an incoming order shows prep timer; let it breach SLA → alert highlights.
3. Override a stuck order to "Ready" with reason → audit log records it.
4. Log in as Auditor → mutation buttons hidden/disabled; audit log viewable.
5. Cancel a paid order → refund initiated; member sees Cancelled + refund note (Sprint 6).
6. Log in as Store Manager for Outlet X → only Outlet X orders visible.
