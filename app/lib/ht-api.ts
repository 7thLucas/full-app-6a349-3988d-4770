import { apiRequest, apiGet } from "~/lib/api.client";
import type {
  Outlet,
  MenuItem,
  Order,
  Voucher,
  RewardProduct,
  CartLine,
} from "~/lib/domain.types";

export interface Address {
  id: string;
  label: string;
  line: string;
  notes?: string;
  lat?: number | null;
  lng?: number | null;
}
export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  token: string;
}
export interface MemberDto {
  name: string;
  phone: string;
  birthday: string | null;
  email: string | null;
  gender: string | null;
  referralCode: string;
  crystals: number;
  bowls: number;
  tier: import("~/lib/domain.types").TierKey;
  joinedAt: string;
  vouchers: Voucher[];
  favorites: string[];
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  notificationPreferences: Record<string, boolean>;
  expiringSoon: { amount: number; expiresAt: string }[];
  onboarded: boolean;
  deletionRequested: boolean;
}

export interface RewardDto extends RewardProduct {
  redeemable: boolean;
  reason: string | null;
}
export interface CrystalHistory {
  balance: number;
  batches: { id: string; amount: number; remaining: number; earnedAt: string; expiresAt: string }[];
  ledger: { id: string; type: string; amount: number; at: string; balanceAfter: number; note: string }[];
}
export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  data?: Record<string, any>;
}
export interface ReferralStats {
  code: string;
  totalInvited: number;
  rewarded: number;
  pending: number;
  referrals: { status: string; at: string }[];
}

export interface HomeBanner {
  id: string;
  title: string;
  imageUrl: string;
  caption: string;
  deepLink: string;
  priority: number;
}
export interface HomePayload {
  greeting: string;
  banners: HomeBanner[];
  coreActions: { pickup: boolean; delivery: boolean };
  personalized: {
    recentItems: { itemId: string; name: string; imageUrl: string; unitPrice: number; options: any[] }[];
    loyalty: { crystals: number; bowls: number; tier: string } | null;
  };
  firstRun: boolean;
  promoRows: { key: string; title: string }[];
}

