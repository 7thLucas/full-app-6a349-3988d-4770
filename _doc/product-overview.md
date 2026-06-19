Product Requirements Document (PRD)

Product Name: Hong Tang Mobile App (Indonesia)

Version: 1.4
Date: June 19, 2026
Author: Product Team
Status: Draft for review

Document Purpose: This PRD is the single source of truth for the Hong Tang Mobile App. It is written to be holistic and self-contained — any reader (designer, engineer, marketer, ops, or executive) should be able to fully understand and describe the app's vision, scope, features, flows, screens, business rules, and constraints by reading it end to end.

---

1. Product Vision & Concept

Hong Tang (红糖, "brown sugar") is Indonesia's pioneer and leading oriental dessert brand, serving Healthy Asian Desserts since 2012 — Taiwanese-style cold desserts and Hong Kong-style warm desserts, alongside drinks — across upscale malls nationwide. The Hong Tang Mobile App aims to provide a premium, seamless, and elevated digital experience that complements Hong Tang’s modern oriental dessert aesthetic. The app acts as a bridge between online convenience and offline craftsmanship, allowing users to effortlessly order high-quality, freshly-made oriental desserts and drinks, skip the queue with self-pickup, and be rewarded for their loyalty. The core concept is "Oriental Dessert Culture, Now in Your Pocket," emphasizing a calm, crafted user experience that drives customer retention through exclusivity and gamified rewards.

1.1. Product Goals

- Drive repeat purchase and retention through the "Loyal-Tang" rewards program and tiered membership.
- Reduce in-store wait times by shifting volume to order-ahead self-pickup.
- Capture first-party customer data (purchase history, preferences) to power personalization and CRM.
- Establish a direct marketing channel (push, in-app banners) for launches, campaigns, and collaborations.
- Reinforce the premium brand positioning through a polished, "Modern Oriental Minimalism" digital experience.

1.2. Success Metrics (KPIs)

- Adoption: app downloads, registered users, % of transactions through the app vs. POS.
- Engagement: monthly active users (MAU), order frequency per active user, D30 retention.
- Conversion: menu-view → add-to-cart rate, cart → paid order rate, checkout abandonment rate.
- Loyalty: % of users enrolled in Loyal-Tang, reward redemption rate, tier progression rate.
- Operational: average order prep time accuracy, pickup no-show rate.
- Commercial: app-attributed revenue, average order value (AOV), referral-driven new users.

1.3. Assumptions & Dependencies

- A POS/order-management system exists at each outlet and can accept and acknowledge app orders.
- A payment gateway and supported wallets are available per market (PCI DSS compliant).
- A loyalty/CRM backend issues, tracks, and expires Sugar Crystals and membership tiers.
- Outlet master data (location, hours, menu availability, prep capacity) is centrally maintained.
- Push notification infrastructure (APNs / FCM) and SMS OTP provider are available.

---

2. Target Audience

Modern Dessert Lovers: Health-conscious individuals looking for premium, freshly-made oriental desserts and drinks rather than mass-produced, artificially flavored sweets.

Busy Professionals & Students: Users who value convenience, time-saving (skipping the queue), and seamless digital payments.

Brand Loyalists & Enthusiasts: Customers engaged with the Hong Tang brand who want to participate in the "Loyal-Tang" program to earn rewards, access exclusive drops, and collect merchandise.

---

3. Key Features

Mobile Ordering (Self-Pickup): Browse the menu, customize desserts and drinks, and order ahead for self-pickup to avoid queues.

Delivery (via third-party platforms): The app is order-ahead self-pickup. Hong Tang delivery runs through third-party platforms (GoFood, GrabFood, ShopeeFood); orders placed there do not earn Sugar Crystals. Native in-app delivery is a roadmap item, not a current capability.

Loyalty Program ("Loyal-Tang" — two currencies): The program runs on two distinct currencies. (1) Sugar Crystals — reward points earned on paid purchases and spent in the Rewards Store on rewards, vouchers, and merchandise. (2) Bowls — a count of desserts/drinks purchased, used solely to determine membership tier. Spending Sugar Crystals does NOT lower a user's tier; tiers track Bowls independently.

Tiered Membership: Tiers are set by Bowls (items purchased) — Tang Seeker (0–9), Tang Explorer (10–39), Tang Pioneer (40–79), Tang Master (80+). All users auto-enroll in the Hong Tang Rewards Program on account creation, starting at Tang Seeker. Tier benefits include 15% off total bill, an additional discount on a second item, free desserts/drinks, birthday gifts/merch, exclusive VIP invites, and merchandise redemption.

Welcome Offer: Newly registered App users receive ONE set of New User Welcome Rewards in "My Vouchers." Existing Mini Program / H5 users are not eligible; unused welcome vouchers expire and cannot be extended.

Apple Wallet / Membership Pass: Users can add their digital membership card/pass to Apple Wallet for quick access and in-store scanning.

Digital Payment Integration: Seamless checkout using integrated digital payment methods (Credit/Debit, local e-wallets, grab-pay integrations).

Rewards Store & Vouchers: A dedicated space to browse available rewards, redeem Sugar Crystals, and manage active discount vouchers.

Store Locator: Find the nearest Hong Tang outlets, view operating hours, and get directions.

Referral Program: Invite friends using a unique code to earn rewards for both the referrer and the referee.

Promotions & New Launches: Push notifications and a dynamic homepage banner system for seasonal menus, limited-time offers, and brand collaborations.

Order Tracking & Status: Real-time order state (Received → Preparing → Ready → Collected) with notifications at key transitions.

Account & Profile: Passwordless phone-number authentication via OTP (SMS or WhatsApp); editable personal info (name, email, gender, birthday, photo, contact number), saved payment methods, saved addresses, order history, reorder, and country/location setting.

---

4. User Personas

Persona 1: The Commuter (Sarah, 28, Marketing Exec)

Goal: Wants her regular Brown Sugar Fresh Milk Tea ready by the time she walks from the MRT station to the office.

Pain Point: Hates waiting in line during the morning rush.

Behavior: Orders 3–4×/week, same drink, before 9am. Highly sensitive to prep-time accuracy and pickup reliability.

Persona 2: The Collector (Jason, 21, Student)

Goal: Wants to try every seasonal dessert, collect Sugar Crystals, and reach the "Tang Master" tier for exclusive merchandise and birthday perks.

Pain Point: Finds it hard to track his points and expiry dates without an app.

Behavior: Motivated by gamification, limited drops, and exclusive merch. Responsive to push notifications and tier-progression nudges.

Persona 3: The Convenience Seeker (Priya, 34, WFH Parent)

Goal: Orders for delivery while juggling work and family; values speed and minimal friction.

Pain Point: Doesn't want to leave the house; needs accurate delivery ETAs and easy reorder.

Behavior: Larger basket sizes (orders for the household), price-sensitive to delivery fees, uses vouchers.

---

5. User Stories

Epic 1: Ordering & Checkout

As a user, I want to view the full Hong Tang menu with high-quality images and descriptions so I can decide what to order.

As a user, I want to customize my dessert or drink (ice level, sugar level, toppings) so it perfectly suits my taste.

As a user, I want to select my preferred store location for self-pickup so my order is ready where I need it.

As a user, I want to see the estimated wait time before I pay, so I can plan my arrival.

As a user, I want to pay securely using my preferred digital wallet or credit card so checkout is fast.

As a user, I want to see clearly when an item or store is unavailable so I don't waste time building an unfulfillable order.

As a user, I want to reorder a past order in one tap so I can repeat my routine quickly.

Epic 2: Loyalty & Rewards (Sugar Crystals)

As a user, I want to automatically earn "Sugar Crystals" after my order is completed so I can build up my rewards balance.

As a user, I want to view my current membership tier and see how many more bowls/points I need to reach the next tier.

As a user, I want to browse a Rewards Store to see what I can exchange my Sugar Crystals for (e.g., vouchers, merch).

As a user, I want to apply a discount voucher to my cart during checkout to save money.

As a user, I want to be warned before my Sugar Crystals expire so I can use them in time.

Epic 3: Account & Engagement

As a user, I want to easily sign up/log in using my phone number and OTP for quick access.

As a user, I want to share my unique referral code with friends so we both get a reward when they make their first purchase.

As a user, I want to receive push notifications when my order is ready for pickup so I don't have to wait around the store.

As a user, I want to manage my notification preferences so I only get the messages I care about.

As a user, I want to update my profile, saved payment methods, and addresses so future orders are faster.

---

6. User Journeys

Journey 1: The Morning Routine (Order & Pickup)

Trigger: Sarah is on the train, 10 minutes away from the office.

Action: Opens the Hong Tang app, selects the outlet near her office.

Selection: Chooses her favorite drink from the "Recent Orders" or "Favorites" section. Adjusts sugar to 50%.

Checkout: Applies an available voucher, pays via saved e-wallet (GoPay/OVO/DANA) or QRIS.

Waiting: Receives an order confirmation with an estimated wait time (e.g., 8 mins).

Pickup: Receives a push notification: "Your order is ready!" Walks into the store, skips the queue, picks up the order from the designated counter, and leaves.

Post-Purchase: App updates her Sugar Crystals balance and tier progress.

Journey 2: Redeeming a Reward

Trigger: Jason receives an email/push that his Sugar Crystals are expiring soon.

Action: Opens the app and navigates to the "Rewards Store."

Discovery: Browses available items and selects a "Buy 1 Get 1 Free" voucher.

Redemption: Confirms the exchange of 100 Sugar Crystals for the voucher.

