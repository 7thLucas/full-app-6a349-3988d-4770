# Sprint 8: Rewards Store, My Vouchers & Voucher Application at Checkout

**Goal:** A user can spend Sugar Crystals in the Rewards Store to get vouchers, manage them in My Vouchers, and apply exactly one voucher/promo at checkout — closing the earn → redeem → save loop.

**User flows included:**
- Redeem reward (PRD §8.6, §9.4): browse 2-col Rewards Store grid (cost pill, enabled/disabled by affordability + tier gate) → reward detail → Redeem → confirm crystal deduction → success modal "Voucher added to My Vouchers".
- My Vouchers wallet: ticket-style cards with terms (min spend, eligible items) + expiry (≤7 days red + label); expired/used in dimmed collapsed section; "Use" deep-links into an order.
- Apply voucher at checkout (PRD §10.3): voucher row → selection sheet (eligible list + manual promo code field) → applied as removable chip; invalid/ineligible shows inline reason; no stacking — applying a new one replaces the current.
- Edge cases (PRD §18.6): insufficient crystals (Redeem disabled), out-of-stock / per-user-limit reached, redemption failure (no deduction + retry).

**Depends on:** Sprint 5 (cart/checkout breakdown + discount line), Sprint 7 (crystal balance + tier gating).

**Key implementation areas:**
- **Database:** `Reward` (image, title, crystal cost, type voucher/merch/experience, stock cap, per-user limit, tier gate, validity, scope), `Voucher` (type %/fixed/BOGO, value, eligible items/categories, min spend, validity, fulfillment-mode eligibility, usage caps), member `vouchers[]` (granted/used/expired).
- **Service (SRP/DIP):** `RewardsService.redeem` (atomic crystal deduct + voucher grant, idempotent, stock/limit checks); `VoucherEngine.validate/apply(cart, voucher|promoCode)` enforcing one-per-order (no stacking, replace-on-new), min-spend, mode, eligibility — single source reused by admin preview (Sprint 13). Discount feeds net-spend exclusion in `LoyaltyService` (Sprint 7).
- **API:** `GET /rewards`, `POST /member/redeem`, `GET /member/vouchers`, `POST /orders/validate-voucher`; checkout consumes applied voucher.
- **UI:** Rewards Store grid + reward detail sheet + success modal; My Vouchers list (dashed ticket cards, expiry badges, collapsed expired section); checkout voucher row + selection sheet + applied chip (replace updated from Sprint 5 stub).
- **States:** empty Rewards Store / empty vouchers illustrated states; redemption failure inline retry.

**Verification steps:**
1. Affordable reward → Redeem enabled; redeeming deducts exact crystals and adds voucher to My Vouchers (success modal). Unaffordable/tier-gated → disabled with reason.
2. Redemption is atomic + idempotent: failure leaves balance unchanged; double-tap doesn't double-deduct.
3. Checkout: applying voucher recomputes breakdown; Example (§8.4) Subtotal 69.000 − voucher 10.000 → PB1 10% on 59.000 = 5.900 → Total 64.900.
4. No stacking (Example E §10.6): applying promo code B replaces voucher A; breakdown shows only B.
5. Ineligible voucher (min spend/mode/expired) shows inline reason and is not applied; discounted amount excluded from crystal net-spend.

**Test flow:**
1. With ≥100 crystals, Rewards → tap "Buy 1 Get 1 Free" → Redeem → confirm → success modal; balance drops 100.
2. My Vouchers → see the new voucher with terms + expiry.
3. Build cart Grassjelly Signature + Royal Milk Tea → Cart → voucher row → apply a Rp 10.000 voucher → chip shows, Total = 64.900.
4. Enter a promo code → it replaces the chip; only one discount shown.
5. Remove chip → Total reverts.
6. Try a voucher below its min spend → inline reason, not applied.
