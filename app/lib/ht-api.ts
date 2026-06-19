import { apiRequest, apiGet } from "~/lib/api.client";
import type {
  Outlet,
  MenuItem,
  Order,
  Voucher,
  RewardProduct,
  CartLine,
} from "~/lib/domain.types";

export interface MemberDto {
  name: string;
  phone: string;
  birthday: string | null;
  referralCode: string;
  crystals: number;
  bowls: number;
  tier: import("~/lib/domain.types").TierKey;
  joinedAt: string;
  vouchers: Voucher[];
  favorites: string[];
  onboarded: boolean;
}

export const htApi = {
  // catalog
  outlets: () => apiGet<Outlet[]>("/api/outlets"),
  menu: () => apiGet<MenuItem[]>("/api/menu"),
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
  toggleFavorite: (itemId: string) =>
    apiRequest<string[]>("/api/member/favorites", { method: "POST", data: { itemId } }),
  redeem: (rewardId: string) =>
    apiRequest<MemberDto>("/api/member/redeem", { method: "POST", data: { rewardId } }),

  // orders
  validateVoucher: (code: string, lines: CartLine[]) =>
    apiRequest<Voucher>("/api/orders/validate-voucher", { method: "POST", data: { code, lines } }),
  checkout: (data: { outletId: string; lines: CartLine[]; voucherCode: string | null; paymentMethod: string }) =>
    apiRequest<Order>("/api/orders/checkout", { method: "POST", data }),
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
