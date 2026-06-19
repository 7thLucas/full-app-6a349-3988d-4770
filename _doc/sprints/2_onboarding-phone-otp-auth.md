# Sprint 2: Onboarding & Phone-OTP Authentication

**Goal:** A new or returning user can sign in with phone + OTP, set country, complete a minimal profile, get auto-enrolled at Tang Seeker with welcome vouchers, and land on Home with a real session.

**User flows included:**
- First-time registration (PRD §8.9, §9.5): Country/region → phone entry → OTP (SMS/WhatsApp) → optional referral code field → permissions priming → minimal profile (name; optional birthday/gender/email + marketing consent) → welcome rewards deposited → Home.
- Returning login: phone → OTP → Home (system routes register vs login by whether number exists; no password).
- Session persistence & re-auth: returning user with valid session skips straight to Home; expired session routes back to phone+OTP and returns to prior screen.
- Change country later: Me → Settings → Location (sets active country driving outlets/menu/currency).

**Depends on:** Sprint 1.

**Key implementation areas:**
- **Module:** extend `app/modules/authentication` (scaffold exists) — do not create a new top-level module folder.
- **Database:** `Member` auth fields (phone, country, verified, session/refresh tokens), `OtpChallenge` (phone, code hash, channel, attempts, expiry), `consent` record. Auto-set tier=Tang Seeker on create.
- **Service (SRP/DIP):** `OtpService` interface with `SmsProvider`/`WhatsAppProvider` implementations (channel fallback); `AuthService.requestOtp/verifyOtp` issuing session; rate-limit + lockout on repeated failures (PRD §12, §18.2). Welcome-reward grant via `LoyaltyService.grantWelcomeRewards` (App users only; non-extendable expiry) — interface seam consumed later by Sprint 8.
- **API:** `POST /auth/otp/request`, `POST /auth/otp/verify`, `POST /auth/logout`, `GET /member/me`. Guard later endpoints with `authGuard`.
- **UI (`app/routes/onboarding.tsx` + steps):** country selector (default +62), phone field with inline validation, OTP boxes (auto-advance, SMS auto-read, masked resend timer → resend with channel fallback, shake on wrong code), optional referral code (copy-paste hint, only first-time), permission pre-prompts (Allow / Maybe later), minimal profile form, consent toggle. CTA spinners; graceful error banners.
- **Referral seam:** validate referral code at registration → flag for reward on referee's first purchase (full logic Sprint 9).

**Verification steps:**
1. New phone number → routed to registration; completes flow; `Member` created with tier Tang Seeker and welcome vouchers in wallet.
2. Existing phone number → routed to login; reaches Home without profile step.
3. OTP rate-limit: repeated wrong codes trigger lockout messaging; OTP expires per TTL.
4. Channel fallback: resend can switch SMS ⇄ WhatsApp.
5. Session survives app relaunch; forced expiry routes to phone+OTP then back.

**Test flow:**
1. Fresh install → Country = Indonesia (+62).
2. Enter new phone → receive OTP (test provider) → enter code.
3. Skip referral, allow/deny permissions, enter name + birthday, accept marketing consent → Get Started.
4. Land on Home; open Rewards → My Vouchers shows welcome reward set.
5. Log out → re-enter same phone → OTP → straight to Home (no profile step).
6. Enter malformed phone → CTA disabled + inline error.
