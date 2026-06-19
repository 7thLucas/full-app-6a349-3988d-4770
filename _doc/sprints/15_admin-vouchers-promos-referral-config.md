# Sprint 15: Admin Console — Vouchers, Promos & Referral Config

**Goal:** Staff can build vouchers/promo codes, configure the welcome offer, and run referral campaigns — with preview-against-cart, scheduling, usage caps, approval workflow, and audit.

**User flows included:**
- Voucher builder (PRD §14.10, §14.19): discount type/value (% / fixed / BOGO), eligible items/categories, minimum spend, validity window, usage caps (per-user / global), fulfillment-mode eligibility (pickup/delivery), stacking = off (one-per-order enforced per Rule 10.3).
- Promo-code management: manual codes + batch/unique-code generation, redemption tracking, expiry.
- Welcome offer config: New User Welcome Rewards set deposited on registration (App users only; Mini Program/H5 excluded; non-extendable expiry per §3) — feeds Sprint 2.
- Campaign scheduling: start/end + priority; preview validation against a sample cart; per-voucher/promo performance reporting (issued, applied, revenue impact, redemption rate).
- Referral program management (PRD §14.11): referrer/referee reward config (free dessert/drink, discount voucher, gift), qualifying condition (referee's first qualifying purchase), anti-abuse limits (per-user caps, self-referral, velocity); referral-code registry, attribution + conversion funnel, fraud detection.

**Depends on:** Sprint 8 (voucher engine + redemption it configures), Sprint 9 (referral program it configures), Sprint 12 (RBAC/audit/console shell). Welcome-offer config feeds Sprint 2.

**Key implementation areas:**
- **Database:** admin-editable `Voucher`/`PromoCode` fields, `Campaign` (schedule, priority, performance counters), `WelcomeOfferConfig`, `ReferralCampaignConfig` (reward values, qualifying condition, anti-abuse caps).
- **Service (SRP/DIP):** `VoucherAdminService` (CRUD + preview reuses the SAME `VoucherEngine.validate/apply` from Sprint 8 — admin preview == consumer checkout result, no duplicate rules); `ReferralConfigService` (writes `ReferralRewardPolicy` + `AntiAbusePolicy` that Sprint 9 READS — DIP); approval workflow for high-value/global vouchers (§14.19 matrix).
- **API (`app/api/routes.ts`):** voucher/promo CRUD + batch generation, welcome-offer config, referral-campaign config, performance/funnel reports; `permissionGuard` (Marketing) + audited; high-value/global voucher creation requires dual-approval.
- **UI (`app/routes/console.*`):** voucher builder form, promo-code batch generator, welcome-offer config, campaign scheduler, preview-against-sample-cart panel, referral campaign config + funnel/fraud dashboard.
- **States:** draft/scheduled/active/expired, approval-pending, preview validation errors.

**Verification steps:**
1. Creating a voucher → preview-against-sample-cart matches consumer checkout result (Sprint 8) exactly, including no-stacking replace behavior.
2. High-value or global voucher creation routes to dual-approval before going live.
3. Batch promo-code generation produces unique codes; redemption tracking increments on consumer use; usage caps (per-user/global) enforced consumer-side.
4. Welcome-offer config change reflects in the reward set deposited at registration (Sprint 2); expiry non-extendable.
5. Referral campaign reward value + anti-abuse caps drive consumer referral outcomes (Sprint 9); funnel + fraud detection populate; all mutations audit-logged.

**Test flow:**
1. As Marketing → build "Rp 10.000 off, min Rp 50.000, pickup only" voucher → preview against sample cart → matches; apply a promo code in preview → replaces voucher (no stacking).
2. Submit a high-value global voucher → approval required → approver confirms → goes live.
3. Generate a batch of 100 unique promo codes → redeem one consumer-side → redemption count increments; exceed per-user cap → blocked.
4. Edit welcome-offer set → register a new consumer (Sprint 2) → wallet shows updated welcome rewards.
5. Set referral reward to "free drink voucher" + per-user cap 5 → run a referral (Sprint 9) → referrer gets the configured reward; 6th referral blocked.
6. Verify voucher/referral mutations in the audit log.
