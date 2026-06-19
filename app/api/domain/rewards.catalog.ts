// Static Rewards Store catalog + welcome/referral voucher templates.
import type { RewardProduct, Voucher } from "~/lib/domain.types";

const IMG = (prompt: string) =>
  `https://api.qb-deck.quantumbyte.ai/common/image-generation?prompt=${encodeURIComponent(prompt)}`;

export const REWARDS: RewardProduct[] = [
  {
    id: "rw-bogo",
    title: "Buy 1 Get 1 Voucher",
    description: "Treat a friend — one free dessert on your next visit.",
    crystalCost: 180,
    type: "voucher",
    imageUrl: IMG("two oriental desserts side by side, premium, cream background"),
    voucherTemplate: {
      title: "Buy 1 Get 1 Free",
      description: "One free item of equal or lesser value.",
      discountType: "bogo",
      discountValue: 0,
      minSpend: 35000,
      source: "reward",
      validDays: 30,
    },
  },
  {
    id: "rw-15off",
    title: "15% Off Total Bill",
    description: "A little extra sweetness on your whole order.",
    crystalCost: 120,
    type: "voucher",
    imageUrl: IMG("oriental dessert with discount tag, premium, cream background"),
    voucherTemplate: {
      title: "15% Off Total",
      description: "15% off your entire order.",
      discountType: "percent",
      discountValue: 15,
      minSpend: 50000,
      source: "reward",
      validDays: 30,
    },
  },
  {
    id: "rw-20k",
    title: "Rp 20.000 Off",
    description: "Flat discount on your next order over Rp 60.000.",
    crystalCost: 90,
    type: "voucher",
    imageUrl: IMG("oriental dessert with coin discount, premium, cream background"),
    voucherTemplate: {
      title: "Rp 20.000 Off",
      description: "Rp 20.000 off orders above Rp 60.000.",
      discountType: "fixed",
      discountValue: 20000,
      minSpend: 60000,
      source: "reward",
      validDays: 30,
    },
  },
  {
    id: "rw-tote",
    title: "Hong Tang Canvas Tote",
    description: "Limited oriental-minimalist tote bag. Collect it in-store.",
    crystalCost: 350,
    type: "merch",
    imageUrl: IMG("minimalist canvas tote bag with oriental brown sugar branding, premium product photography, cream background"),
    stockCap: 50,
    perUserLimit: 1,
    tierGate: "explorer",
  },
  {
    id: "rw-mug",
    title: "Brown Sugar Ceramic Mug",
    description: "Hand-glazed mug in deep brown-sugar tones.",
    crystalCost: 280,
    type: "merch",
    imageUrl: IMG("ceramic mug deep brown glaze minimalist oriental design, premium product photography, cream background"),
  },
  {
    id: "rw-keepcup",
    title: "Reusable Pearl Cup",
    description: "Wide-straw reusable cup, perfect for pearls.",
    crystalCost: 220,
    type: "merch",
    imageUrl: IMG("reusable boba cup with wide straw, minimalist oriental branding, premium product photography, cream background"),
  },
];

let counter = 0;
export function makeCode(prefix: string): string {
  counter += 1;
  return `${prefix}${Date.now().toString(36).toUpperCase().slice(-5)}${counter}`;
}

export function welcomeVoucher(): Voucher {
  const expires = new Date(Date.now() + 30 * 86400_000);
  return {
    id: "v-welcome-" + Date.now(),
    code: makeCode("WELCOME"),
    title: "Welcome Treat — Rp 15.000 Off",
    description: "A warm welcome to Loyal-Tang. Rp 15.000 off your first order.",
    discountType: "fixed",
    discountValue: 15000,
    minSpend: 30000,
    expiresAt: expires.toISOString(),
    used: false,
    source: "welcome",
  };
}

export function referralWelcomeVoucher(): Voucher {
  const expires = new Date(Date.now() + 30 * 86400_000);
  return {
    id: "v-ref-" + Date.now(),
    code: makeCode("FRIEND"),
    title: "Referred Friend — 20% Off",
    description: "Welcome via a friend! 20% off your first order.",
    discountType: "percent",
    discountValue: 20,
    minSpend: 35000,
    expiresAt: expires.toISOString(),
    used: false,
    source: "referral",
  };
}

export function referrerRewardVoucher(): Voucher {
  const expires = new Date(Date.now() + 45 * 86400_000);
  return {
    id: "v-refrwd-" + Date.now() + Math.random().toString(36).slice(2, 6),
    code: makeCode("THANKS"),
    title: "Thanks for Sharing — Free Dessert",
    description: "Your friend joined Hong Tang. Enjoy a free signature dessert.",
    discountType: "fixed",
    discountValue: 42000,
    minSpend: 42000,
    expiresAt: expires.toISOString(),
    used: false,
    source: "referral",
  };
}
