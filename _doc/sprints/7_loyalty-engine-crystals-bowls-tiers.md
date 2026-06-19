# Sprint 7: Loyalty Engine — Sugar Crystals, Bowls & Tiers

**Goal:** Completed orders earn Sugar Crystals and Bowls per the §10 rules; tiers progress in real time and recalc at month-end; the user sees an accurate membership card, loyalty snapshot, progress, and crystal history.

**User flows included:**
- Earn on completion (PRD §10.1, §9.3): order Completed → Sugar Crystals = floor((net spend ÷ 1.000) × tier multiplier); Bowls += qualifying item count; "You earned X Sugar Crystals" push; balance/snapshot update.
- Walk-in earning: present member QR for counter scan (no retroactive points if unscanned).
- View loyalty (PRD §8.1, §8.6): Home loyalty snapshot card (tier-metallic, balance, "X bowls to next tier"); Rewards page digital membership card (name, tier, QR, balance, optional gyroscope reflection).
- Tier progression: real-time tier-up at threshold crossing + congrats notification; month-end recalc downgrade (max one tier, one-cycle grace + advance notice).
- Crystal history & expiry: per-batch 365-day expiry, transaction log (earned/redeemed/expired) with running balance; expiry reminder within 7 days (red + text label).

**Depends on:** Sprint 5 (orders/net-spend), Sprint 6 (completion events + notifications).

**Key implementation areas:**
- **Database:** member `bowls` events (item, timestamp — for rolling 365d window), `crystalBatches` (amount, earnedAt, expiresAt, remaining), `tier` + tier-history. Crystal/Bowl ledger entries.
- **Service (SRP/DIP — core of the app, keep pure & testable):** `LoyaltyService` with `EarnRule` (net spend = subtotal after discount, excl. PB1/delivery/non-qualifying; 1 crystal / Rp 1.000 × tier multiplier 1.0/1.25/1.5/2.0, floored), `BowlsCounter` (qualifying items, rolling trailing-365d window), `TierPolicy` (thresholds Seeker 0–9 / Explorer 10–39 / Pioneer 40–79 / Master 80+; real-time up; month-end recalc down with grace). Exclusions: free/Rp 0/trial/tasting/special-discount/third-party-platform orders. All rules behind interfaces so admin (Sprint 13) can reconfigure.
- **Jobs:** month-end tier recalc cron; per-batch expiry sweep + expiry-reminder notification scheduler.
- **API:** `GET /member/me` (tier, bowls window, balance, batches), `GET /member/crystals` (history), member QR endpoint.
- **UI:** Home loyalty snapshot card, Rewards membership card + QR, crystal history list, expiry badges (color + label).
- **States:** first-run welcome snapshot ("Place your first order"); loading skeletons.

**Verification steps:**
1. Example A: net spend 59.000 at Seeker → 59 crystals, +2 Bowls. Example B: at Pioneer → 88. (Match §10.6 exactly, floored.)
2. Exclusions honored: free/Rp 0/third-party orders earn 0 crystals and 0 Bowls.
3. Example C: 9 Bowls + buy 2 → 11 → immediate Tang Explorer + congrats push.
4. Example D: window total drops below threshold → downgrade only at month-end recalc, max one tier, after grace + advance notice.
5. Example F: two batches keep independent 365-day expiry; reminder fires within 7 days of each batch.

**Test flow:**
1. As Tang Seeker, place + complete an order with net spend Rp 59.000 → push "You earned 59 Sugar Crystals"; Home snapshot shows 59 + 2 bowls toward Explorer.
2. Complete orders to reach 10 Bowls → instant tier-up to Explorer; card turns silver; congrats push.
3. Open Rewards → membership card shows tier/balance/QR; tap QR → enlarges.
4. Open crystal history → earned entries with dates + running balance.
5. Simulate batch nearing expiry → reminder notification + red+label badge.
6. Run month-end recalc job with aged-out Bowls → at most one-tier downgrade after grace.