Usage: The voucher is saved to his "My Vouchers" wallet, ready to be applied on his next checkout flow.

Journey 3: First-Time Onboarding

Trigger: Priya downloads the app after seeing an in-store sign offering a welcome reward.

Action: Opens the app, enters her phone number, and verifies via OTP.

Setup: Grants notification and (optionally) location permissions; completes a minimal profile (name, optional birthday for perks).

Activation: Lands on the Home page with a welcome voucher already in her wallet and a prompt to place her first order.

Journey 4: Delivery Order (Where Supported)

Trigger: Priya wants desserts delivered during a busy afternoon.

Action: Opens the app, toggles to "Delivery," confirms her saved address.

Selection: Builds a multi-item household order, applies a voucher.

Checkout: Reviews delivery fee and ETA, pays via saved card.

Tracking: Follows order status until the order is delivered; earns Sugar Crystals on completion.

---

7. Design Guidelines (Design System)

This section is the visual and interaction contract for the app. Every screen in Section 8 inherits these rules; deviations must be justified.

7.1. Brand Principles & Voice

- Design ethos: "Modern Oriental Minimalism." Calm, crafted, premium, unhurried. Ample whitespace; let imagery and dessert craft breathe.
- Hierarchy: one clear primary action per screen. Reduce competing CTAs and visual noise.
- Tone of voice: warm, concise, confident. Dessert-forward language ("bowls", "Sugar Crystals", "Loyal-Tang"). Avoid hype/exclamation overload. Indonesian copy (when localized) keeps the same calm register.
- Premium cues: serif headers, soft shadows, restrained motion, generous spacing — never stark/clinical digital white.

7.2. Color

- Background: #FDFBF7 (textured cream / off-white). Never pure #FFFFFF for large surfaces.
- Primary (text & structure): #3E2723 (deep brown-sugar/wood brown). Default text, icons, structural lines.
- Accent / CTA / alert: #C62828 (Hong Tang Red). Reserved for the primary action, active states, badges, and urgent info — do not overuse.
- Secondary text / meta: warm grey #6F6258 on cream.
- Tier metallics (tier-dependent surfaces only): Bronze, Silver, Gold, Platinum gradients (Seeker→Master).
- Semantic: success green, warning amber, error = Hong Tang Red family; expiry/urgency always pairs color with a text label (never color alone).
- Usage rule: cream surface, brown content, red for the single most important action. Discounts shown in a positive accent, not alarm red.

7.3. Typography

- Pairing: elegant serif for display/headers; clean modern sans-serif for body/UI.
- Scale (reference): Display/serif header ~28–32pt; H1/section ~20–22pt bold sans; Body ~15–16pt regular; Caption/tasting-notes/meta ~12–13pt grey.
- Numerals: tabular figures for Sugar Crystals balance, prices, and totals; large weight for emphasis.
- Must support OS dynamic type / font scaling without breaking layout.

7.4. Spacing, Grid & Layout

- 8px base grid; spacing in multiples (8/16/24/32). Generous margins (~16–20pt screen gutters).
- Cards are the primary container; consistent internal padding (~16pt).
- One-thumb reach: primary CTAs anchored to a sticky bottom footer above the safe-area inset.

7.5. Shape, Elevation & Surfaces

- Corners: soft rounded (cards ~16px radius, buttons ~12px, pills/chips fully rounded).
- Elevation: subtle, low-spread drop shadows for cards and the bottom nav; modals sit on a dimmed scrim.
- Dividers: hairline warm-grey lines, used sparingly.

7.6. Iconography & Imagery (Assets)

- Icons: line-style, 24×24pt at 1.5–2px stroke, brown (#3E2723); active/selected = filled or Hong Tang Red. One icon family throughout.
- Dessert & drink imagery, two asset types: (a) 1:1 cut-out thumbnails (menu rows, ~88×88pt) on transparent PNG; (b) full-bleed hero shots (product detail). Shot on cream backdrop, consistent lighting/angle. Served at 1x/2x/3x.
- Brand banners: 16:9 cards, CMS-managed, with text in the safe left third; scheduled with start/end and priority order.
- Illustrations: warm, minimal line illustrations for empty/error states.
- Asset pipeline: all imagery CDN-served, responsive density, lazy-loaded with skeletons; max-width caps to protect data on mobile networks.

7.7. Core Components

- Buttons: Primary = full-width Hong Tang Red, white label; Secondary = outline/ghost (brown); Tertiary/links = brown text. Destructive = red text/ghost, never a loud filled red. States: default, pressed (scale ~0.97 + opacity), disabled (reduced opacity), loading (in-button spinner, disabled to block double-submit).
- Segmented controls: for mutually exclusive options (Ice, Sugar, tabs) — tactile, no dropdowns.
- Steppers: quantity "− N +" (min 1).
- Chips/pills: categories, applied vouchers (removable), filters.
- Cards: product, reward, loyalty, banner.
- Bottom sheets/modals: grabber handle, "X", dim scrim, swipe-down dismiss.
- Inputs: clear label, inline validation, error text beneath; OTP boxes auto-advance.
- Badges: red circle w/ white digits (cart count) — hidden at 0.
- Toasts/snackbars: lightweight, auto-dismiss confirmations.
- Steppers/progress: linear tier progress bar; order status stepper.
- Empty/error states: illustration + one-line explanation + a recovery CTA.

7.8. Motion

- Calm, eased transitions; nothing harsh or fast. Tab switch = cross-fade; push = slide; modal = spring slide-up.
- Micro-interactions: cart badge bump on add, button press scale, active-status pulse on the order stepper, optional gyroscope reflection on the membership card.
- Respect "reduce motion" OS setting (degrade to fades).

7.9. Interaction Model (Global)

- Navigation: tab-based root (bottom nav) + push stack per tab (each tab keeps its own back stack). Focused/transactional screens (Product Detail, Voucher picker, Payment method) open as bottom-up modal sheets; informational drill-downs (Order detail, outlet detail) push left-to-right.
- Back: system gesture/back button, sheet "X", or swipe-down on modals.
- Touch feedback: every tappable element has a pressed state and ≥44×44pt hit area.
- Loading: skeleton placeholders for lists/images on first paint (never bare spinners); in-button spinners for async actions.
- Feedback: success = toast/success modal; errors = inline or non-blocking banner; never a bare system alert for recoverable states.
- Gestures: swipe carousels/tabs; pull-to-refresh on Home, Order Status, Vouchers; swipe-to-delete cart rows (with confirm); swipe-down to dismiss sheets.
- States contract: every data-driven screen defines loading, populated, empty, and error states.

7.10. Accessibility

- AA contrast minimum for text and interactive elements (verify red-on-cream and grey captions).
- Tap targets ≥ 44×44pt.
- Dynamic type / font scaling support without clipping.
- Screen-reader labels on all icons and controls; meaningful focus order.
- No information by color alone (expiry uses red + text label).
- Honor reduce-motion and larger-text OS settings.

7.11. Localization in UI

- IDR currency formatting ("Rp 38.000"); WIB/WITA/WIT time handling.
- Layouts must absorb ~30% text expansion for future Bahasa Indonesia strings; no truncation of CTAs.
- All user-facing copy externalized for translation; no hard-coded strings.

---

8. App Pages & Detailed UI/UX Structure

Persistent Bottom Navigation Bar:

- Five items, fixed order: Home, Menu, Rewards, Cart, Profile. Cream surface with a hairline top border and subtle elevation; sits above the safe-area inset.
- Each item: 24pt icon + ~10–11pt label. Active item = Hong Tang Red filled icon + label; inactive = brown line icon. One active item at a time.
- Cart icon carries a numeric badge (red circle, white digits) reflecting item count; badge hidden at 0. Badge animates a small bump when an item is added.
- Tapping the already-active tab scrolls its content to top / pops to the tab root.
- The bar hides on full-screen modals (Product Detail, Checkout payment) to maximize focus.

8.1. Home / Dashboard Page

Look & Feel: Welcoming, highly visual, and efficient. Balances beautiful brand imagery with quick transactional buttons. Vertically scrolling content over the cream background.

Layout & Positioning (top → bottom):

1) Top Header (sticky, transparent over content):
- Left: Greeting "Good Morning, [Name]" (serif, time-of-day aware) with a smaller date/loyalty line beneath.

- Right: Floating circular QR/membership icon button (~44pt). Clickable → opens the membership QR/barcode as a bottom-up modal at max screen brightness for counter scanning.
2) Upper Fold (Hero Carousel):
- Horizontal auto-scrolling carousel of 16:9 banner cards with rounded corners; page-dot indicators centered below. Auto-advance ~5s; pauses on touch; swipeable manually.

- Each banner is clickable → resolves its CMS deep link (product detail, Rewards Store, or in-app webview for a campaign). Banners are scheduled (start/end) and ordered by priority.
3) Middle Section (Core Actions):
- Two side-by-side cards with drop shadows: "Order for Pickup" (stylized dessert bowl graphic) and "Delivery" (scooter/bag graphic). Each is a large tap target.

- "Order for Pickup" → Menu page in Pickup mode (prompts store selection if none set). "Delivery" → entry to delivery flow / store-or-address selection. If Delivery is unavailable, collapses to a single full-width "Order for Pickup" card.
4) Lower Middle (Loyalty Snapshot card):
- Horizontal card with tier-metallic gradient (e.g., Tang Explorer = silver). Shows tier name, Sugar Crystals balance in large tabular numerals, and a linear progress bar with "X bowls to [next tier]" label.

