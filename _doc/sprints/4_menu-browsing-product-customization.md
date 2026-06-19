# Sprint 4: Menu Browsing & Product Customization

**Goal:** A user can browse the store-specific menu by category, search items, open a product detail sheet, customize Ice/Sugar/Toppings with live price recompute, and add a configured line to the cart.

**User flows included:**
- Browse menu (PRD §8.2): sticky store header + Pickup/Delivery toggle, scroll-spy category pill bar using real Hong Tang categories, sectioned item list with cut-out thumbnails + price + red "+".
- Search & filter: live item search; warm/cold (serving-temperature) filter.
- Customize & add (PRD §8.3): bottom-up product detail modal — hero image, title/price/allergen, segmented Temperature/Ice, Sugar (100/70/50/30/0%), multi-select Toppings with surcharge + min/max, quantity stepper, live "Add to Cart · Rp …" CTA.
- Availability handling: sold-out items dimmed + "Habis", store-unavailable items hidden, required-selection guard, topping-max guard (PRD §18.3).

**Depends on:** Sprint 1 (MenuItem model/seed + primitives), Sprint 3 (active outlet for availability).

**Key implementation areas:**
- **API:** `GET /menu?outletId=` returning items with per-item option groups + per-outlet availability/sold-out applied. Price-override resolution per outlet/country.
- **Service (SRP/DIP):** `CatalogService.menuForOutlet` (merges item master + outlet availability matrix); `PriceCalculator.lineTotal(base, toppings[], qty)` pure function — single source of truth reused by cart/checkout (Sprint 5) and loyalty net-spend (Sprint 7).
- **UI (`app/routes/app.menu._index.tsx`, `app.menu.$itemId.tsx`):** scroll-spy pill bar (auto-highlight active section), search field, item rows, product detail sheet with segmented controls (no dropdowns), topping checklist with min/max enforcement, sticky footer with stepper + live price CTA. Editing a cart line reopens prefilled sheet with "Update Cart".
- **States:** row/image skeletons; empty search state; add-to-cart failure → inline retry, sheet stays open with selections preserved.

**Verification steps:**
1. Menu shows only items available at the active outlet; sold-out rows dimmed with "Habis" + disabled "+".
2. Tapping a category pill smooth-scrolls; active pill auto-highlights on scroll (scroll-spy).
3. Product detail CTA price updates live as Ice/Sugar/Toppings/qty change; matches `PriceCalculator`.
4. Topping min/max enforced; exceeding max disables further selection with a hint; missing required selection blocks the CTA.
5. Add to Cart bumps the cart badge and shows a toast; reopening an added line reads "Update Cart" with prior selections.

**Test flow:**
1. From Menu (store set) → scroll; verify pill highlights track sections.
2. Search "grass jelly" → list filters live; clear → full list returns.
3. Tap "Grassjelly Signature" → sheet opens; default Sugar/Ice preselected.
4. Add 2 toppings → CTA price increases by surcharges; set qty 2 → price doubles.
5. Tap "Add to Cart · Rp …" → sheet dismisses, badge bumps, toast shows.
6. Open a sold-out item's row → "+" disabled.
7. Reopen the added item from Cart (Sprint 5) → sheet prefilled, CTA "Update Cart".
