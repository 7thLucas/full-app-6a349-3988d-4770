# Sprint 11: Home Merchandising (CMS Banners) & Marketing Notifications

**Goal:** The Home page becomes a dynamic, personalized merchandising surface (scheduled banners, core action cards, personalized strip, promo rows), and lifecycle/marketing campaigns reach users via push/email respecting consent.

**User flows included:**
- Home dashboard (PRD §8.1): time-aware greeting, membership QR button, hero banner carousel (16:9, auto-advance, page dots, CMS deep links), core action cards (Order for Pickup / Delivery — collapses if delivery unavailable), loyalty snapshot (Sprint 7), personalized "Recent Orders / Favorites" strip, themed promo/content rows.
- Banner deep-linking: tapping a banner resolves CMS deep link (product detail / Rewards Store / in-app webview); banners scheduled (start/end) + priority-ordered.
- Personalized reorder: tap a recent/favorite chip → adds to cart with last-used customization.
- Lifecycle & marketing notifications (PRD §11.2): crystals expiring, tier-up, new launches/seasonal/collabs, birthday perks, referral earned — push/email, consent-gated.
- Edge cases (PRD §18.1, §18.8): offline → cached home + last loyalty snapshot; delivery card collapses where unavailable.

**Depends on:** Sprint 6 (notification infra), Sprint 7 (loyalty snapshot + lifecycle triggers).

**Key implementation areas:**
- **Database:** `Banner` (image, deep link, safe-area text, start/end, priority, country/outlet scope), `PromoRow` curation, member `favorites`/recent (favorites endpoint exists in scaffold).
- **Service (SRP/DIP):** `MerchandisingService.activeBanners(now, scope)` (schedule + priority + country filter); `CampaignService` over `NotificationService` (Sprint 6) with `ConsentGate`, segmentation, scheduling, throttling — new channels/campaign types added without touching transactional path (Open/Closed).
- **API:** `GET /home` (banners + core actions + personalized strip + promo rows in one payload), favorites toggle (scaffold), deep-link resolver.
- **UI (`app/routes/app._index.tsx`):** carousel (auto-advance ~5s, pause on touch, dots), core action cards, personalized strip, promo rows, first-run welcome state.
- **States:** first-run (welcome snapshot + "Place your first order", strip hidden); loading skeletons; offline cached + retry banner.

**Verification steps:**
1. Only banners within their start/end window and country scope appear, ordered by priority; tapping resolves the correct deep link.
2. Greeting is time-of-day aware; membership QR button opens QR at max brightness.
3. Personalized strip shows recent/favorite items; tapping adds to cart with last-used customization.
4. Delivery unavailable → Home collapses to single full-width "Order for Pickup".
5. Marketing campaign respects consent + per-category opt-out; transactional unaffected; throttling prevents duplicate sends.

**Test flow:**
1. Seed 3 scheduled banners (one expired) → Home shows only 2 active, in priority order.
2. Tap a banner deep-linked to Rewards Store → navigates correctly.
3. As returning user → personalized strip shows a recent order → tap → cart prefilled.
4. Disable delivery flag for outlet → Home shows single pickup card.
5. Send a "new launch" campaign to a consenting segment → push/email delivered; opt-out user receives nothing.
6. Go offline → Home renders cached content + offline banner.