- Whole card clickable → Rewards page. Progress bar is display-only.
5) Personalized Strip (returning users):
- Horizontal scroller of "Recent Orders" / "Favorites" chips/cards, each with item thumbnail + name. Tap → adds to cart with last-used customization (or opens detail prefilled). Quick "reorder" path.
6) Promo / Content rows (optional): vertically stacked themed rows (e.g., "New Season", "For You") of horizontally scrolling product cards.

States: First-run → Loyalty Snapshot shows welcome state + "Place your first order" CTA; personalized strip hidden. Loading → skeleton for carousel + cards. Error → ret​ry banner; core action buttons remain usable offline-cached.

8.2. Menu / Order Page

Look & Feel: Functional, appetizing, organized. Emphasizes high-res cut-out dessert and drink images.

Layout & Positioning:

1) Top Sticky Header:
- Selected store row, e.g., "Hong Tang @ Mal Kelapa Gading Jakarta", with a "Change" text button (right) → opens Store Locator / store picker sheet.
- Pickup ⇆ Delivery segmented toggle directly beneath; switching re-validates cart/availability for the mode.
- Optional search icon → expands a search field filtering items live.
2) Category Navigation:
- Sticky horizontal pill bar using Hong Tang's real category structure (Signature, Taiwan Grass Jelly Series, Taiwan Soya Series, Taro, Taiwan Ice Pudding Series, Durian Dessert, Mango Dessert, Thai Mango Coco, Thai Coconut Ice, Classic, Fresh Milk Series, Beverages, …) OR left sidebar on larger screens. Tapping a category smooth-scrolls the main list to that section; the active pill auto-highlights as the user scrolls (scroll-spy). Pills are horizontally scrollable.
- Representative items (real Hong Tang menu — full reference list with prices in Appendix A / Section 17): Grass Jelly / Soya / Taro Signature; Taiwan Grass Jelly, Soya and Taro series (Signature/Classic/Favorite); Taiwan Ice Pudding (3 Mix Pudding); Durian and Mango desserts; Thai Mango Coco and Thai Coconut Ice; Classic warm desserts (Ginger Soup, Red Bean Soup, Ketan Hitam); Fresh Milk Series (Grass Jelly QQ 28, Tiger Pudding, Ginger Tangyuan); and Beverages (Tiger Milk, Royal Milk Tea, etc.). Warm (Hong Kong-style) vs. cold (Taiwanese-style) items are tagged so users can filter by serving temperature.
3) Main List (vertical, sectioned by category):
- Each item row: Left = 1:1 cut-out thumbnail (~88pt); Middle = item name (bold) + tasting-notes/description (grey caption) + price; Right = circular Red "+" button.
- Tapping the row (anywhere) → opens Product Detail modal. Tapping "+" directly → opens Product Detail (or, for zero-option items, adds straight to cart with a badge bump + toast).

Availability states: Sold-out items dimmed with a "Sold Out" / "Habis" tag and disabled "+"; store-unavailable items hidden. Empty search → friendly empty state. Loading → row skeletons.

8.3. Product Detail & Customization (Bottom-Up Modal)

Look & Feel: Focused, granular, tactile. Segmented controls over dropdowns.

Layout & Positioning (within the sheet):

1) Hero: Full-width item image bleeding to the top edge (no side margins). Drag-handle (grabber) at very top; circular "X" close button top-right (over image). Swipe-down to dismiss.

2) Title block: Item name (serif), price, and calorie/allergen line (if available).

3) Customization Zones (each a labeled group, top→bottom). Option groups adapt per item — drinks and iced desserts expose all three zones; warm desserts may omit Temperature/Ice and expose only Sugar and Toppings:
- Temperature/Ice: horizontal segmented control (Hot, Normal Ice, Less Ice, No Ice). Unsupported options are disabled (greyed) per item. Single-select.
- Sugar Level: segmented boxes / slider (100/70/50/30/0%). Single-select with a sensible default pre-selected.
- Toppings / add-ons: vertical checklist using Hong Tang's real topping set — Pearl/Bubble (boba), Q Ball, Mochi, Grass Jelly (Cingcau), Mango Pudding, Coconut Pudding, 3 Mix Pudding, Soya Pudding, Coconut Jelly, Peanut, Red Bean, Ketan (glutinous rice), Ronde (tangyuan), and Ice Cream — each row with name + a surcharge (representative "+ Rp 5.000–8.000" per add-on) and a checkbox/stepper. (Reference: Thai Mango Coco offers a "Pilihan Topping" of Mango Pudding, Coconut Pudding, Grass Jelly, Ketan, Pearl.) Multi-select, honoring min/max rules; exceeding max disables further selection with a hint.
4) Sticky Bottom Footer (always visible above keyboard/safe area):
- Left: quantity stepper "− 1 +" (min 1).
- Right: full-width Red CTA "Add to Cart · Rp 50.000" (real example — Grassjelly Signature; base + toppings + qty). Price recomputes live on every option/qty change.
- Tap CTA → validates required selections, adds to cart, dismisses sheet, bumps Cart badge, shows brief toast.

States: Defaults pre-set to the most common config for speed. Editing an existing cart line opens the same sheet prefilled, CTA reads "Update Cart". Loading → image skeleton; error adding → inline retry, sheet stays open.

8.4. Cart & Checkout Page

Look & Feel: Clean, secure, transactional. No distractions.

Layout & Positioning (top → bottom):

1) Fulfillment summary: Pickup store + prep estimate (e.g., "Prep Time: 10–15 mins"); in Delivery mode shows address + delivery ETA. "Change" affordance where applicable.

2) Order Summary List: Each line = thumbnail + item name + bulleted customizations beneath + line price. Row actions: "Edit" (pencil → reopens Product Detail prefilled) and "Delete" (trash → confirm, with swipe-to-delete alternative). Quantity adjustable inline.

3) Vouchers row: "Apply Promo Code or Voucher >" → opens voucher selection sheet (list of eligible vouchers + manual code field). Applied voucher shows as a removable chip; invalid/ineligible codes show an inline reason.

4) Payment ("Pay With"): Shows default saved method (e.g., GoPay or QRIS) with logo; "Change >" → payment-method sheet (QRIS, e-wallets, card).

5) Price breakdown: Subtotal, Discounts (negative, in red/green accent), Delivery Fee (if any), restaurant tax/PB1, Total (bold, large). Worked example (pickup, real prices): Grassjelly Signature Rp 50.000 + Royal Milk Tea Rp 19.000 = Subtotal Rp 69.000; voucher −Rp 10.000; PB1 10% on Rp 59.000 = Rp 5.900; Total Rp 64.900.

6) Sticky Bottom Footer: Full-width Red CTA — "Confirm Payment" or a "Slide to Pay" control for deliberate confirmation. Shows in-button spinner during processing; disabled to prevent double-charge.

Clickables: store/address change, edit/delete line, voucher row, payment change, CTA. Interactions: on success → push to Order Status; on payment failure → keep cart, show retry banner.

Edge cases: Item went unavailable after adding (prompt to remove/replace, block pay until resolved); store closed/past last-order (block checkout with explanation + suggest another store); empty cart → empty state with "Browse Menu" CTA.

8.5. Order Status / Tracking Page

Look & Feel: Reassuring, glanceable. A clear visual stepper.

Layout & Positioning:

1) Header: Order number, store (or delivery address), and a large current-status headline + estimated time.

2) Status Stepper: Vertical or horizontal stepper with completed/active/pending states — Pickup: Received → Preparing → Ready for Pickup → Collected; Delivery: Received → Preparing → Out for Delivery → Delivered. Active step animates (pulse).

3) Pickup proof: Membership/order QR shown for counter verification (tap to enlarge / brighten).

4) Order details: Itemized summary (collapsible), totals, and a "Need help?" link → support.

Interactions: live updates via push + pull-to-refresh; status transitions fire notifications. Terminal states (Collected/Delivered) surface a "Reorder" and "Rate" affordance. Loading → stepper skeleton.

8.6. Rewards ("Loyal-Tang") Page

Look & Feel: Premium, gamified. Tier-metallic accents (Bronze/Silver/Gold/Platinum) themed to the user's tier.

Layout & Positioning:

1) Digital Membership Card (top): Stylized card mirroring the physical aesthetic — User Name, Tier, member ID/QR, tier-metallic gradient, optional gyroscope reflection on tilt. Sugar Crystals balance shown prominently. Tapping the QR area enlarges it for scanning.

2) Tabbed Navigation (sticky under card): "Rewards Store" | "My Vouchers". Swipeable between tabs; active tab underlined in Hong Tang Red.

3) Rewards Store tab: 2-column grid of reward cards (image, title, Sugar Crystals cost in a colored pill). Affordable rewards have an enabled "Redeem"; unaffordable show cost with disabled state. Tap card → reward detail sheet → "Redeem" → confirm deduction → success modal "Voucher added to My Vouchers". Optional category filter chips.

4) My Vouchers tab: Vertical list of ticket-style cards with a dashed tear-line; each shows title, terms (min spend, eligible items), and expiry (expiry within 7 days rendered red + a text label, not color alone). Tap → voucher detail; "Use" can deep-link into an order. Expired/used vouchers shown in a dimmed, collapsed section.

5) Sugar Crystals history: Entry (link/icon) → transaction log list (earned / redeemed / expired) with dates and running balance.

States: Empty Rewards Store / empty Vouchers each have illustrated empty states; loading → card skeletons.

8.7. Store Locator Page

Look & Feel: Map-forward and practical.

Layout & Positioning:

