# Sprint 13: Admin Console — Catalog & Outlet Management

**Goal:** Staff can manage the menu/catalog and outlet master data the consumer app consumes — items, options, pricing, availability, categories, outlets, hours, and fulfillment flags — with draft/publish, preview-as-app, scheduling, and audit.

**User flows included:**
- Menu & catalog management (PRD §14.5, §14.19): item CRUD (name, description/tasting-notes, category, base price + per-outlet/country overrides effective-dated, calorie/allergen, imagery 1x/2x/3x, option groups Ice/Sugar/Toppings with surcharge + min/max + defaults + per-item enable, warm/cold serving tag), draft vs published + preview-as-app.
- Category management: create/reorder categories (drives Menu pill bar / scroll-spy from Sprint 4).
- Availability matrix: per-outlet sold-out ("Habis") toggle, store-unavailable hide, scheduled seasonal/limited-drop availability.
- Outlet management (PRD §14.6, §14.19): outlet CRUD (name, address, geo-coordinates, country/region, contact, photos), hours per day + holiday overrides, last-order cutoff, prep-capacity / dynamic prep-time + peak-hour extended-wait, pickup/delivery flags, POS integration status/health.

**Depends on:** Sprint 4 (consumer menu/customization these configure), Sprint 12 (RBAC/audit/console shell). Builds on existing `console.menu.tsx` / `console.outlets.tsx` scaffold + scaffold admin endpoints (admin menu CRUD, outlet update, sold-out toggle).

**Key implementation areas:**
- **Database:** admin-editable fields on `MenuItem`/`Outlet` (already modeled in Sprint 1); effective-dated `priceOverrides`, draft/published versioning, `Category` ordering, availability matrix.
- **Service (SRP/DIP):** `CatalogAdminService` (item/category CRUD, publish workflow) and `OutletAdminService` (outlet CRUD, hours/cutoff, flags) — both reuse the SAME `CatalogService.menuForOutlet` + `OutletService.isOpenNow` engines the consumer reads (DIP: consumer reads config, admin writes it). No duplicate availability/open logic.
- **API (`app/api/routes.ts`):** extend scaffold admin routes — add category ordering, effective-dated pricing, scheduled availability, full outlet CRUD; all `permissionGuard`-scoped + audited.
- **UI (`app/routes/console.menu.tsx`, `console.outlets.tsx`):** item list+detail forms (field lists per §14.19), category drag-order, availability matrix grid, outlet list+detail with hours/holiday/cutoff/flags, preview-as-app, draft/publish toggle.
- **States:** draft vs published, validation errors, preview mode.

**Verification steps:**
1. Editing an item / price override / sold-out toggle reflects in consumer Menu (Sprint 4) after publish; draft changes do NOT appear live.
2. Per-outlet sold-out toggle shows "Habis" only at that outlet; store-unavailable hides the item there.
3. Category reorder changes the consumer Menu pill bar order.
4. Outlet hours / last-order cutoff / flags change consumer Store Locator + checkout blocking (Sprints 3, 5).
5. All catalog/outlet mutations audit-logged; regional manager limited to own outlet(s) (availability/hours only).

**Test flow:**
1. As Ops → Menu → mark "Grass Jelly QQ 28" sold-out at Grand Indonesia → consumer app shows "Habis" there only; other outlets unaffected.
2. Edit "Grassjelly Signature" price override for one outlet (effective-dated) → consumer price reflects after effective date + publish.
3. Reorder categories → consumer pill bar order updates.
4. As Ops → set an outlet's last-order cutoff to past-now → consumer checkout blocks with explanation; Store Locator shows closed.
5. As Store Manager (Outlet X) → can toggle Outlet X availability/hours only; other outlets not editable.
6. Verify each change in the audit log.
