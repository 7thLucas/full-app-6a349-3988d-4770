

# Hong Tang Mobile App — Product Spec (v1)

## Product
**Hong Tang (红糖, "brown sugar")** — Indonesia's premium oriental dessert brand serving Healthy Asian Desserts since 2012: Taiwanese-style cold desserts, Hong Kong-style warm desserts, and drinks, across upscale malls nationwide.

**Core concept:** "Oriental Dessert Culture, Now in Your Pocket."
**Experience principle:** calm, crafted, premium, unhurried. The app bridges online convenience and offline craftsmanship: order ahead, skip the queue with self-pickup, and earn loyalty rewards.

## Users / Audience
- **Modern Dessert Lovers** — health-conscious, want premium freshly-made oriental desserts/drinks, not mass-produced sweets.
- **Busy Professionals & Students** — value convenience, time-saving (skip the queue), seamless digital payment.
- **Brand Loyalists & Enthusiasts** — engaged with the brand, want the "Loyal-Tang" program: earn rewards, exclusive drops, collectible merch.

## Voice / Tone
Warm, concise, confident. Dessert-forward vocabulary ("Bowls", "Sugar Crystals", "Loyal-Tang"). Avoid hype and exclamation overload. English UI for v1 (Bahasa Indonesia is roadmap).

## Strategic Principles
- The heartbeat is the **order-ahead → skip-the-queue self-pickup flow** — loyalty, first-party data, and the marketing channel all feed off completed transactions.
- North-star event: a **Verified Order** — placed, paid, and picked up. Not downloads, not menu views.
- Everything else (tiers, personalization, campaigns, drops, merch) layers on top of the core ordering loop.

## v1 SCOPE — Consumer App (build this cut well)
1. **Onboarding** — passwordless phone OTP (SMS/WhatsApp, simulated), minimal profile (name, optional birthday). On completion, land on Home with a **welcome voucher already in "My Vouchers"** and a prompt to place the first order.
2. **Outlet selection / Store Locator** — store-first: store selection required before browsing. Show nearest outlet, hours (open/closed, last-order cutoff), directions. Menu availability and prep times are store-specific.
3. **Menu browse by category** — Signatures, Grass Jelly, Mango & Fruit, Warm Desserts, Smash Ice & Ice Cream, Beverages, Seasonal. 1:1 thumbnails + hero detail page.
4. **Product customization** — Temperature/Ice, Sugar % (100/70/50/30/0), Toppings (surcharge, min/max constraints), quantity stepper.
5. **Cart → Checkout → order-ahead self-pickup** — apply ONE voucher OR ONE promo code per order (no stacking; applying a new one replaces the current). Show realistic prep-time/ETA BEFORE payment. Simulated payment (QRIS/e-wallet/card mock). On payment, order is locked; editing only exists pre-payment. Receive a **pickup code**.
6. **Live order status stepper** — Received → Preparing → Ready → Collected, with (simulated) notifications at each transition.
7. **Loyal-Tang loyalty engine — TWO distinct currencies (do not conflate):**
   - **Sugar Crystals** — spendable reward currency. Earned on paid purchases (1 Crystal per Rp 1,000 net spend after voucher, excl. tax, × tier multiplier, floored). Spent in the Rewards Store. **Spending Crystals does NOT lower tier.**
   - **Bowls** — tier-progression counter (one Bowl per qualifying item), trailing 365-day window. **Bowls set tier ONLY.**
8. **Tiered membership by Bowls:** Tang Seeker (0-9, Bronze, 1.0×), Tang Explorer (10-39, Silver, 1.25×), Tang Pioneer (40-79, Gold, 1.5×), Tang Master (80+, Platinum, 2.0×). Auto-enroll at Seeker. Linear tier-progress bar. Tier-up real-time; benefits inherit downward.
9. **Rewards Store** — redeem Crystals for vouchers/merch + **My Vouchers** wallet. Vouchers expiring within 7 days surface in red WITH a text label (never color alone); expired/used collapse into a dimmed section.
10. **Referral program** — unique referral code, rewards both sides; only first-time registrants can apply a code.
11. **Recent Orders / Favorites + reorder.**
12. **Home** — hero banner carousel + promo rows.

## v1 SCOPE — Lean Operations Console (web back-office, just enough to run it)
- **Menu & catalog management** — items CRUD, option groups, per-outlet availability / sold-out toggle.
- **Live order board per outlet** — state overrides, prep timer.
- **Outlet management** — hours, open/closed, pickup toggle, prep-time.

## EXPLICITLY DEFERRED (do NOT build in v1)
Native in-app delivery (v1 is pickup-only; third-party delivery earns no Crystals), full RBAC/maker-checker, finance reconciliation, compliance center, segmentation/campaign A/B, real PCI payment gateway, APNs/FCM push infra, native App Store/Play binaries. Use **mock/simulated data** for payments and notifications so flows are tappable end-to-end.

## Key Rules
- **No voucher stacking:** exactly one voucher OR one promo code per order; applying a new discount replaces the prior.
- **Store-first:** outlet selection precedes menu; orders blocked when store closed or past last-order cutoff.
- **Locked after payment:** items/customizations/quantity/store/mode unchangeable once paid; cancel within window to change.
- **Crystals math example:** net spend Rp 59.000 → 59 base × 1.5 (Pioneer) = 88.5 → floor = 88 Crystals.
- **Currency:** IDR formatting "Rp 38.000".