1) Map (upper/full): Branded pins for outlets, centered on the user's location (with permission) or searched area. User-location dot; tapping a pin opens a peek card. Search field on top ("Search area / outlet"); "recenter" FAB.

2) List (lower sheet, draggable): Outlets sorted by distance — each row shows name, address, distance, open/closed status (with hours), and chevron. Hong Tang operates ~26 real outlets in upscale malls across Jakarta, Tangerang, Bekasi, Bandung, Bogor, Batam, Palembang and Surabaya (full verified list in Appendix A / Section 17) — e.g., Grand Indonesia, Mall Kelapa Gading 3, Central Park, Mall Taman Anggrek, Mall Artha Gading, Mall of Indonesia, Pondok Indah Mall 2, Lotte Shopping Avenue, PIK Avenue, Gandaria City (Jakarta); Summarecon Mall Serpong, AEON Mall, Gading Serpong, Broadway Alam Sutera (Tangerang); Summarecon Mall Bekasi; 23 Paskal (Bandung). Typical mall hours ~10:00–22:00 daily.

3) Outlet detail (push or expanded sheet): Full hours, address, "Get Directions" (→ native maps), and "Order from this store" (→ sets active store, returns to Menu). Optional call button.

Interactions: drag the list sheet up/down over the map; tap row ⇄ highlights pin. Permission-denied state → manual area search fallback. Loading → list skeleton.

8.8. Profile / Account Page ("Me")

Look & Feel: Minimalist, text-heavy utility page. The bottom-nav tab is labeled "Me".

Layout & Positioning:

1) Top: Avatar (default Hong Tang icon or uploaded photo, tappable → edit), Name, masked phone number. Optional tier mini-badge.

2) List menu (full-width rows, left icon + label + right ">"):
- Order History → list of past orders, each with "Reorder" (→ rebuilds cart) and tap → order detail.

- Personal Information → edit name, email, gender, birthday, profile picture, and contact number.

- Saved Addresses → manage/add/edit/delete addresses.

- Payment Methods → manage saved methods.

- Refer a Friend → unique code + QR + "Invite Now"/"Share" (→ native share sheet). (Also surfaced on Home.)

- Help & Support / FAQ → support/webview.

- Settings → Location (country), app language, notification toggles (per category), privacy policy, terms of service, account deletion.
3) Bottom: Centered, grey ghost "Log Out" (→ confirm dialog).

Interactions: each row pushes its detail; toggles save immediately; destructive actions confirm. Loading → row skeletons.

8.9. Authentication / Onboarding Screens

Look & Feel: Minimal, fast, trust-building. Full-screen steps with a progress sense and a top back affordance after step 1.

Account model (live behavior): Account is phone-number based — there is no password. The same phone-number + OTP flow serves both first-time registration and returning login; the system routes to "register" vs "log in" based on whether the number exists. All users auto-enroll in the Hong Tang Rewards Program (Tang Seeker) on account creation.

Flow & Interactions:

1) Country / Region: The app is multi-country and does not auto-select the user's outlet; the active country drives outlet list, menu, and currency. Country is set at start and changeable later via Me > Settings > Location.

2) Phone Entry: Country-code selector (default +62 Indonesia) + numeric phone field; primary CTA "Continue" enabled only when valid. Links to Terms/Privacy beneath.

3) OTP Verification: 4–6 box numeric input with auto-advance and SMS auto-read where supported. OTP is delivered via SMS or WhatsApp. Masked resend timer ("Resend in 0:30") then enabled "Resend" (with channel fallback); error shake + inline message on wrong code; lockout messaging after repeated failures. (Help-path for non-delivery: reinstall app, stable network, retry via SMS/WhatsApp, or try another device.)

4) Referral Code (optional): During first-time registration the user may enter a friend's referral code. The field is optional; copy-paste is recommended to avoid input errors. Only first-time users can apply a code. A valid code grants extra welcome vouchers.

5) Permissions Priming: Contextual pre-prompts (value-first copy) for notifications and location, each with "Allow" / "Maybe later" before the OS dialog. Skippable. (Location is convenience-only — outlet selection is always manual.)

6) Minimal Profile: Name (+ optional birthday for perks, gender, email — all editable later under Personal Information) and marketing-consent toggle; "Get Started" completes setup.

Activation: On successful registration, ONE set of New User Welcome Rewards is deposited in "My Vouchers" (vouchers expire and cannot be extended), and the user lands on Home.

States: Inline validation throughout; CTA spinner during network calls; graceful error banners for OTP/network failures. Returning users with an existing session skip straight to Home.

---

9. Key User Flows

9.1. Order Flow (Pickup)

Home -> Tap 'Order for Pickup' -> Select Outlet -> Browse Menu -> Select Item -> Select Customizations (Ice/Sugar/Toppings) -> Add to Cart -> Go to Cart -> Apply Voucher (Optional) -> Select Payment Method -> Confirm Payment -> Order Status Page (Received -> Preparing -> Ready -> Collected).

9.2. Order Flow (Delivery)

Home -> Tap 'Delivery' -> Confirm/Select Address -> Browse Menu -> Add Items -> Go to Cart -> Apply Voucher (Optional) -> Review Delivery Fee & ETA -> Select Payment Method -> Confirm Payment -> Order Status Page (Received -> Preparing -> Out for Delivery -> Delivered).

9.3. In-Store Loyalty Earning Flow

Home -> Tap Membership Barcode/QR Icon -> Present to Cashier -> Cashier Scans -> Purchase Completed via POS -> Push Notification: "You earned X Sugar Crystals" -> Dashboard updates balance.

9.4. Voucher Redemption Flow

Home -> Navigate to 'Rewards' -> Browse Rewards Store -> Select Reward -> Tap 'Redeem' -> Confirm deduction of Sugar Crystals -> Success Modal: "Voucher Added to Wallet".

9.5. Onboarding / Registration Flow

Launch -> Select Country/Region -> Phone Entry -> OTP Verification (SMS/WhatsApp) -> [Optional] Enter Referral Code -> Permissions Priming -> Minimal Profile (name; optional birthday/gender/email) -> Welcome Rewards deposited to My Vouchers -> Home. (Returning users: Phone Entry -> OTP -> Home.)

9.6. Referral Flow

Home (or Me) -> 'Refer a Friend' -> 'Invite Now' / Share Code -> Friend installs & enters code during first-time registration (optional, copy-paste) -> Friend completes first qualifying purchase -> Referrer receives referral reward; referee keeps welcome vouchers.

---

10. Business Rules & Logic

10.1. Loyalty — Two Currencies

The program separates the spending currency (Sugar Crystals) from the status currency (Bowls). All users auto-enroll on account creation.

Sugar Crystals (reward points / redemption currency):

- Earning: Earned on all purchases where a payment amount is made and the order status is Completed.
- Earn rate: 1 Sugar Crystal per Rp 1,000 of qualifying net spend, where net spend = order subtotal after discounts/vouchers and excludes PB1/restaurant tax, delivery fee, and non-qualifying items (see Exclusions).
- Tier earn multiplier: applied to base crystals per order — Tang Seeker 1.0×, Tang Explorer 1.25×, Tang Pioneer 1.5×, Tang Master 2.0×.
- Rounding: compute (net spend ÷ Rp 1,000) × tier multiplier, then floor to the nearest whole Sugar Crystal per order. No fractional crystals; an order with Rp 0 qualifying net spend earns 0.
- Exclusions: No Sugar Crystals on free items, items discounted to Rp 0, trial/tasting items, special-discounted products, or orders placed via third-party delivery platforms (GoFood, GrabFood, ShopeeFood).
- Walk-in earning: The user presents the App member QR code for counter staff to scan at the time of the transaction. If it is not scanned, points cannot be added later.
- Expiry: Sugar Crystals are valid for 365 days from the date earned. Each batch follows its own 365-day cycle, so later-earned balances keep their own expiry. The App shows expiry reminders on the 'Sugar Crystals' page. Expired Sugar Crystals cannot be reinstated.
- Redemption: Spent in the Rewards Store; redeeming produces a voucher in "My Vouchers." Redeeming does not affect membership tier.

Bowls (membership status currency):

- A count of qualifying items (desserts/drinks) purchased, used solely to determine tier and tracked independently of Sugar Crystals.
- Counting: 1 Bowl per qualifying item on a paid, Completed order; quantity counts (ordering 2 of the same item = 2 Bowls). Exclusions mirror Sugar Crystals (free/Rp 0/trial/tasting/special-discount items and third-party-platform orders do not count).
- Counting window: tier is determined by Bowls accumulated over a rolling, trailing 365-day window (older Bowls age out of the window).

10.2. Membership Tiers

| Tier          | Bowls Requirement |
| ------------- | ----------------- |
| Tang Seeker   | 0 ≤ Bowls < 10    |
| Tang Explorer | 10 ≤ Bowls < 40   |
| Tang Pioneer  | 40 ≤ Bowls < 80   |
| Tang Master   | Bowls > 80        |

- Entry: Tang Seeker is granted automatically on account creation.
- Progression: Driven by accumulated Bowls (items purchased) in the trailing-365-day window, not by spending Sugar Crystals.
- Tier-up: applied in real time the moment Bowls cross the next threshold; triggers a tier-up congratulations notification.
- Maintenance & downgrade: tier is recalculated against the trailing-365-day Bowls at each calendar month-end. Downgrades apply only at this recalc (never mid-month), drop at most one tier per recalc, and include a one-cycle grace period plus advance notice before taking effect. Tang Seeker is the floor (no downgrade below it).

