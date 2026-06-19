# Hong Tang Mobile App — Product Overview

## 0. Product Summary

**Hong Tang (红糖, "brown sugar")** is Indonesia's pioneer and leading oriental
dessert brand, serving **Healthy Asian Desserts since 2012** — Taiwanese-style cold
desserts and Hong Kong-style warm desserts, alongside drinks — across upscale malls
nationwide.

The **Hong Tang Mobile App** delivers a premium, seamless, and elevated digital
experience that complements Hong Tang's modern oriental dessert aesthetic. It is the
bridge between **online convenience and offline craftsmanship**: users effortlessly
order high-quality, freshly-made oriental desserts and drinks, skip the queue with
self-pickup, and are rewarded for their loyalty.

- **Core concept:** *"Oriental Dessert Culture, Now in Your Pocket."*
- **Experience principle:** a calm, crafted user experience that drives retention
  through exclusivity and gamified rewards.
- **Brand aesthetic:** *Modern Oriental Minimalism* — polished, premium, restrained.

## 1.1 Product Goals

- **Drive repeat purchase & retention** through the **"Loyal-Tang"** rewards program
  and tiered membership.
- **Reduce in-store wait times** by shifting volume to **order-ahead self-pickup**.
- **Capture first-party customer data** (purchase history, preferences) to power
  personalization and CRM.
- **Establish a direct marketing channel** (push, in-app banners) for launches,
  campaigns, and collaborations.
- **Reinforce premium brand positioning** through a polished, *Modern Oriental
  Minimalism* digital experience.

## 1.2 Success Metrics (KPIs)

- **Adoption:** app downloads, registered users, % of transactions through the app vs. POS.
- **Engagement:** monthly active users (MAU), order frequency per active user, D30 retention.
- **Conversion:** menu-view → add-to-cart rate, cart → paid order rate, checkout abandonment rate.
- **Loyalty:** % of users enrolled in Loyal-Tang, reward redemption rate, tier progression rate.
- **Operational:** average order prep-time accuracy, pickup no-show rate.
- **Commercial:** app-attributed revenue, average order value (AOV), referral-driven new users.

## 1.3 Assumptions & Dependencies

- A **POS / order-management system** exists at each outlet and can accept and
  acknowledge app orders.
- A **payment gateway and supported wallets** are available per market (PCI DSS compliant).
- A **loyalty / CRM backend** issues, tracks, and expires **Sugar Crystals** and
  membership tiers.
- **Outlet master data** (location, hours, menu availability, prep capacity) is
  centrally maintained.
- **Push notification infrastructure** (APNs / FCM) and an **SMS OTP provider** are available.

## 2. Target Audience

- **Modern Dessert Lovers** — health-conscious individuals looking for premium,
  freshly-made oriental desserts and drinks rather than mass-produced, artificially
  flavored sweets.
- **Busy Professionals & Students** — users who value convenience, time-saving
  (skipping the queue), and seamless digital payments.
- **Brand Loyalists & Enthusiasts** — customers engaged with the Hong Tang brand who
  want to participate in the "Loyal-Tang" program to earn rewards, access exclusive
  drops, and collect merchandise.

## 3. MVP — The First Thing to Nail

The heartbeat of the first build is the **order-ahead → skip-the-queue self-pickup
flow**, because loyalty, first-party data, and the marketing channel all depend on
transactions to feed on:

1. Browse the crafted menu (cold desserts, warm desserts, drinks).
2. Order ahead and pay via seamless digital payment.
3. Receive a pickup code that walks the customer past the in-store line.
4. **Loyal-Tang** rewards (Sugar Crystals) accrue automatically from the first order.

Everything else in the goal set — tiered membership, CRM personalization, push
campaigns, exclusive drops, collectible merch — layers on top of this core loop.

## 4. Loyalty System — Loyal-Tang

- **Program name:** Loyal-Tang.
- **Two distinct counters — do not conflate:**
  - **Sugar Crystals** — the spendable reward *currency*. Earned on orders, redeemed in
    the Rewards Store for vouchers / merch.
  - **Bowls** — the tier-progression *counter* (one Bowl per qualifying item purchased),
    measured over a **trailing 365-day window**. Bowls determine tier; Sugar Crystals do not.
- **Purpose:** convert occasional mall visits into a repeat habit and lift order frequency.

### 4.1 Tiers (escalating; each inherits all lower-tier benefits)

Four named tiers, themed with metallic accents on the digital membership card:

| Tier | Card theme | Earn multiplier |
| --- | --- | --- |
| **Tang Seeker** | Bronze | 1.0× |
| **Tang Explorer** | Silver | 1.25× |
| **Tang Pioneer** | Gold | 1.5× |
| **Tang Master** | Platinum | 2.0× |

- **Tier-up — real-time:** crossing a Bowls threshold (e.g. 10 → Explorer, 40 → Pioneer)
  immediately upgrades the member and fires a tier-up notification.
