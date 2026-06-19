# Sprint 18: Admin Console — Compliance, CMS & Notifications/Campaigns

**Goal:** Complete the back-office: UU PDP compliance center, system/feature-flag settings, app-merchandising CMS, and the notification/campaign manager — closing the loop with the consumer Home (Sprint 11) and account-deletion requests (Sprint 10).

**User flows included:**
- Content & CMS (PRD §14.12): hero carousel banner management (16:9, text-safe-area, CMS deep links, scheduling start/end + priority — feeds Sprint 11 Home); promo/content row curation ("New Season", "For You"); empty/error-state + informational content; FAQ/Help, Terms of Service, Privacy Policy content; localization-ready externalized strings (Bahasa roadmap).
- Notifications & campaign management (PRD §14.13): transactional templates (order received/ready/out-for-delivery, crystals earned, voucher redeemed) — editable copy, multi-language; lifecycle & marketing campaigns (crystals expiring, tier-up, new launches/seasonal/collabs, birthday perks, referral earned) with segmentation (Sprint 16), scheduling, A/B testing, throttling; consent enforcement (onboarding consent + per-category opt-out; transactional follows OS permission); delivery analytics (sent/delivered/opened/converted).
- Compliance & system (PRD §14.16): UU PDP data-deletion request queue (consumes Sprint 10 requests) + data-export requests, consent records, retention policies, privacy/marketing-consent audit; feature flags/toggles (e.g., enable Delivery per market, roadmap features); country/region + currency config + payment-method enablement per market; OTP/login rate-limit & lockout config; global audit-log viewer (searchable/exportable); incident/maintenance banners.

**Depends on:** Sprint 11 (consumer Home banners + marketing-notification infra these manage), Sprint 16 (segments for campaigns), Sprint 10 (account-deletion requests this processes), Sprint 12 (RBAC/audit/console shell).

**Key implementation areas:**
- **Database:** `Banner`/`PromoRow` (admin-editable, schedule/priority/scope), `ContentPage` (FAQ/ToS/Privacy + i18n strings), `NotificationTemplate`, `Campaign` + delivery analytics, `ComplianceRequest` queue (deletion/export + status), `ConsentRecord`, `FeatureFlag`, `MarketConfig` (country/currency/payment-method enablement), `IncidentBanner`.
- **Service (SRP/DIP):** `CmsService` (writes banners/content read by Sprint 11 `MerchandisingService`); `CampaignAdminService` over `CampaignService`/`NotificationService` (Sprint 11) with `ConsentGate` + A/B + throttling; `ComplianceService` (UU PDP queue → anonymize/delete via `AccountDeletionService` from Sprint 10, audited); `FeatureFlagService` + `MarketConfigService` (versioned + reversible, §14.18). New campaign/content types added without touching transactional path (Open/Closed).
- **API (`app/api/routes.ts`):** CMS banner/content CRUD, template/campaign CRUD + analytics, compliance queue + process, feature-flag/market-config, audit-log viewer; `permissionGuard` (Marketing / Super Admin) + audited; deletion/export + feature-flag changes require elevated role + dual-approval/versioning (§14.19).
- **UI (`app/routes/console.*`):** banner/promo-row manager + scheduler, content/FAQ/ToS/Privacy editor (i18n), template editor, campaign builder (segment + A/B + schedule + throttle) + delivery-analytics dashboard, compliance center (request queue), feature-flag + market-config panel, global audit-log viewer.
- **States:** scheduled/active/expired content, campaign draft/sending/sent, compliance request pending/processing/done, flag versioning, approval-pending.

**Verification steps:**
1. CMS banner/promo-row + schedule changes appear on consumer Home (Sprint 11), respecting start/end + priority + country scope.
2. Campaign respects consent + per-category opt-out (transactional unaffected); A/B split + throttling work; delivery analytics (sent/delivered/opened/converted) populate.
3. A queued UU PDP deletion request (from Sprint 10) is processed → member data anonymized/deleted with audit trail; export request produces member-data export.
4. Toggling the Delivery feature flag per market flips the consumer Home Delivery card (Sprint 11 / §8.1).
5. Global audit-log viewer is searchable/exportable; feature-flag + deletion + export actions enforce elevated role + dual-approval/versioning.

**Test flow:**
1. As Marketing → create a hero banner (deep-link Rewards Store, schedule, priority) → consumer Home shows it in order (Sprint 11).
2. Edit ToS/Privacy content → consumer Help/Settings webview reflects it.
3. Build an A/B "birthday perk" campaign to a segment (Sprint 16) → send → opted-out members excluded; delivery analytics populate.
4. As Super Admin → open compliance queue → process a deletion request (Sprint 10) → member anonymized + audit entry; run a data-export request.
5. Toggle Delivery feature flag off for a market → consumer Home collapses to single pickup card.
6. Search the global audit log for a sensitive action → export results.
