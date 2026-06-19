# Sprint 14: Admin Console — Loyalty Engine & Rewards Store Config

**Goal:** Staff can configure the Loyal-Tang engine (Sugar Crystals rules, Bowls, tiers, benefits) and the Rewards Store catalog — driving consumer loyalty math and redemption entirely from config, not code.

**User flows included:**
- Loyalty engine config (PRD §14.8): Sugar Crystals earn rate (per Rp unit) + rounding; exclusions (free / Rp 0 / trial-tasting / special-discount / third-party orders); 365-day per-batch expiry policy + expiry-reminder schedule; Bowls counting rules + counting window; tier thresholds (Seeker 0–9 / Explorer 10–39 / Pioneer 40–79 / Master 80+) + per-tier benefit matrix + tier-metallic theming; tier maintenance/downgrade rules; walk-in QR scan validation (no retroactive points).
- Rewards Store management (PRD §14.9, §14.19): reward catalog CRUD (image, title/description, crystal cost, type voucher/merch/experience, inventory/stock cap, per-user redemption limit, validity, category filters); redemption → voucher mapping + success-modal copy; eligibility (tier-gated, country/outlet scope); enable/disable + scheduling; redemption monitoring (live redemptions, stock-depletion alerts, abuse flags).

**Depends on:** Sprint 7 (loyalty engine — DIP: it reads this config), Sprint 8 (rewards/redemption it configures), Sprint 12 (RBAC/audit/console shell).

**Key implementation areas:**
- **Database:** `LoyaltyConfig` (earn rate, multipliers, rounding, exclusions, expiry window/reminder, Bowls window, tier thresholds + benefits + theming, downgrade policy); admin-editable fields on `Reward`.
- **Service (SRP/DIP):** `LoyaltyConfigService` (writes config that `LoyaltyService`/`TierPolicy`/`EarnRule` from Sprint 7 READ — the DIP payoff: changing a multiplier needs no code change); `RewardAdminService` (catalog CRUD reuses `RewardsService.redeem` rules for preview/eligibility). Config changes versioned + reversible (§14.18).
- **API (`app/api/routes.ts`):** loyalty-config GET/PUT, rewards CRUD, redemption-monitoring endpoints; all `permissionGuard` (Loyalty Manager) + audited; sensitive thresholds may require dual-approval (§14.19).
- **UI (`app/routes/console.*`):** loyalty config forms (earn/exclusions/expiry/Bowls/tiers/benefits/theming), rewards catalog list+detail, redemption monitor dashboard, stock-alert view.
- **States:** config draft/version history, validation, approval-pending, low-stock alerts.

**Verification steps:**
1. Changing a tier earn multiplier or threshold changes consumer loyalty math (Sprint 7) with NO code change (config-driven); reflected on next completed order.
2. Editing exclusions (e.g., add a special-discount SKU) makes that item earn 0 crystals/Bowls in consumer flow.
3. Reward catalog edits (cost, stock, tier gate) reflect in consumer Rewards Store (Sprint 8); tier-gated reward hidden/disabled for lower tiers.
4. Redemption monitor shows live redemptions + stock-depletion alert when a reward hits its cap.
5. Config mutations versioned, reversible, audit-logged; high-impact changes require dual-approval where configured.

**Test flow:**
1. As Loyalty Manager → set Explorer multiplier 1.25× → complete a consumer order as Explorer → earned crystals reflect 1.25× (Example B math, Sprint 7).
2. Lower Pioneer threshold from 40 to 30 → a consumer with 32 Bowls tiers up to Pioneer on next recalc/real-time check.
3. Add a "Limited Mochi Set" reward (tier gate Pioneer, stock 50) → consumer Pioneer sees it; Seeker does not.
4. Redeem it consumer-side until stock hits 0 → monitor fires stock-depletion alert; reward auto-disables.
5. Revert a config change via version history → prior values restored; audit log shows both.