Per-tier benefit allocation (escalating; each tier inherits all lower-tier benefits):

| Benefit                           | Seeker                | Explorer        | Pioneer         | Master                      |
| --------------------------------- | --------------------- | --------------- | --------------- | --------------------------- |
| Sugar Crystals earn multiplier    | 1.0×                  | 1.25×           | 1.5×            | 2.0×                        |
| Rewards Store access & redemption | ✓                     | ✓               | ✓               | ✓                           |
| Welcome rewards (new user)        | ✓                     | ✓               | ✓               | ✓                           |
| Birthday gift                     | drink/dessert voucher | + merch voucher | + premium merch | + premium merch & surprise  |
| Early access to seasonal launches | —                     | ✓               | ✓               | ✓                           |
| Second-item discount voucher      | —                     | occasional      | ✓               | ✓                           |
| 15%-off-total-bill voucher        | —                     | —               | periodic        | periodic (higher frequency) |
| Free-item milestone reward        | —                     | —               | ✓               | ✓                           |
| Exclusive merchandise redemption  | —                     | —               | ✓               | ✓                           |
| VIP invites & member-only events  | —                     | —               | —               | ✓                           |
| Priority support / concierge      | —                     | —               | —               | ✓                           |

- Members' Day Special and exclusive membership events are run via the App.

10.3. Vouchers

- Each voucher defines: discount type/value, eligible items/categories, minimum spend, and validity window.
- Stacking: Not allowed. Exactly one voucher OR one promo code per order — vouchers cannot combine with each other, and a voucher cannot combine with a promo code. Applying a new one replaces the current applied discount.
- Application: Validated at checkout against the current cart and selected fulfillment mode (pickup/delivery).

10.4. Ordering & Fulfillment

- Store selection is required before menu browsing; menu availability and prep times are store-specific.
- Orders cannot be placed when a store is closed or past its last-order cutoff.
- Prep-time/ETA estimates are surfaced before payment and on the Order Status page.
- Payment methods (ID): QRIS, e-wallets (GoPay, OVO, DANA, ShopeePay, LinkAja), and credit/debit card (Visa/Mastercard).
- Order edits: not permitted after payment is confirmed. Once paid, an order is locked — items, customizations, quantity, store, and fulfillment mode cannot be changed. To change anything the user must cancel within the cancellation window (refund to original method) and place a new order. All editing affordances (Edit/Delete cart lines, change store/voucher/payment) exist only in the pre-payment Cart & Checkout stage.
- Refunds: processed to the original payment method; allow up to 15 working days depending on the bank/payment provider.
- Cancellation: if an order is placed but shows "Cancelled," the system auto-cancelled it and a refund is issued to the original payment method. If the App has already shown an extended estimated wait time and the user knowingly proceeds during peak hours, cancellation on wait-time grounds does not apply. Design priority: a clear cancellation window plus realistic, dynamic prep-time estimates, since wait-time transparency is a key user concern under peak load.

10.5. Referrals

- Each user has a unique referral code (found via Home/Me > Refer a Friend > Invite Now). Entering a code is optional and only first-time registrants can apply one (copy-paste recommended to avoid input errors).
- The referee signs up with the code and receives welcome vouchers; the referrer earns rewards (free Hong Tang desserts/drinks, discount vouchers, and gift items) once the referee successfully registers and meets the requirements (first qualifying purchase). Reward values and anti-abuse limits (per-user caps) are set by the active campaign.

10.6. Worked Examples (loyalty math, using real menu prices)

All examples use the earn rule from 10.1 (1 Sugar Crystal per Rp 1,000 qualifying net spend × tier multiplier, floored) and the tier rules from 10.2.

Example A — Sugar Crystals earn (Tang Seeker, 1.0×):

- Cart: Grassjelly Signature Rp 50.000 + Royal Milk Tea Rp 19.000 = Subtotal Rp 69.000; voucher −Rp 10.000 → net spend Rp 59.000 (PB1/tax excluded).
- Base = 59.000 ÷ 1.000 = 59 → × 1.0 = 59 → floor = 59 Sugar Crystals earned.
- Bowls: +2 (two qualifying items).

Example B — same cart at higher tier (Tang Pioneer, 1.5×):

- Net spend Rp 59.000 → 59 × 1.5 = 88.5 → floor = 88 Sugar Crystals.

Example C — tier-up (real-time):

- User has 9 Bowls (Tang Seeker). Buys 2 items → 11 Bowls in trailing-365-day window → crosses the 10 threshold → immediately upgraded to Tang Explorer; tier-up notification fired.

Example D — downgrade (month-end recalc):

- User at 45 Bowls (Tang Pioneer). Over the next months older Bowls age out of the trailing-365-day window; at a month-end recalc the window total is 38 (< 40). After the one-cycle grace + advance notice, tier drops one level to Tang Explorer (never mid-month, max one tier per recalc).

Example E — no voucher stacking:

- Cart has Voucher A ("Rp 10.000 off") applied. User enters promo code B ("15% off"). Per Rule 10.3, B replaces A (not added); the breakdown shows only B's discount.

Example F — Sugar Crystals expiry batches:

- 59 crystals earned 2026-06-19 expire 2027-06-19. A later batch earned 2026-09-01 expires 2027-09-01 — each batch keeps its own 365-day clock; the app warns within 7 days of each batch's expiry.

---

11. Notifications

11.1. Transactional (Push, default on)

- Order received / confirmed.
- Order ready for pickup ("Your order is ready!").
- Out for delivery / delivered.
- Sugar Crystals earned after a purchase.
- Reward/voucher successfully redeemed.

11.2. Lifecycle & Marketing (Push/Email, user-controllable)

- Sugar Crystals expiring soon.
- Tier progression and tier-up congratulations.
- New launches, seasonal menus, and collaborations.
- Birthday perks and exclusive member offers.
- Referral reward earned.

11.3. Controls

- Granular toggles in Settings for marketing categories; transactional notifications follow OS-level permission. Respect marketing consent captured at onboarding and applicable regulations.

---

12. Non-Functional Requirements

Performance: The menu should load in under 2 seconds. The app must handle high traffic during new product launches or "Members' Day" promotions. Target smooth 60fps scrolling and responsive interactions on mid-tier devices.

Reliability: Graceful handling of network loss (retry, cached menu where possible). Order placement must be idempotent to avoid duplicate charges on retry.

Security: Secure payment gateways (PCI DSS compliance). Data encryption in transit (TLS) and at rest for personal and financial information. Secure OTP login with rate limiting and lockout on repeated failures. No card data stored on-device.

Privacy & Compliance: Comply with Indonesia's Personal Data Protection Law (UU No. 27/2022, "UU PDP"). The app collects financial information, contact details, and user content for advertising, analytics, and app functionality; these uses are disclosed and consented. Provide privacy policy, marketing consent management, and account/data deletion. Collect only the minimum data needed.

Localization: Currency in Indonesian Rupiah (IDR / "Rp"), with prices formatted in the local convention (e.g., Rp 38.000). The app is currently English; Bahasa Indonesia support is a roadmap item. Locale-aware formatting of prices, dates, and numbers (WIB/WITA/WIT time zones).

Accessibility: Meet WCAG AA-equivalent baselines (contrast, tap targets, screen-reader labels, dynamic type) as detailed in Section 7 (Design Guidelines).

Platform: Native or cross-platform framework (React Native/Flutter) optimized for both iOS (App Store) and Android (Google Play). Support for current and prior two major OS versions.

Analytics & Instrumentation: Track the funnel and KPIs in Section 1.2 (screen views, add-to-cart, checkout steps, payment success/failure, redemptions, referral conversions) via an analytics platform, respecting consent.

---

13. Out of Scope (Current Version)
- Native in-app delivery (ordering, payment, fulfillment, in-house fleet management, live courier GPS). Not pursued in this version. Delivery purchase/fulfillment is handled entirely by third-party platforms (GoFood, GrabFood, ShopeeFood); those orders do not earn Sugar Crystals or Bowls. The app's "Delivery" surfaces are limited to order tracking/status display only (Received → Preparing → Out for Delivery → Delivered) where a status feed is integrated — the app does not take the delivery order or payment itself.
- In-app social feed / community features.
- Multi-language user-generated content (reviews/ratings).
- Web ordering / desktop experience.

---

14. Admin Panel (Back-Office / Operations Console)

The Admin Panel is the web-based back-office that powers and oversees everything described in Sections 1–13. It is the operational counterpart to the consumer app: every customer-facing object (order, member, voucher, reward, banner, outlet, payment) is created, configured, monitored, and audited here. It is role-gated, fully audit-logged, and shares the same backend/CRM, loyalty engine, CMS, and payment gateway the app consumes.

14.1. Platform Principles

- Web responsive console (desktop-first); same "Modern Oriental Minimalism" brand language adapted for data-density (Hong Tang Red reserved for primary/destructive actions, cream/brown neutrals).
- Role-Based Access Control (RBAC): every module is permission-scoped (view / edit / approve). Sensitive actions (refunds, Sugar Crystals adjustments, member data export, account deletion) require elevated roles and, where configured, maker-checker (dual approval).
- Multi-country / multi-outlet aware: all data filterable and scopable by country (drives outlet list, menu, currency per Section 8.9) and by outlet; regional managers see only their scope.
- Audit log on every create/update/delete/approve with actor, timestamp, before/after values, and reason field where required.
- All money shown in the relevant market currency (IDR formatting "Rp 38.000"); all times locale/timezone-aware (WIB/WITA/WIT).