export const htApi = {
  // catalog
  outlets: (opts?: { country?: string; near?: { lat: number; lng: number } }) => {
    const q = new URLSearchParams();
    if (opts?.country) q.set("country", opts.country);
    if (opts?.near) q.set("near", `${opts.near.lat},${opts.near.lng}`);
    const qs = q.toString();
    return apiGet<Outlet[]>(`/api/outlets${qs ? `?${qs}` : ""}`);
  },
  outlet: (id: string) => apiGet<Outlet>(`/api/outlets/${id}`),
  menu: (outletId?: string) =>
    apiGet<MenuItem[]>(`/api/menu${outletId ? `?outletId=${encodeURIComponent(outletId)}` : ""}`),
  categories: () => apiGet<{ key: string; name: string }[]>("/api/categories"),
  home: () => apiGet<HomePayload>("/api/home"),
  rewards: () => apiGet<RewardProduct[]>("/api/rewards"),

  // auth (phone OTP)
  requestOtp: (phone: string, channel: "sms" | "whatsapp") =>
    apiRequest<{ phone: string; isNewUser: boolean; devCode: string }>("/api/auth/otp/request", {
      method: "POST",
      data: { phone, channel },
    }),
  verifyOtp: (phone: string, code: string) =>
    apiRequest<{ user: any; isNewUser: boolean }>("/api/auth/otp/verify", {
      method: "POST",
      data: { phone, code },
    }),
  completeProfile: (data: { name: string; birthday?: string | null; referredBy?: string | null }) =>
    apiRequest<{ user: any }>("/api/auth/otp/complete-profile", { method: "POST", data }),
  logout: () => apiRequest("/api/auth/logout", { method: "POST" }),

  // ops console auth (email + password)
  adminLogin: (email: string, password: string) =>
    apiRequest<{ user: any }>("/api/auth/login", { method: "POST", data: { email, password } }),

  // member
  member: () => apiGet<MemberDto>("/api/member/me"),
  updateProfile: (data: Partial<{ name: string; birthday: string | null; gender: string; email: string; photoUrl: string }>) =>
    apiRequest<MemberDto>("/api/member/me", { method: "PATCH", data }),
  toggleFavorite: (itemId: string) =>
    apiRequest<string[]>("/api/member/favorites", { method: "POST", data: { itemId } }),
  redeem: (rewardId: string, idempotencyKey?: string) =>
    apiRequest<MemberDto>("/api/member/redeem", { method: "POST", data: { rewardId, idempotencyKey } }),
  memberRewards: () => apiGet<RewardDto[]>("/api/member/rewards"),
  crystals: () => apiGet<CrystalHistory>("/api/member/crystals"),
  vouchers: () => apiGet<Voucher[]>("/api/member/vouchers"),

  // notifications (Sprint 6)
  notifications: () => apiGet<AppNotification[]>("/api/member/notifications"),
  readNotifications: () => apiRequest("/api/member/notifications/read", { method: "POST" }),
  registerDevice: (token: string, platform?: string) =>
    apiRequest("/api/member/device-token", { method: "POST", data: { token, platform } }),

  // referral (Sprint 9)
  referral: () => apiGet<ReferralStats>("/api/member/referral"),
  validateReferral: (code: string) =>
    apiRequest<{ valid: boolean }>("/api/referral/validate", { method: "POST", data: { code } }),

  // profile / settings (Sprint 10)
  addAddress: (data: Partial<Address>) => apiRequest<Address[]>("/api/member/addresses", { method: "POST", data }),
  updateAddress: (id: string, data: Partial<Address>) =>
    apiRequest<Address[]>(`/api/member/addresses/${id}`, { method: "PUT", data }),
  deleteAddress: (id: string) => apiRequest<Address[]>(`/api/member/addresses/${id}`, { method: "DELETE" }),
  addPaymentMethod: (data: { brand?: string; cardNumber?: string; token?: string }) =>
    apiRequest<PaymentMethod[]>("/api/member/payment-methods", { method: "POST", data }),
  deletePaymentMethod: (id: string) =>
    apiRequest<PaymentMethod[]>(`/api/member/payment-methods/${id}`, { method: "DELETE" }),
  updatePreferences: (prefs: Record<string, boolean>) =>
    apiRequest<Record<string, boolean>>("/api/member/preferences", { method: "PATCH", data: prefs }),
  requestDeletion: (reason?: string) =>
    apiRequest<{ requested: boolean }>("/api/member/deletion-request", { method: "POST", data: { reason } }),

  // orders
  validateVoucher: (code: string, lines: CartLine[]) =>
    apiRequest<Voucher>("/api/orders/validate-voucher", { method: "POST", data: { code, lines } }),
  checkout: (data: {
    outletId: string;
    lines: CartLine[];
    voucherCode: string | null;
    paymentMethod: string;
    idempotencyKey?: string;
  }) => apiRequest<Order>("/api/orders/checkout", { method: "POST", data }),
  orders: () => apiGet<Order[]>("/api/orders"),
  order: (id: string) => apiGet<Order>(`/api/orders/${id}`),
  advanceOrder: (id: string) => apiRequest<Order>(`/api/orders/${id}/advance`, { method: "POST" }),
  cancelOrder: (id: string) => apiRequest<Order>(`/api/orders/${id}/cancel`, { method: "POST" }),

  // ops console (admin)
  adminCreateItem: (data: any) => apiRequest<MenuItem>("/api/admin/menu", { method: "POST", data }),
  adminUpdateItem: (id: string, data: any) => apiRequest<MenuItem>(`/api/admin/menu/${id}`, { method: "PUT", data }),
  adminDeleteItem: (id: string) => apiRequest(`/api/admin/menu/${id}`, { method: "DELETE" }),
  adminUpdateOutlet: (id: string, data: any) => apiRequest<Outlet>(`/api/admin/outlets/${id}`, { method: "PUT", data }),
  adminToggleSoldOut: (id: string, itemId: string, soldOut: boolean) =>
    apiRequest<Outlet>(`/api/admin/outlets/${id}/sold-out`, { method: "POST", data: { itemId, soldOut } }),
  adminOutletOrders: (id: string) => apiGet<Order[]>(`/api/admin/outlets/${id}/orders`),
  adminAdvanceOrder: (id: string, status?: string) =>
    apiRequest<Order>(`/api/admin/orders/${id}/advance`, { method: "POST", data: { status } }),
};
