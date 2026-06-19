# Sprint 9: Referral Program

**Goal:** A user can share a unique referral code; a new user can apply it at registration; and both sides get rewarded once the referee completes a first qualifying purchase — with anti-abuse limits.

**User flows included:**
- Share code (PRD §8.8, §9.6): Refer a Friend (Home + Me) → unique code + QR + "Invite Now"/"Share" → native share sheet.
- Apply code (registration): first-time registrant enters friend's code (optional, copy-paste) → valid code grants extra welcome vouchers to referee.
- Reward on qualification: referee completes first qualifying purchase → referrer earns referral reward (free dessert/drink, discount voucher, or gift) → "Referral reward earned" notification.
- Edge cases (PRD §18.2): invalid/duplicate code inline reason; only first-time registrants can apply; anti-abuse (self-referral, velocity, per-user caps).

**Depends on:** Sprint 2 (registration + referral-code seam), Sprint 7 (reward grant + first-qualifying-purchase signal from completed order).

**Key implementation areas:**
- **Database:** member `referralCode` (unique), `Referral` records (referrer, referee, status pending/qualified/rewarded, campaign), reward-grant ledger.
- **Service (SRP/DIP):** `ReferralService.generateCode/validateCode/attribute/qualify` with `AntiAbusePolicy` (self-referral block, velocity/per-user caps) and `ReferralRewardPolicy` (campaign-configurable values — admin-tunable in Sprint 13). Qualify hook subscribes to first-completed-order event (Sprint 7).
- **API:** `GET /member/referral` (code + stats), `POST /auth/...` referral-code apply at registration (extend Sprint 2), qualification triggered by order-completion event.
- **UI (`app/routes/app.me.tsx` referral row + Home surface):** code display, QR, share sheet, referral status/earnings view; registration referral field (from Sprint 2) wired to validation.
- **States:** invalid/duplicate code inline reason; pending vs rewarded states in referral view.

**Verification steps:**
1. Each member has a unique referral code + QR; "Share" opens native share sheet with code.
2. New user applying a valid code at registration receives extra welcome vouchers; applying as a non-first-time user is rejected.
3. Referrer reward grants only after referee's first qualifying purchase completes (not at signup).
4. Anti-abuse: self-referral blocked; per-user cap enforced; velocity throttled.
5. "Referral reward earned" notification fires to the referrer.

**Test flow:**
1. User A → Me → Refer a Friend → copy code / share.
2. New user B registers (Sprint 2) → enter A's code → B gets extra welcome vouchers.
3. B places + completes first qualifying order (Sprints 5–7).
4. A receives referral reward + notification; A's referral view shows B as "rewarded".
5. Try B referring A (self/circular) → blocked.
6. Exceed campaign per-user cap → further rewards blocked with reason.