14.2. Roles & Permissions (reference set)

- Super Admin: full access incl. RBAC, feature flags, compliance, finance.
- Operations / Ops Manager: orders, outlets, menu availability, prep-time config.
- Store / Outlet Manager: scoped to own outlet(s) — live orders, availability, hours.
- Marketing / CRM: banners/CMS, push/email campaigns, vouchers, promos, referral campaigns, segments.
- Loyalty Manager: Sugar Crystals rules, Bowls/tier config, Rewards Store catalog.
- Finance: transactions, reconciliation, refunds, payment-gateway reports.
- Support / CS Agent: member lookup, order assistance, ticket handling, limited adjustments.
- Auditor (read-only): all data + audit logs, no mutations.

14.3. Dashboard & Analytics (Home of the console)

- KPI overview tied to Section 1.2: downloads, registered users, % app vs. POS transactions, MAU, order frequency, D30 retention, AOV, app-attributed revenue.
- Conversion funnel: menu-view → add-to-cart → cart → paid order; checkout abandonment rate; payment success/failure rate.
- Loyalty health: % enrolled in Loyal-Tang, redemption rate, tier-progression rate, tier distribution (Tang Seeker/Explorer/Pioneer/Master), Sugar Crystals issued vs. redeemed vs. expired.
- Operational health: avg order prep-time accuracy, pickup no-show rate, cancellation rate, live order volume per outlet.
- Filters: date range, country, outlet, fulfillment mode (pickup/delivery), channel. Compare-to-prior-period, export to CSV/Excel, scheduled email reports.
- Real-time vs. historical toggle; drill-down from any KPI to the underlying records.

14.4. Order Management

- Live order board per outlet: incoming orders with state Received → Preparing → Ready → Collected (pickup) / Out for Delivery → Delivered (delivery), color-coded, with prep-timer and SLA breach alerts.
- Manual state transitions / overrides with reason; bulk actions; reprint/resend order to POS.
- Order detail: items + customizations (Ice/Sugar/Toppings), price breakdown (subtotal, discounts, delivery fee, PB1/tax, total), applied vouchers, payment method/status, member, fulfillment store/address, QR/order number.
- Cancellation handling: trigger auto-cancel + refund per Rule 10.4; surfaces whether cancellation-on-wait-time-grounds applies (peak-hour proceed flag).
- Search/filter by order #, member, outlet, status, date, payment status, channel (app vs. third-party note).
- Third-party orders (GoFood/GrabFood/ShopeeFood) visible for reconciliation but flagged as non-Sugar-Crystals-earning.

14.5. Menu & Catalog Management

- Items CRUD: name, tasting-notes/description, category (Signatures, Grass Jelly Desserts, Mango & Fruit Desserts, Warm Desserts, Smash Ice & Ice Cream Crush, Beverages, Seasonal), price, calorie/allergen info, imagery (1:1 cut-out + hero, 1x/2x/3x per Section 7.6).
- Customization option groups per item: Temperature/Ice (Hot/Normal/Less/No Ice), Sugar (100/70/50/30/0%), Toppings (with surcharge, min/max rules), per-item enable/disable of options, default selections.
- Category management and ordering (drives Menu page pill bar / scroll-spy).
- Availability matrix: per-outlet stock/sold-out ("Habis") toggles, store-unavailable hide, scheduled availability for seasonal/limited drops.
- Pricing: per-country/per-outlet price overrides; effective-dated price changes.
- Preview-as-app before publish; draft vs. published states.

14.6. Outlet / Store Management

- Outlet CRUD: name (e.g., "Hong Tang @ Mal Kelapa Gading Jakarta"), address, geo-coordinates (map pin), country/region, contact, photos.
- Operating hours per day + holiday overrides; last-order cutoff; open/closed status drives app Store Locator and checkout blocking (Rule 10.4).
- Prep-capacity / dynamic prep-time settings, including peak-hour extended-wait estimates surfaced to users.
- Fulfillment flags: pickup enabled, delivery enabled (toggles the Home "Delivery" card / collapses to single pickup card per Section 8.1).
- POS integration status & health per outlet.

14.7. Membership & Customer (CRM) Management

- Member directory: search by phone/name/member ID; profile view (name, email, gender, birthday, photo, masked contact, country, marketing-consent state, saved addresses, saved-payment metadata — never raw card data).
- Loyalty state per member: current tier (Tang Seeker→Master), Bowls count, Sugar Crystals balance with per-batch expiry, lifetime earned/redeemed/expired.
- Manual adjustments (privileged, audited, reason required): grant/deduct Sugar Crystals, adjust Bowls/tier, issue goodwill vouchers, re-issue welcome rewards in edge cases.
- Activity timeline: orders, redemptions, referrals, notifications, support tickets.
- Account actions: suspend, merge duplicates, process account/data-deletion request (Section 12 / UU PDP), export member data.
- Segmentation builder (by tier, spend, recency/frequency, location, consent) feeding campaigns and vouchers.

14.8. Loyalty Engine Configuration (Loyal-Tang)

- Sugar Crystals rules: earn rate (per item / per currency unit) and rounding; exclusions (free items, Rp 0 items, trial/tasting, special-discount, third-party orders per Rule 10.1); 365-day per-batch expiry policy; expiry-reminder schedule.
- Bowls rules: what counts as a qualifying item, counting window, and tier-maintenance/downgrade rules (open items per Section 15).
- Tier configuration: thresholds (Seeker 0–9, Explorer 10–39, Pioneer 40–79, Master 80+), per-tier benefits (15% off, second-item discount, free items, birthday gifts/merch, VIP invites, member-only events, merch redemption), and tier-metallic theming.
- Walk-in earning: member-QR scan validation rules (no retroactive points if unscanned).

14.9. Rewards Store Management

- Reward catalog CRUD: image, title, description, Sugar Crystals cost, type (voucher / merch / experience), inventory/stock caps, per-user redemption limits, validity window, category filters.
- Redemption → voucher mapping: which voucher is granted to "My Vouchers" on redeem; success-modal copy.
- Eligibility (tier-gated rewards, country/outlet scope); enable/disable & scheduling.
- Redemption monitoring: live redemptions, stock depletion alerts, fraud/abuse flags.

14.10. Vouchers, Promotions & Discounts

- Voucher builder: discount type/value (% / fixed / BOGO), eligible items/categories, minimum spend, validity window, stacking rules (default one voucher per order unless configured), fulfillment-mode eligibility (pickup/delivery), usage caps (per-user / global).
- Promo-code management: manual codes, batch/unique-code generation, redemption tracking, expiry.
- Welcome Offer config: the New User Welcome Rewards set deposited on registration (App users only; Mini Program/H5 excluded; non-extendable expiry per Section 3).
- Campaign scheduling with start/end and priority; preview validation against a sample cart.
- Performance reporting per voucher/promo (issued, applied, revenue impact, redemption rate).

14.11. Referral Program Management

