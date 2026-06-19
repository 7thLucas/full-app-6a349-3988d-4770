# Sprint 1: Foundation, Data Models & Design System

**Goal:** A running app shell with the "Modern Oriental Minimalism" design system, persistent bottom nav, and real MongoDB-backed core entities seeded from Appendix A — so every later slice has stable models, a typed API seam, and reusable UI primitives.

**User flows included:**
- App launch & navigation: User opens the app, sees the cream-themed shell, and moves between Home/Menu/Rewards/Cart/Profile tabs (each tab keeps its own back stack; cart badge reflects count).
- Browse seeded menu/outlets (read-only): User can see real Hong Tang categories, items, prices, and outlets pulled from the database (proves the data layer end to end).

**Depends on:** None.

**Key implementation areas:**
- **Database (Typegoose):** finalize `MenuItem` (name, description, category, price, per-outlet/country price overrides, calorie/allergen, imagery refs 1x/2x/3x, option groups: Ice/Sugar/Toppings with surcharge + min/max + defaults, serving-temperature warm/cold tag, draft/published), `Outlet` (name, address, geo, country/region, hours-per-day + holiday overrides, last-order cutoff, prep config, pickup/delivery flags, sold-out item ids, POS status), `Member` (phone, country, profile, tier, Bowls, Sugar Crystals batches, consent), `Order`, `Voucher`, `Reward`. Ensure valid Typegoose syntax (CLAUDE.md). One model = one file under `app/api/domain/models/` (SRP).
- **Seeds:** load §17 Appendix A menu (Signature, Grass Jelly/Soya/Taro series, Ice Pudding, Durian, Mango, Thai Mango Coco, Thai Coconut Ice, Classic warm, Fresh Milk, Beverages, Savory), real toppings set, and ~26 verified outlets with hours into MongoDB via `catalog.seed.ts`.
- **API:** read endpoints `GET /menu`, `GET /outlets`, `GET /rewards` returning standard `api-response.ts` envelope; `htApi` client typed against `domain.types.ts`.
- **Design system:** Tailwind tokens for color (`#FDFBF7` bg, `#3E2723` text, `#C62828` accent, warm grey `#6F6258`, tier metallics), serif-header/sans-body typography with tabular numerals, 8px grid, radii (cards 16 / buttons 12 / pills full). Primitives: Button (primary/secondary/ghost/destructive + states), segmented control, stepper, chip/pill, card, bottom sheet, OTP input, badge, toast, skeleton, empty/error state (DIP — components consume tokens, not hardcoded hex).
- **Shell:** `phone-shell.tsx` + persistent 5-tab bottom nav (active = red filled, cart badge hidden at 0, bump animation), safe-area insets, reduce-motion honoring.

**Verification steps:**
1. `GET /api/menu` and `GET /api/outlets` return seeded Appendix-A data from MongoDB (not in-memory), in `{success,data}` envelope.
2. Bottom nav renders 5 tabs in fixed order; active tab uses Hong Tang Red filled icon; tapping active tab scrolls to top.
3. Design tokens applied: no pure `#FFFFFF` large surfaces; primary CTA is red, body text brown.
4. All primitives render their loading/disabled/pressed states in a component sandbox/storybook route.

**Test flow:**
1. Seed DB (`npm run seed` or equivalent), start app.
2. Launch → land on Home shell over cream background with bottom nav.
3. Tap Menu → see real categories (Signature, Taiwan Grass Jelly Series, …) with real items and `Rp` prices.
4. Tap each nav tab → content switches; cart badge shows 0 (hidden).
5. Throttle network → lists show skeletons, then populate.
