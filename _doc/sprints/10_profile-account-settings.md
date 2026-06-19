# Sprint 10: Profile/Account, Settings & Notification Preferences

**Goal:** A user can manage their identity and preferences — profile info, saved addresses and payment methods, order history with one-tap reorder, settings (location/language/notification toggles, privacy/terms), and account deletion.

**User flows included:**
- Profile hub (PRD §8.8): "Me" page — avatar/name/masked phone, tier mini-badge, list rows.
- Order History & reorder: list of past orders; tap → detail; "Reorder" rebuilds the cart.
- Personal Information: edit name, email, gender, birthday, photo, contact number.
- Saved Addresses: add/edit/delete (used for delivery-tracking address context).
- Payment Methods: manage saved methods (tokens only, no PAN on device).
- Settings: location/country (drives outlets/menu/currency — ties to Sprint 2), app language (English now), per-category notification toggles, privacy policy, terms, account deletion (UU PDP).
- Notification preferences (PRD §11.3): granular marketing toggles; transactional follows OS permission.

**Depends on:** Sprint 2 (member/auth), Sprint 5 (orders for history/reorder + payment-method tokens).

**Key implementation areas:**
- **Database:** member profile fields, `addresses[]`, `paymentMethods[]` (gateway tokens only), `notificationPreferences` (per category), deletion-request record.
- **Service (SRP):** `ProfileService` (CRUD profile/address/payment-token), `PreferenceService` (toggle persistence + consent), `AccountDeletionService` (UU PDP request → queue consumed by admin Sprint 14). Photo upload via existing `app/modules/uploader`.
- **API:** `PATCH /member/me`, addresses + payment-method CRUD, `PATCH /member/preferences`, `POST /member/deletion-request`, `GET /orders` (history).
- **UI (`app/routes/app.me.tsx` + detail routes):** list rows pushing detail screens; edit forms with inline validation; immediate-save toggles; destructive confirm dialogs; "Log Out" ghost button.
- **States:** row skeletons; empty order history; deletion confirm + irreversible warning.

**Verification steps:**
1. Editing profile fields persists and reflects on Home greeting + membership card.
2. Order History lists past orders; Reorder rebuilds cart with original lines (respecting current availability).
3. Saved payment methods store tokens only — no PAN anywhere on device.
4. Notification toggles persist; turning off a marketing category stops those pushes (transactional unaffected).
5. Changing country updates outlet list/menu/currency. Account deletion files a request and logs out.

**Test flow:**
1. Me → Personal Information → change name + birthday → save → Home greeting updates.
2. Me → Order History → tap a past order → Reorder → cart rebuilt.
3. Me → Payment Methods → add a test card → stored as token (no PAN shown).
4. Me → Settings → toggle off "New launches" marketing → confirm those pushes stop; order pushes still arrive.
5. Settings → Location → switch country → menu/outlets/currency change.
6. Settings → Delete account → confirm → request queued, session ended.
