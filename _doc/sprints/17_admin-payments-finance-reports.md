# Sprint 17: Admin Console — Payments/Finance & Reports

**Goal:** Finance staff can view the transaction ledger, process and track refunds, reconcile app vs POS vs gateway, and run/export the full report suite including Sugar Crystals liability — with approval workflow and no raw card data.

**User flows included:**
- Transaction ledger (PRD §14.14, §14.19): per-order payment records (method QRIS / GoPay·OVO·DANA·ShopeePay·LinkAja / Visa·Mastercard), status (authorized/paid/failed/refunded), gateway references — no PAN; full payment trail + refund sub-records.
- Refunds: initiate/track to original method (up to 15 working days, Rule 10.4) with approval workflow + reason.
- Reconciliation: app vs POS vs gateway settlement; mismatch flags; payout/settlement reports.
- Tax/PB1 + revenue reporting: revenue breakdown by outlet/country/period; chargeback/dispute tracking.
- Reports & data export (PRD §14.15): standard reports (sales, product performance, loyalty issuance/redemption/expiry/liability, tier movement, voucher/promo ROI, referral, retention/cohort, operational SLA); custom report builder + saved views + scheduled delivery + CSV/Excel/API export; Sugar Crystals liability report (outstanding-balance valuation).

**Depends on:** Sprint 5 (transactions + RefundService seam), Sprint 7 (loyalty data for liability/issuance reports), Sprint 12 (RBAC/audit/dashboard aggregations). Pulls voucher/referral/tier data from Sprints 8/9.

**Key implementation areas:**
- **Database:** `Reconciliation` records (app/POS/gateway match state), `Report`/saved-view definitions, dispute/chargeback records; reuse `Transaction` from Sprint 5.
- **Service (SRP/DIP):** `FinanceService` composing `ReconciliationService` (match + mismatch flags) and `RefundService` (from Sprint 5, now with approval workflow + reason); `ReportingService` with pluggable `ReportDefinition` interface (Open/Closed — new reports added without touching the engine); `LoyaltyLiabilityReport` reads crystal batches from Sprint 7. Async export for large datasets (§14.18).
- **API (`app/api/routes.ts`):** transaction ledger list/detail, refund initiate/track, reconciliation, report run/schedule/export; `permissionGuard` (Finance / Auditor read-only) + audited; refunds enforce dual-approval where configured (§14.19).
- **UI (`app/routes/console.*`):** transaction ledger + filters (method/status/outlet/settlement/date), refund workflow, reconciliation dashboard with mismatch flags, report builder + scheduler + export.
- **States:** refund approval-pending, export-in-progress (async), reconciliation mismatch highlighting, empty/error.

**Verification steps:**
1. Ledger shows transactions with method/status/gateway ref; no raw card data anywhere.
2. Refund enforces approval + reason, processes to original method, and is tracked through completion (up to 15 working days); reflects on consumer order (Sprint 6).
3. Reconciliation flags app/POS/gateway mismatches; matched settlements clear.
4. Sugar Crystals liability report reconciles to outstanding member balances (Sprint 7); revenue breakdown by outlet/country/period is correct.
5. Reports export to CSV/Excel and can be scheduled; large exports run async; Auditor role is read-only.

**Test flow:**
1. As Finance → open transaction ledger → filter by status=paid, outlet=Grand Indonesia, date range.
2. Refund a paid transaction with reason → dual-approval → approver confirms → status refunded; consumer order shows refund note.
3. Run reconciliation for a settlement date → introduce a deliberate mismatch → flagged; resolve → clears.
4. Run Sugar Crystals liability report → total matches sum of outstanding member crystal batches → export CSV.
5. Build a custom "voucher ROI by campaign" report → save view → schedule daily email.
6. Log in as Auditor → reports viewable, refund actions disabled.
