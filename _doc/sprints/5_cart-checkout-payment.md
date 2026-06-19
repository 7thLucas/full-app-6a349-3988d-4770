# Sprint 5: Cart, Checkout & Payment (Pickup Happy Path)

**Goal:** A user can review/edit a cart, see the correct price breakdown (incl. PB1), pick a payment method, pay securely, and get a placed order — with idempotent, double-charge-safe placement.

**User flows included:**
- Review & edit cart (PRD §8.4): fulfillment summary (store + prep estimate), line items with customizations, inline qty adjust, edit (reopens product detail) and delete (confirm + swipe-to-delete).
- Price breakdown: Subtotal, Delivery Fee (if any), PB1 10%, Total with tabular numerals (matches worked example §8.4 / §10.6).
- Select payment & pay: "Pay With" sheet (QRIS, GoPay/OVO/DANA/ShopeePay/LinkAja, Visa/Mastercard); Confirm Payment / Slide to Pay; in-button spinner; disabled to prevent double-submit.
- Order placement: on success → push to Order Status; on failure → keep cart + retry banner.
- Checkout edge cases (PRD §18.4): item went unavailable, store closed/past last-order, payment failure/timeout, empty cart.

**Depends on:** Sprint 2 (auth/session), Sprint 3 (active outlet + open/closed), Sprint 4 (cart lines + PriceCalculator).

> Voucher row is stubbed here (disabled placeholder); full voucher apply lands in Sprint 8.

**Key implementation areas:**
- **Database:** `Order` (member, outlet, fulfillment mode, line items + customizations, price breakdown, payment ref/status, idempotency key, status=Received). `Transaction` (method, amount, status authorized/paid/failed/refunded, gateway ref — no PAN).
- **Service (SRP/DIP):** `OrderService.checkout` (re-validates availability + store-open + recomputes totals server-side via `PriceCalculator` + `TaxCalculator` PB1); `PaymentGateway` interface with provider impl (QRIS first), idempotent `charge(idempotencyKey)`; `RefundService` seam. Never trust client-sent totals.
- **API:** `POST /orders/checkout` (idempotent), `GET /orders/:id`. `authGuard`.
- **UI (`app/routes/app.cart.tsx`, `app.checkout.tsx`):** cart rows (edit/delete/qty, swipe-to-delete + confirm), payment-method sheet, sticky CTA with spinner, full breakdown. Bottom nav hidden on payment modal.
- **States:** empty-cart state ("Browse Menu"); blocked-checkout banners (item unavailable / store closed); payment retry banner preserving cart.

**Verification steps:**
1. Breakdown matches §10.6 Example: Grassjelly Signature 50.000 + Royal Milk Tea 19.000 → Subtotal 69.000; PB1 10% → Total reflects rule (no voucher this sprint).
2. Totals recomputed server-side; tampering with client totals is rejected.
3. Confirm Payment shows spinner, disables CTA; duplicate submit / retry with same idempotency key does NOT create a second order or charge.
4. Store closed or item gone unavailable → checkout blocked with explanation + suggestion.
5. Payment failure → cart preserved, retry banner; success → Order Status page with status Received.

**Test flow:**
1. Add Grassjelly Signature + Royal Milk Tea → open Cart.
2. Adjust a qty inline; swipe-delete one line → confirm dialog.
3. Verify Subtotal/PB1/Total numbers.
4. Tap "Pay With" → choose QRIS → back to cart.
5. Slide to Pay → spinner → (test gateway success) → Order Status (Received).
6. Repeat with forced gateway failure → cart kept + retry banner; no charge.
7. Empty the cart → empty state with "Browse Menu".