- **Downgrade — month-end recalc only:** never mid-month, max one tier per recalc. When
  older Bowls age out of the 365-day window and the total drops below a threshold, the
  member is downgraded **after a one-cycle grace period + advance notice**.

### 4.2 Earning Sugar Crystals

- **Rule:** 1 Sugar Crystal per **Rp 1,000 qualifying net spend × tier multiplier**, floored.
  Net spend is taken **after any voucher discount** and **excludes PB1 / tax**.
  - *Example:* net spend Rp 59.000 → 59 base × 1.5 (Pioneer) = 88.5 → floor = **88 Sugar Crystals**.
- **Expiry:** each earned **batch keeps its own 365-day clock**; the app warns within
  **7 days** of each batch's expiry.

### 4.3 Per-tier benefit allocation

| Benefit | Seeker | Explorer | Pioneer | Master |
| --- | --- | --- | --- | --- |
| Sugar Crystals earn multiplier | 1.0× | 1.25× | 1.5× | 2.0× |
| Rewards Store access & redemption | ✓ | ✓ | ✓ | ✓ |
| Welcome rewards (new user) | ✓ | ✓ | ✓ | ✓ |
| Birthday gift | drink/dessert voucher | + merch voucher | + premium merch | + premium merch & surprise |
| Early access to seasonal launches | — | ✓ | ✓ | ✓ |
| Second-item discount voucher | — | occasional | ✓ | ✓ |
| 15%-off-total-bill voucher | — | — | periodic | periodic (higher frequency) |
| Free-item milestone reward | — | — | ✓ | ✓ |
| Exclusive merchandise redemption | — | — | ✓ | ✓ |
| VIP invites & member-only events | — | — | — | ✓ |
| Priority support / concierge | — | — | — | ✓ |

- **Members' Day Special** and exclusive membership events are run via the app.

## 5. Brand & Design Language — *Modern Oriental Minimalism*

This is the visual and interaction contract every screen inherits; deviations must be
justified.

- **Design ethos:** calm, crafted, premium, unhurried. Ample whitespace; let imagery and
  dessert craft breathe. **One clear primary action per screen** — reduce competing CTAs
  and visual noise.
- **Voice:** warm, concise, confident. Dessert-forward language ("Bowls", "Sugar
  Crystals", "Loyal-Tang"). Avoid hype / exclamation overload. Bahasa Indonesia copy keeps
  the same calm register.
- **Color identity:**
  - Background — textured cream **#FDFBF7** (never pure white for large surfaces).
  - Primary text & structure — deep brown-sugar **#3E2723**.
  - Accent / primary CTA / alert — **Hong Tang Red #C62828**, reserved for the single most
    important action, active states, and badges (do not overuse).
  - Secondary / meta text — warm grey **#6F6258**.
  - Tier metallics — Bronze → Silver → Gold → Platinum gradients (Seeker → Master).
  - Semantic colors always pair with a text label — never color alone (e.g. expiry).
- **Typography:** elegant **serif** for display/headers; clean modern **sans-serif** for
  body/UI. Tabular figures for Sugar Crystals balances, prices, and totals. Support OS
  dynamic type without breaking layout.
- **Shape, elevation & motion:** soft rounded corners (cards ~16px, buttons ~12px, chips
  fully rounded); subtle low-spread shadows; calm, eased, restrained motion that honors
  the OS "reduce motion" setting.
- **Layout:** 8px base grid; generous gutters; cards as the primary container; primary CTA
  anchored to a sticky bottom footer for one-thumb reach.
- **Accessibility:** AA contrast minimum, tap targets ≥ 44×44pt, dynamic type, screen-reader
  labels, no information by color alone.
- **Localization:** IDR formatting ("Rp 38.000"); WIB/WITA/WIT time handling; layouts
  absorb ~30% text expansion for Bahasa Indonesia with no CTA truncation; all copy
  externalized for translation.

## 6. Key User Journeys

- **Order & Pickup (the morning routine):** pick the outlet near you → reorder a favorite
  from Recent/Favorites, adjust sugar → apply a voucher, pay (e-wallet / QRIS) → receive
  confirmation + ETA → "your order is ready" push → walk in, skip the queue, collect →
  Sugar Crystals balance and tier progress update.
- **Redeeming a reward:** expiry nudge (push/email) → Rewards Store → exchange Sugar
  Crystals for a voucher (e.g. Buy-1-Get-1) → voucher saved to "My Vouchers" for the next
  checkout.
- **First-time onboarding:** phone number + OTP (SMS/WhatsApp) → grant notification /
  optional location, complete a minimal profile → land on Home with a welcome voucher
  already in the wallet and a prompt to place the first order.
- **Delivery (where supported / roadmap):** toggle to Delivery, confirm a saved address →
  build a multi-item order, apply a voucher → review fee + ETA, pay → track to delivered.
  *Note:* native in-app delivery is a **roadmap** item; today delivery runs via
  third-party platforms (GoFood / GrabFood / ShopeeFood) and those orders **do not** earn
  Sugar Crystals.
