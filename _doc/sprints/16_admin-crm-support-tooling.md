# Sprint 16: Admin Console — CRM & Support Tooling

**Goal:** Staff can find and manage members, perform audited loyalty/account adjustments, build segments, and run support actions (lookup, read-only impersonation, canned actions) — the human-facing operational core of the back-office.

**User flows included:**
- Member directory & profile (PRD §14.7, §14.19): search by phone/name/member ID; profile view (name, email, gender, birthday, photo, masked contact, country, marketing-consent, saved addresses, saved-payment metadata — no PAN); loyalty panel (tier, Bowls rolling-365d, per-batch crystals + expiry, lifetime earned/redeemed/expired); activity timeline (orders, redemptions, referrals, notifications, tickets).
- Privileged member adjustments (audited, reason required): grant/deduct Sugar Crystals, adjust Bowls/tier, issue goodwill voucher, re-issue welcome rewards, suspend, merge duplicates.
- Segmentation builder: by tier, spend, recency/frequency, location, consent — feeding campaigns (Sprint 18) and vouchers (Sprint 15).
- Support / CS tooling (PRD §14.17): member & order lookup, read-only impersonate-view of a member's app state, canned actions (resend receipt, re-trigger notification, goodwill voucher/crystals within limits), Help/FAQ awareness.

**Depends on:** Sprint 7 (loyalty state these adjust), Sprint 12 (RBAC/audit/console shell). Account-deletion/export handled in Sprint 18 (Compliance).

**Key implementation areas:**
- **Database:** `Segment` (criteria + materialized membership), support `Ticket`/canned-action log; reuse `Member`/`AuditLog`.
- **Service (SRP/DIP):** `MemberAdminService` (directory + audited adjustments via `LoyaltyService` from Sprint 7 — reason required, maker-checker per §14.19 matrix above thresholds); `SegmentService` (criteria → member set, reused by Sprints 15/18); `SupportService` (read-only impersonation snapshot, canned actions bounded by `GoodwillPolicy` caps). Impersonation is strictly read-only — no mutations through it.
- **API (`app/api/routes.ts`):** member search/detail, adjustment endpoints, segment CRUD, support lookup/impersonate/canned-action; `permissionGuard` (Support limited / Loyalty Manager / Super Admin) + audited.
- **UI (`app/routes/console.*`):** member directory + filters (§14.19), member detail (profile + loyalty panel + timeline), adjustment dialogs (reason + approval), segment builder, support console (lookup, impersonate-view, canned actions).
- **States:** approval-pending/maker-checker queue, cap-reached on goodwill, empty search.

**Verification steps:**
1. Member search by phone/name/ID returns correct profile; contact masked; no raw card data shown.
2. Loyalty adjustments require a reason, enforce role, route to dual-approval above threshold, and audit-log before/after.
3. Segment builder produces the expected member set (e.g., Tang Pioneer + active last 30d) usable by campaigns/vouchers.
4. Support impersonate-view is read-only — shows member's app state but cannot mutate.
5. Canned goodwill actions respect per-agent caps; exceeding cap blocked with reason; all logged.

**Test flow:**
1. As Support → search a member by phone → open profile → see tier, Bowls, crystal batches, timeline; contact masked.
2. As Loyalty Manager → grant 50 crystals with reason → above-threshold → dual-approval → approver confirms → balance updates; audit logged.
3. Build segment "Tang Master, ordered last 14d" → save → confirm member count.
4. As Support → impersonate-view a member → attempt a mutation → not allowed (read-only).
5. Issue a goodwill voucher within cap → succeeds; attempt beyond cap → blocked.
6. Suspend then merge a duplicate member → audit entries recorded.
