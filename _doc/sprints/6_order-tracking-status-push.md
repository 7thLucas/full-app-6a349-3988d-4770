# Sprint 6: Order Tracking, Status & Push Notifications

**Goal:** After paying, a user can watch real-time order status through the stepper, get push notifications at each transition, show a pickup QR at the counter, and reorder/rate from a terminal state.

**User flows included:**
- Track order (PRD §8.5, §9.1): status headline + ETA, stepper Received → Preparing → Ready for Pickup → Collected (Delivery variant: Out for Delivery → Delivered, tracking-only per §13). Active step pulses; live updates via push + pull-to-refresh.
- Pickup proof: membership/order QR shown for counter verification (tap to enlarge/brighten).
- Transactional push (PRD §11.1): order received/confirmed, ready for pickup, out-for-delivery/delivered.
- Terminal-state actions: Reorder (rebuild cart) and Rate.
- Edge cases (PRD §18.5): auto-cancellation + refund note, stalled feed (last-updated timestamp), refund-pending note (up to 15 working days).

**Depends on:** Sprint 5 (orders + payment + cancellation/refund seam).

**Key implementation areas:**
- **Database:** order `statusTimeline` (state + timestamp), cancellation reason + peak-hour-proceeded flag.
- **Service (SRP/DIP):** `OrderStatusService.advance/cancel` emits domain events; `NotificationService` interface with `PushProvider` (APNs/FCM) impl, consumed via events (Open/Closed: new notification types added without touching status logic). `device-token` registration.
- **API:** `GET /orders/:id` (with timeline), `POST /orders/:id/cancel`, device-token register endpoint, status push webhook/poll from POS feed.
- **UI (`app/routes/app.orders.$id.tsx`, `app.orders._index.tsx`):** vertical/horizontal stepper with completed/active/pending states + pulse, QR enlarge/brighten, collapsible itemized summary, "Need help?" link, Reorder + Rate on terminal states, pull-to-refresh, last-updated timestamp.
- **States:** stepper skeleton; stalled-feed timestamp; cancelled + refund explanation.

**Verification steps:**
1. Status transitions reflect on the page live (push) and on pull-to-refresh; active step pulses.
2. A push notification fires on each transition (Received, Ready, etc.) and deep-links to the order.
3. Pickup QR enlarges and raises brightness on tap.
4. Terminal state (Collected) shows Reorder (rebuilds cart) and Rate.
5. Auto-cancelled order shows "Cancelled" + refund-issued copy; peak-hour-proceeded orders excluded from wait-time cancellation.

**Test flow:**
1. Place an order (Sprint 5) → land on Order Status (Received).
2. Advance status via admin/test hook → UI updates to Preparing → Ready; device gets "Your order is ready!" push.
3. Tap QR → enlarges + brightens.
4. Advance to Collected → Reorder + Rate appear; tap Reorder → cart rebuilt with same lines.
5. Trigger auto-cancel → status Cancelled + refund note (up to 15 working days).
6. Pull-to-refresh on a stalled feed → last-updated timestamp shown.
