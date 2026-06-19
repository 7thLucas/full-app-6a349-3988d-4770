# Sprint 3: Store Locator & Active Outlet Selection

**Goal:** A user can find the nearest Hong Tang outlet on a map/list, see hours and open/closed status, get directions, and set an active pickup store that drives menu availability downstream.

**User flows included:**
- Find a store (PRD §8.7): map with branded pins + draggable distance-sorted list; tap pin ⇄ highlights row; recenter FAB; area/outlet search.
- Outlet detail: full hours, address, "Get Directions" → native maps, "Order from this store" → sets active store and returns to Menu.
- Set active store: required before menu browsing in pickup mode; persisted per session/member.
- Permission-denied fallback: manual area search when location denied (PRD §18.7).

**Depends on:** Sprint 1 (Outlet model/seed), Sprint 2 (member/session for persisting selection).

**Key implementation areas:**
- **API:** `GET /outlets?country=&near=lat,lng` returning distance-sorted outlets with computed open/closed from hours + last-order cutoff; `GET /outlets/:id`. Scoped by active country.
- **Service (SRP):** `OutletService.list/nearby/isOpenNow` — open/closed + last-order logic isolated (reused by checkout blocking in Sprint 5 and admin in Sprint 13).
- **UI (`app/routes/app.outlets.tsx`):** map component (branded pins, user-location dot, peek card), draggable lower list sheet, search field, recenter FAB, outlet detail (push), "Get Directions" deep link, "Order from this store" CTA.
- **State:** active outlet stored in `app-store` and persisted to member; switching re-validates menu/cart in later sprints.
- **States:** loading list skeleton; permission-denied manual-search; no-outlets-in-area empty state; closed outlet shown with hours (order CTA disabled/warns).

**Verification steps:**
1. With location granted, outlets sort by real distance; nearest first.
2. Tapping a pin highlights the matching list row and vice versa.
3. Open/closed badge matches outlet hours + last-order cutoff for current WIB/WITA/WIT time.
4. "Order from this store" sets active outlet (persists across relaunch) and returns to Menu.
5. Deny location → manual area search still finds outlets.

**Test flow:**
1. Home → tap "Order for Pickup" (no store set) → Store Locator opens.
2. Grant location → see pins + sorted list (Grand Indonesia, Mall Kelapa Gading 3, …).
3. Drag list sheet up; tap an outlet row → detail with hours + address.
4. Tap "Get Directions" → native maps opens to coordinates.
5. Tap "Order from this store" → Menu opens with that store in the header.
6. Relaunch app → active store retained.
7. Tap "Change" in Menu header → re-opens picker.
