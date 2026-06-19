// Shared, client-safe domain types for Hong Tang.
// No mongoose/typegoose imports here — safe to import from React components.

// ── Loyalty ──────────────────────────────────────────────────────────────────
export type TierKey = "seeker" | "explorer" | "pioneer" | "master";

export interface TierDef {
  key: TierKey;
  name: string;
  theme: "bronze" | "silver" | "gold" | "platinum";
  minBowls: number;
  maxBowls: number | null; // null = open-ended
  multiplier: number;
  perks: string[];
}

export const TIERS: TierDef[] = [
  {
    key: "seeker",
    name: "Tang Seeker",
    theme: "bronze",
    minBowls: 0,
    maxBowls: 9,
    multiplier: 1.0,
    perks: ["Rewards Store access", "Welcome rewards", "Birthday drink/dessert voucher"],
  },
  {
    key: "explorer",
    name: "Tang Explorer",
    theme: "silver",
    minBowls: 10,
    maxBowls: 39,
    multiplier: 1.25,
    perks: [
      "Everything in Seeker",
      "1.25× Sugar Crystals",
      "Birthday + merch voucher",
      "Early access to seasonal launches",
      "Occasional second-item discount",
    ],
  },
  {
    key: "pioneer",
    name: "Tang Pioneer",
    theme: "gold",
    minBowls: 40,
    maxBowls: 79,
    multiplier: 1.5,
    perks: [
      "Everything in Explorer",
      "1.5× Sugar Crystals",
      "Second-item discount voucher",
      "Periodic 15%-off-total voucher",
      "Free-item milestone reward",
      "Exclusive merch redemption",
    ],
  },
  {
    key: "master",
    name: "Tang Master",
    theme: "platinum",
    minBowls: 80,
    maxBowls: null,
    multiplier: 2.0,
    perks: [
      "Everything in Pioneer",
      "2.0× Sugar Crystals",
      "Premium birthday gift & surprise",
      "Higher-frequency 15%-off vouchers",
      "VIP invites & member-only events",
      "Priority support / concierge",
    ],
  },
];

export function tierForBowls(bowls: number): TierDef {
  let current = TIERS[0];
  for (const t of TIERS) {
    if (bowls >= t.minBowls) current = t;
  }
  return current;
}

export function nextTier(tier: TierKey): TierDef | null {
  const idx = TIERS.findIndex((t) => t.key === tier);
  return idx >= 0 && idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

// ── Menu ───────────────────────────────────────────────────────────────────
export type CategoryKey =
  | "signatures"
  | "grass-jelly"
  | "mango-fruit"
  | "warm-desserts"
  | "smash-ice"
  | "beverages"
  | "seasonal";

export interface CategoryDef {
  key: CategoryKey;
  name: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: "signatures", name: "Signatures" },
  { key: "grass-jelly", name: "Grass Jelly" },
  { key: "mango-fruit", name: "Mango & Fruit" },
  { key: "warm-desserts", name: "Warm Desserts" },
  { key: "smash-ice", name: "Smash Ice & Ice Cream" },
  { key: "beverages", name: "Beverages" },
  { key: "seasonal", name: "Seasonal" },
];

export interface OptionChoice {
  id: string;
  label: string;
  priceDelta: number; // IDR surcharge
}

export interface OptionGroup {
  id: string;
  name: string;
  type: "single" | "multi";
  required: boolean;
  min: number;
  max: number;
  choices: OptionChoice[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: CategoryKey;
  basePrice: number;
  imageUrl: string;
  tags: string[];
  optionGroups: OptionGroup[];
  isSignature?: boolean;
  available?: boolean;
}

// ── Outlets ──────────────────────────────────────────────────────────────────
export interface Outlet {
  id: string;
  name: string;
  mall: string;
  city: string;
  address: string;
  distanceKm: number;
  openTime: string; // "10:00"
  closeTime: string; // "22:00"
  lastOrderTime: string; // "21:30"
  prepMinutes: number;
  isOpen: boolean;
  pickupEnabled: boolean;
  lat: number;
  lng: number;
  soldOutItemIds: string[];
}

// ── Cart / customization ───────────────────────────────────────────────────
export interface SelectedOption {
  groupId: string;
  groupName: string;
  choiceId: string;
  choiceLabel: string;
  priceDelta: number;
}

export interface CartLine {
  lineId: string;
  itemId: string;
  name: string;
  imageUrl: string;
  basePrice: number;
  quantity: number;
  options: SelectedOption[];
  unitPrice: number; // basePrice + sum(option deltas)
}

// ── Orders ───────────────────────────────────────────────────────────────────
export type OrderStatus = "received" | "preparing" | "ready" | "collected" | "cancelled";

export const ORDER_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "received", label: "Received" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "collected", label: "Collected" },
];

export interface OrderLine {
  itemId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  options: SelectedOption[];
}

export interface Order {
  id: string;
  pickupCode: string;
  outletId: string;
  outletName: string;
  status: OrderStatus;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  netSpend: number;
  crystalsEarned: number;
  bowlsEarned: number;
  voucherCode: string | null;
  paymentMethod: string;
  etaMinutes: number;
  createdAt: string;
  statusHistory: { status: OrderStatus; at: string }[];
}

// ── Vouchers ───────────────────────────────────────────────────────────────
export type DiscountType = "percent" | "fixed" | "bogo";

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number; // percent (0-100) or fixed IDR
  minSpend: number;
  expiresAt: string; // ISO
  used: boolean;
  source: "welcome" | "reward" | "referral" | "birthday" | "promo";
}

// ── Rewards Store ──────────────────────────────────────────────────────────
export interface RewardProduct {
  id: string;
  title: string;
  description: string;
  crystalCost: number;
  type: "voucher" | "merch";
  imageUrl: string;
  voucherTemplate?: Omit<Voucher, "id" | "code" | "used" | "expiresAt"> & {
    validDays: number;
  };
}

// ── Member state (the logged-in customer's loyalty snapshot) ─────────────────
export interface MemberState {
  name: string;
  phone: string;
  birthday: string | null;
  referralCode: string;
  crystals: number;
  bowls: number;
  tier: TierKey;
  joinedAt: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
export function formatIDR(amount: number): string {
  const rounded = Math.round(amount);
  return "Rp " + rounded.toLocaleString("id-ID");
}

export function computeCrystals(netSpend: number, multiplier: number): number {
  return Math.floor((netSpend / 1000) * multiplier);
}
