# Sprint Plan — Hong Tang Mobile App

Vertical-slice breakdown of `_doc/product-overview.md` (PRD v1.4). Each sprint cuts through every layer (DB → API → UI) needed to ship one or more **complete, testable user flows**. Slices are dependency-ordered: every sprint depends only on earlier sprints.

## Stack context (from `.claude/CLAUDE.md`)

- Remix (Vite) + Express custom server, TypeScript.
- Backend: Express + MongoDB (Mongoose & Typegoose) under `app/api/`.
- Frontend: Remix Flat Routes in `app/routes/`; shadcn/ui + Tailwind.
- Modules self-contained in `app/modules/<slug>/` (created automatically — do not hand-create top-level module folders).
- API routes registered in `app/api/routes.ts`; protect with `authGuard` + `permissionGuard`.
- Consumer app lives under `app/routes/app.*` and `_index`/`onboarding`; admin console under `app/routes/console.*`.

## Current scaffold (already present — sprints harden/extend, not greenfield)

- Domain models: `app/api/domain/models/{order,outlet,menu-item}.model.ts`.
- Services: `catalog.service.ts`, `member.service.ts`, `order.service.ts`; `rewards.catalog.ts`; `seeds/catalog.seed.ts`.
- API routes (`app/api/domain/routes/domain.routes.ts`): outlets, menu, rewards, member/me, favorites, redeem, validate-voucher, checkout, orders CRUD/advance/cancel, admin menu/outlets/orders.
- Consumer routes wired to `htApi` (`app/lib/ht-api.ts`): home, menu, product detail, cart, checkout, orders, rewards, vouchers, outlets, me, onboarding.
- Console routes: dashboard, menu, outlets.
- Design seam: `app/lib/domain.types.ts` (CATEGORIES, formatIDR, TierKey), `app/components/app/phone-shell.tsx`, `app/components/ui/primitives.tsx`.

> **Implication:** Many happy-path flows exist as a prototype with in-memory/seed data. Sprints below state where the work is "complete + harden" vs "build new." Replace any mock/in-memory persistence with real Mongoose models, real OTP/payment providers, and real loyalty math per Section 10.

## Sprints & dependency graph

| # | Slice | Depends on |
|---|-------|-----------|
| 1 | Foundation, Data Models & Design System | — |
| 2 | Onboarding & Phone-OTP Authentication | 1 |
| 3 | Store Locator & Active Outlet Selection | 1, 2 |
| 4 | Menu Browsing & Product Customization | 1, 3 |
| 5 | Cart, Checkout & Payment (Pickup) | 2, 3, 4 |
| 6 | Order Tracking, Status & Push Notifications | 5 |
| 7 | Loyalty Engine — Sugar Crystals, Bowls & Tiers | 5, 6 |
| 8 | Rewards Store, My Vouchers & Voucher Application | 5, 7 |
| 9 | Referral Program | 2, 7 |
| 10 | Profile/Account, Settings & Notification Prefs | 2, 5 |
| 11 | Home Merchandising (CMS Banners) & Marketing Notifications | 6, 7 |
| 12 | Admin Console — RBAC, Dashboard & Order Management | 5, 6 |
| 13 | Admin Console — Catalog & Outlet Management | 4, 12 |
| 14 | Admin Console — Loyalty Engine & Rewards Store Config | 7, 8, 12 |
| 15 | Admin Console — Vouchers, Promos & Referral Config | 8, 9, 12 |
| 16 | Admin Console — CRM & Support Tooling | 7, 12 |
| 17 | Admin Console — Payments/Finance & Reports | 5, 7, 12 |
| 18 | Admin Console — Compliance, CMS & Notifications/Campaigns | 10, 11, 12, 16 |

Admin sprints 13–18 all build on **12** (RBAC, audit, console shell) and otherwise depend only on the consumer feature each configures — so they parallelize across teams once 12 lands.

```
1 ──► 2 ──► 3 ──► 4 ──► 5 ──► 6 ──► 7 ──► 8
      │           │           │     │     │
      │           └───────────┤     ├──► 9
      ├──────────────────────►10    │
                                     └──► 11 ──┐
5,6 ──────────────────────────────► 12 ──┬──► 13   (catalog + outlet)
                                          ├──► 14   (loyalty + rewards)
                                          ├──► 15   (vouchers + referral)
                                          ├──► 16   (CRM + support)
                                          ├──► 17   (finance + reports)
                                          └──► 18   (compliance + CMS; also needs 10,11,16)
```

## Cross-cutting assumptions

- **Design framework:** SOLID per slice (PRD gives no override). Loyalty math, voucher rules, and payment isolated behind service interfaces (SRP/DIP) so admin config (Sprints 13–14) can vary them without touching consumer flows.
- **Out of scope (PRD §13):** native in-app delivery ordering/payment. "Delivery" surfaces are tracking-only. Sprints treat delivery as a feature-flagged, status-display-only path.
- **Money/i18n:** all amounts IDR (`formatIDR`), times WIB/WITA/WIT; copy externalized (English now, Bahasa roadmap).
- **Security:** OTP rate-limit/lockout, TLS, no card PAN on device or in admin, PCI-DSS scope via gateway, UU PDP compliance.
- **Testability:** every data-driven screen ships loading/populated/empty/error states (PRD §7.9, §18).

See each `X_slug.md` for goal, included flows, implementation areas, verification, and QA test flow.
