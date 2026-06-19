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
- **Reward currency:** **Sugar Crystals** (earned on orders, redeemable for rewards).
- **Structure:** tiered membership with tier progression; exclusive drops and
  collectible merchandise for engaged members.
- **Purpose:** convert occasional mall visits into a repeat habit and lift order frequency.
