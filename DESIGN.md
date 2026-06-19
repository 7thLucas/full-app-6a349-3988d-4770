

# Hong Tang — Design Contract: "Modern Oriental Minimalism"

Premium, calm, crafted, unhurried. Ample whitespace; let dessert imagery breathe. **One clear primary action per screen** — minimize competing CTAs and visual noise. Every screen inherits this contract; deviations must be justified.

## Color
- **Background:** `#FDFBF7` textured cream — NEVER pure white for large surfaces.
- **Primary text & structure:** `#3E2723` deep brown-sugar.
- **Accent / primary CTA / alert:** `#C62828` Hong Tang Red — reserved for the SINGLE primary action per screen, active states, and badges. Do not overuse.
- **Secondary / meta text:** warm grey `#6F6258`.
- **Tier metallics:** Bronze → Silver → Gold → Platinum gradients (Seeker → Explorer → Pioneer → Master) on the digital membership card.
- Semantic colors ALWAYS pair with a text label — never color alone (e.g. voucher expiry).

## Typography
- Elegant **serif** for display/headers (e.g. a refined serif like Playfair Display / Cormorant feel).
- Clean modern **sans-serif** for body/UI.
- **Tabular figures** for Sugar Crystals balances, prices, and totals.
- Support OS dynamic type without breaking layout.

## Shape, Elevation & Motion
- Cards ~16px radius (primary container). Buttons ~12px radius. Pills/chips fully rounded.
- Subtle low-spread shadows.
- Calm, eased, restrained motion: cross-fade tabs, slide push on navigation, spring modal sheets. **Honor reduce-motion.**

## Layout
- **8px base grid**; generous gutters.
- Cards as primary container.
- **Sticky bottom CTA** anchored for one-thumb reach.
- Mobile-first consumer app; web layout for Operations Console.

## States & Loading
- **Skeleton loaders** — never bare spinners.
- Every data screen has all four states: loading / populated / empty / error.

## Accessibility & Localization
- AA contrast minimum; tap targets ≥ 44×44pt; screen-reader labels; no info by color alone.
- IDR formatting "Rp 38.000"; English UI (Bahasa is roadmap); externalize copy for translation.

## Membership Card
Tier-themed metallic gradient card showing tier name, Bowls count + linear progress to next tier, and Sugar Crystals balance (tabular figures). Bronze/Silver/Gold/Platinum themes.