- Configure referrer & referee rewards (free Hong Tang desserts/drinks, discount vouchers, gift items), qualifying condition (referee's first qualifying purchase), and anti-abuse limits (per-user caps).
- Referral-code registry, attribution tracking, conversion funnel, fraud detection (self-referral, velocity).
- Per-campaign reward values and enable/disable windows.

14.12. Content & CMS (App Merchandising)

- Hero carousel banners (16:9): upload, text-safe-area guidance, CMS deep links (product detail / Rewards Store / in-app webview), scheduling (start/end) and priority ordering per Section 8.1.
- Home promo/content rows ("New Season", "For You") curation.
- Empty/error-state and informational content, FAQ/Help, Terms of Service, Privacy Policy content management.
- Localization-ready string management (externalized copy, supports future Bahasa Indonesia per Section 7.11).

14.13. Notifications & Campaign Management

- Transactional templates (order received/ready/out-for-delivery, Sugar Crystals earned, voucher redeemed) — editable copy, multi-language.
- Lifecycle & marketing campaigns (push/email): Sugar Crystals expiring, tier-up, new launches/seasonal/collabs, birthday perks, referral earned — with audience segmentation, scheduling, A/B testing, and throttling.
- Consent enforcement: respect onboarding marketing consent and per-category opt-outs; transactional always follows OS permission.
- Delivery analytics: sent / delivered / opened / converted.

14.14. Payments & Finance

- Transaction ledger: per-order payment records (method: QRIS, GoPay/OVO/DANA/ShopeePay/LinkAja, Visa/Mastercard), status (authorized/paid/failed/refunded), gateway references — no raw card data stored.
- Refunds: initiate/track to original method, up to 15 working days (Rule 10.4), with approval workflow and reason.
- Reconciliation: app vs. POS vs. gateway settlement; mismatch flags; payout/settlement reports.
- Tax/PB1 reporting; revenue breakdown by outlet/country/period; chargeback/dispute tracking.

14.15. Reports & Data Export

- Standard reports: sales, product performance, loyalty (issuance/redemption/expiry/liability), tier movement, voucher/promo ROI, referral, retention/cohort, operational SLA.
- Custom report builder with saved views, scheduled delivery, CSV/Excel/API export.
- Sugar Crystals liability report (outstanding balance valuation) for finance.

14.16. System, Compliance & Settings

- Feature flags / toggles (e.g., enable Delivery per market, roadmap features).
- Country/region & currency configuration; payment-method enablement per market.
- Admin user & RBAC management; session/security policy; SSO (if used); OTP/login rate-limit & lockout configuration for the consumer app.
- Compliance center (UU PDP): data-deletion request queue, consent records, data-export requests, retention policies, privacy/marketing-consent audit.
- Global audit log viewer (searchable, exportable); incident/maintenance banners.

14.17. Support / CS Tooling

- Member & order lookup, impersonate-view (read-only) of a member's app state for troubleshooting.
- Ticket/CRM integration; canned actions (resend receipt, re-trigger notification, issue goodwill voucher/Sugar Crystals within limits).
- Help & FAQ content management feeding the in-app Help & Support webview.

14.18. Non-Functional (Admin)

- Same security baseline as Section 12: TLS in transit, encryption at rest, least-privilege RBAC, full audit trail; PCI-DSS scope — no card data exposed to admins.
- Performance for large datasets (pagination, server-side filtering, async export).
- High availability during peak/launch/Members' Day events; changes to live config are versioned and reversible.

14.19. Field-Level Reference (key admin entities, screens & permissions)

Field lists for the core back-office objects. "List columns" = the table view; "Detail/Editable" = the record form; "Filters" = list-screen filters. All mutations are audit-logged (actor, timestamp, before/after, reason where noted).

Order (Module 14.4):

- List columns: Order # · Member (name/masked phone) · Outlet · Channel (App/GoFood/GrabFood/ShopeeFood) · Fulfillment (Pickup/Delivery) · Status · Item count · Total (Rp) · Payment status · Placed-at · Prep SLA timer.
- Detail (read-mostly): line items + customizations (Ice/Sugar/Toppings) · price breakdown (Subtotal, Discount, Delivery Fee, PB1, Total) · applied voucher/promo · payment method + gateway ref · QR/pickup code · timeline (state transitions w/ timestamps).
- Editable/actions: state override (reason required) · resend-to-POS · cancel + refund · contact member. No item edits post-payment (mirrors Rule 10.4).
- Filters: date range · outlet · status · payment status · channel · fulfillment mode · SLA-breached.
- Permissions: Store Manager (own outlet, state override) · Ops (all outlets) · Finance/Support (refund — elevated, maker-checker if configured).

Member (Module 14.7):

- List columns: Member ID · Name · Masked phone · Tier · Bowls (rolling 365d) · Sugar Crystals balance · Country · Joined · Marketing consent · Status.
- Detail/Editable: name, email, gender, birthday, photo, contact, country, addresses, marketing-consent (edit) · loyalty panel (tier, Bowls, per-batch Sugar Crystals w/ expiry, lifetime earned/redeemed/expired) · activity timeline · saved-payment metadata (read-only, no PAN).
- Privileged actions (audited, reason required): grant/deduct Sugar Crystals · adjust Bowls/tier · issue goodwill voucher · re-issue welcome rewards · suspend · merge duplicates · process data-deletion/export (UU PDP).
- Filters: tier · Bowls range · spend/recency/frequency · country · consent · join date.
- Permissions: Support (view + limited goodwill within caps) · Loyalty Manager (crystals/tier adjust) · Super Admin (delete/export).

Menu Item (Module 14.5):

- List columns: Item name · Category · Base price (per country) · Temperature tag (warm/cold) · Status (draft/published) · Availability (per outlet) · Updated-at.
- Detail/Editable: name · description/tasting-notes · category · base price + per-outlet/country overrides (effective-dated) · calorie/allergen · imagery (1:1 + hero, 1x/2x/3x) · option groups (Ice/Sugar/Toppings) with per-item enable, defaults, min/max, surcharges · serving-temperature tag.
- Filters: category · status · availability · outlet · temperature.
- Permissions: Ops/Loyalty-or-Marketing (edit) · Store Manager (availability/sold-out toggle only).

Voucher / Promo (Module 14.10):

- List columns: Title/Code · Type (%/fixed/BOGO) · Value · Min spend · Eligible scope · Fulfillment eligibility · Validity window · Usage (used/cap) · Status.
- Detail/Editable: discount type/value · eligible items/categories · min spend · validity start/end · usage caps (per-user/global) · fulfillment-mode eligibility · stacking = off (enforced one-per-order per Rule 10.3) · code(s)/batch generation.
- Filters: type · status · validity · campaign.
- Permissions: Marketing (CRUD) · approval for high-value/global vouchers.

Reward (Rewards Store, Module 14.9):

- List columns: Reward · Type (voucher/merch/experience) · Sugar Crystals cost · Stock/cap · Tier gate · Status.
- Detail/Editable: image · title/description · crystals cost · granted-voucher mapping · inventory + per-user limit · tier/country/outlet eligibility · schedule.
- Permissions: Loyalty Manager (CRUD).

Outlet (Module 14.6):

- List columns: Outlet name · City/Country · Pickup/Delivery flags · Open/closed · POS health · Updated-at.
- Detail/Editable: name · address · geo-coordinates · hours per day + holiday overrides · last-order cutoff · prep-capacity / dynamic prep-time · peak-hour extended-wait · fulfillment flags · photos · POS integration status.
- Permissions: Ops (CRUD) · Store Manager (hours/availability for own outlet).

Transaction (Module 14.14):

- List columns: Txn ID · Order # · Method · Amount (Rp) · Status (authorized/paid/failed/refunded) · Gateway ref · Settlement status · Date.
- Detail: full payment trail; refund sub-records; reconciliation match (app/POS/gateway).
- Actions: initiate/track refund (elevated, reason, approval). No raw card data anywhere.
- Filters: method · status · outlet · settlement · date.

Sensitive-action → role / approval matrix:
| Action | Min role | Dual approval |
|---|---|---|
| Order state override | Store Manager | No |
| Refund | Finance / Support (elevated) | Yes (if configured) |
| Sugar Crystals grant/deduct | Loyalty Manager | Yes above threshold |
| Bowls/tier manual adjust | Loyalty Manager | Yes |
| Create/edit high-value or global voucher | Marketing | Yes |
| Member data export | Super Admin | Yes |
| Account/data deletion (UU PDP) | Super Admin | Yes |
| Feature flag / live-config change | Super Admin | Versioned + reversible |

---

15. Glossary
- Hong Tang (红糖): "Brown sugar" — Indonesia's pioneer oriental dessert brand (since 2012); the parent brand of this app.
- Sugar Crystals: The app's loyalty points currency, earned on purchases and spent on rewards.
- Bowls: The membership status currency — a count of qualifying desserts/drinks purchased, used solely to determine tier.
- Loyal-Tang: The overall loyalty/rewards program brand name.
- Tier (Tang Seeker / Explorer / Pioneer / Master): Membership levels unlocking escalating benefits.
- Rewards Store: In-app catalog where Sugar Crystals are redeemed for vouchers and merchandise.
- My Vouchers: The user's wallet of redeemed/granted vouchers.
- Self-Pickup: Ordering ahead in-app and collecting in-store, skipping the queue.
- Prep Time / ETA: Estimated time until pickup readiness or delivery.
- OTP: One-Time Password used for phone-based authentication.

---

16. Resolved Decisions (formerly Open Questions)
- Sugar Crystals earn rate & rounding: RESOLVED — 1 crystal per Rp 1,000 qualifying net spend, tier multipliers (1.0×/1.25×/1.5×/2.0×), floored to whole crystals per order (see Rule 10.1).
- Per-tier benefit allocation, Bowls counting window, tier maintenance/downgrade: RESOLVED — rolling trailing-365-day Bowls window; real-time tier-up; month-end recalc downgrades (max one tier, one-cycle grace); benefit matrix in Rule 10.2.
- Voucher stacking & promo-code interaction: RESOLVED — no stacking; exactly one voucher OR one promo code per order; cannot combine (see Rule 10.3).
- Post-payment order edit window: RESOLVED — none. Orders are locked once paid; changes require cancel-and-reorder within the cancellation window (see Rule 10.4).
- Native in-app delivery: RESOLVED — not pursued. Delivery ordering/payment/fulfillment stays on third-party platforms; in-app "Delivery" is order-tracking/status display only (see Section 13).

No outstanding open questions at this revision.

---

17. Appendix A — Hong Tang Indonesia: Real Menu, Toppings & Outlets (Reference Data)

This appendix records actual Hong Tang Indonesia data sourced from public listings (official site hongtang.asia, GoFood, and the MenuKuliner listing for Hong Tang @ Grand Indonesia) as of June 2026. It seeds the app's catalog/store master data. Prices are per the Grand Indonesia outlet and include promotional pricing captured at sourcing time; actual prices vary by outlet, promo window, and date — treat as representative, not contractual. Menu and outlet master data are maintained centrally in the Admin Panel (Sections 14.5–14.6).

17.1. Menu Categories & Items (with reference prices, Grand Indonesia)

Signature (promo):

- Grass Jelly Signature — Rp 54.450
- Soya Signature — Rp 54.450
- Taro Signature — Rp 54.450

Taiwan Grass Jelly Series (Rp 41.000–50.000):

- Grassjelly Signature — Taiwan Cingcau + Pearl + Qball + Ice Cream — Rp 50.000
- Grassjelly Classic — Taiwan Cingcau + Pearl + Peanut + Red Bean — Rp 41.000
- Grassjelly Favorite — Taiwan Cingcau + Pearl + Mochi + Pudding — Rp 42.000

Taiwan Soya Series (Rp 41.000–50.000):

- Soya Signature — Pudding Soya + Pearl + Qball + Ice Cream — Rp 50.000
- Soya Classic — Pudding Soya + Peanut + Red Bean — Rp 41.000
- Soya Favorite — Pudding Soya + Mochi + Pudding — Rp 42.000

Taro (Rp 41.000–50.000):

- Taro Signature — Taro Ice + Pearl + Ice Cream — Rp 50.000
- Taro Classic — Taro Ice + Peanut + Red Bean — Rp 41.000
- Taro Favorite — Taro Ice + Pearl + Ice Cream — Rp 42.000

Taiwan Ice Pudding Series (Rp 41.000–43.000):

- Ice Puding Signature — 3 Mix Pudding + Ice Cream — Rp 43.000
- Ice Puding Classic — 3 Mix Pudding + Mango — Rp 41.000
- Ice Puding Fav — 3 Mix Pudding + Durian — Rp 43.000

Durian Dessert (Rp 44.000–69.000):

- Durian Coco Pudding — Durian Soup + Coconut Pudding — Rp 69.000
- Durian Grassjelly — Durian Soup + Grassjelly — Rp 67.000
- Durian Soup + Ice Cream — Rp 52.800
- Durian Juice — Durian Juice + Grassjelly — Rp 44.000

Mango Dessert (Rp 43.000):

- Mango Soup + Coconut Pudding — Rp 43.000
- Mango Soup + Grass Jelly — Rp 43.000
- Mango Soup + Ice Cream — Rp 43.000
- Mango Soup + Mango Pudding — Rp 43.000

Thai Mango Coco (Rp 39.000):

- Mango Coco + choice of topping (Pilihan Topping: Mango Pudding, Coconut Pudding, Grassjelly, Ketan, Pearl) — Rp 39.000

Thai Coconut Ice (Rp 41.000–50.000):

- Coco Peach — Coconut + Peach — Rp 41.000
- Coco Mango — Coconut + Mango — Rp 41.000
- Coco Durian — Coconut + Durian — Rp 50.000

Classic (warm, Rp 35.200–38.500):

- Ginger Soup — soup with ginger — Rp 38.500
- Red Bean Soup — soup with red bean — Rp 35.200
- Ketan Hitam — soup with ketan hitam (black glutinous rice) — Rp 35.200

Fresh Milk Series / Promo (Rp 35.000):

- Grass Jelly QQ 28 — Fresh Milk with Grassjelly, Qball, Mochi & Bubble — Rp 35.000
- Tiger Pudding — Brown Sugar Milk with Grassjelly, Pudding Caramel, Pudding Coklat & Bubble — Rp 35.000
- Taro Soy — Taro Milk with Soya Pudding, Peanut, Coconut Jelly & Red Bean — Rp 35.000
- Coco Peach — Coconut Soup with Coconut Pudding, Mochi, Peach & Bubble — Rp 35.000
- Ginger Tangyuan — Ginger Soup with Ronde, Red Bean, Peanut & Bubble — Rp 35.000

Beverages (Rp 19.000–35.000):

- Tiger Milk — Fresh milk, Brown sugar, Bubble — Rp 35.000
- Choco Lava — Fresh milk, Chocolate cream — Rp 35.000
- Strawberry Lemonade — Strawberry syrup, Lemon syrup — Rp 35.000
- Blackpinky Choco Lava — Rp 35.000
- Blackpinky Macchiato — Rp 35.000
- Taro Genji — Rp 19.000
- Coffee Tiger — Rp 19.000
- Royal Milk Tea — Rp 19.000

Savory:

- Karaage Curry Rice — Rp 43.000

17.2. Toppings / Add-ons (real)

Pearl/Bubble (boba), Q Ball, Mochi, Grass Jelly (Cingcau), Mango Pudding, Coconut Pudding, 3 Mix Pudding, Soya Pudding, Coconut Jelly, Peanut, Red Bean, Ketan (glutinous rice), Ronde (tangyuan), Ice Cream. (Confirmed topping picker example: Thai Mango Coco — Mango Pudding, Coconut Pudding, Grass Jelly, Ketan, Pearl.)

17.3. Operating Hours (reference)

Grand Indonesia: daily 10:00–22:00 (Mon–Sun). Mall outlets generally follow mall trading hours.

17.4. Outlets (verified, real)

Hong Tang reports ~26 outlets across Jakarta, Tangerang, Bekasi, Bogor, Bandung, Batam, Palembang and Surabaya. Verified named locations:

Jakarta:

- Grand Indonesia (East Mall, 3rd floor)
- Summarecon Mall Kelapa Gading 3 (3rd floor)
- Central Park
- Mall Taman Anggrek
- Mall Artha Gading
- Mall of Indonesia (MOI), Kelapa Gading
- Pondok Indah Mall 2
- Lotte Shopping Avenue
- PIK Avenue / Pantjoran PIK
- Gandaria City
- Slipi (Slipi Jaya)

Tangerang:

- Summarecon Mall Serpong
- AEON Mall (BSD/Serpong)
- Gading Serpong
- Broadway, Alam Sutera
- Benda

Bekasi:

- Summarecon Mall Bekasi

Bandung:

- 23 Paskal
- Cicendo

Karawang:

- The Grand Outlet Karawang

Additional cities with outlets (specific malls to be confirmed in master data): Bogor, Batam, Palembang, Surabaya.

17.5. Sources

- Official site: hongtang.asia (brand profile, "26 outlets" / cities, menu highlights).
- GoFood (gofood.co.id) Hong Tang outlet pages (outlet names across cities).
- MenuKuliner listing — "Hong Tang, Grand Indonesia" (itemized menu, prices, hours).
- Mall tenant directories (PIK Avenue, Mall of Indonesia, Mall Kelapa Gading, The Grand Outlet) and listing sites (PergiKuliner, Wanderlog) for outlet confirmation.
  Data captured June 2026; refresh against live sources before launch.

---

18. Edge Cases, Error & Empty States (Consolidated)

Per the states contract (Section 7.9), every data-driven screen defines loading, populated, empty, and error states. This section consolidates the non-happy-path behavior referenced across Section 8.

18.1. Global / Connectivity

- Offline / network loss: serve cached menu and last-known loyalty snapshot where possible; non-blocking banner "You're offline — showing saved data." Write actions (pay, redeem) disabled with retry; reads degrade gracefully.
- Slow network: skeleton placeholders on first paint (never bare spinners); in-button spinner for async actions.
- Server / 5xx error: non-blocking error banner + "Retry"; preserve user input. Never a bare system alert for recoverable states.
- Session expired: silent re-auth where possible; else route to phone+OTP, return user to prior screen.
- App/API version unsupported: blocking update prompt with store link.

18.2. Onboarding & Auth (Section 8.9)

- OTP not received: masked resend timer → "Resend" with channel fallback (SMS ⇄ WhatsApp); help-path copy (reinstall, stable network, try another device).
- Wrong OTP: inline error + shake; lockout messaging after repeated failures (rate-limited per Section 12).
- Invalid phone format: inline validation; CTA disabled until valid.
- Invalid/duplicate referral code: inline reason; only first-time registrants can apply (Rule 10.5).
- Permissions denied (notif/location): app remains fully usable; outlet selection stays manual.

18.3. Menu & Product (Sections 8.2–8.3)

- Item sold out: dimmed row, "Sold Out / Habis" tag, disabled "+".
- Item unavailable at selected store: hidden for that store.
- Required customization missing: CTA blocked + hint on the unfilled group.
- Topping max exceeded: further toppings disabled with a hint.
- Add-to-cart failure: inline retry; sheet stays open, selections preserved.
- Empty search: friendly empty state with suggestions.

18.4. Cart & Checkout (Section 8.4)

- Item went unavailable after adding: prompt to remove/replace; block pay until resolved.
- Store closed / past last-order cutoff: block checkout with explanation + suggest another store (Rule 10.4).
- Voucher invalid/ineligible (min spend not met, wrong fulfillment mode, expired): inline reason; not applied.
- Voucher/promo conflict: applying a new one replaces the current (no stacking, Rule 10.3) with a brief notice.
- Price/total changed before pay (price update, voucher expiry): surface change, require re-confirm.
- Payment failure / timeout: keep cart, retry banner; never double-charge (idempotent placement, Section 12).
- Double-submit: CTA disabled + spinner during processing.
- Empty cart: empty state with "Browse Menu" CTA.
- Post-payment change attempt: not allowed; offer cancel-and-reorder within the cancellation window (Rule 10.4).

18.5. Order Status (Section 8.5)

- Auto-cancellation: order shows "Cancelled" + refund-issued explanation (Rule 10.4); peak-hour knowingly-proceeded orders excluded from wait-time cancellation.
- Status feed stalled: pull-to-refresh; show last-updated timestamp.
- Refund pending: status note "Refund to original method, up to 15 working days."

18.6. Loyalty & Rewards (Sections 8.6, 10)

- Insufficient Sugar Crystals to redeem: cost shown, "Redeem" disabled.
- Reward out of stock / per-user limit reached: disabled with reason.
- Crystals expiring ≤7 days: red + text label (never color alone), per batch (Example F, 10.6).
- Redemption failure: balance not deducted; inline retry.
- Tier downgrade: advance notice before month-end recalc takes effect (Example D, 10.6).
- Walk-in QR not scanned: no retroactive points; explanatory copy (Rule 10.1).

18.7. Store Locator (Section 8.7)

- Location permission denied: manual area-search fallback.
- No outlets in area: empty state + widen-search suggestion.
- Outlet closed: shown with hours; "Order from this store" disabled or warns.

18.8. Delivery surfaces (Section 13)

- Delivery unavailable for market/outlet: Home "Delivery" card collapses to single full-width "Order for Pickup" (Section 8.1).
- In-app delivery is tracking/status display only — no native delivery ordering/payment (Section 13).
