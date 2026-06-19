import crypto from "node:crypto";
import { UserModel } from "~/modules/authentication/authentication.model";
import { OrderModel } from "../models/order.model";
import { OutletModel } from "../models/outlet.model";
import { tierForBowls, computeCrystals } from "~/lib/domain.types";
import type { Voucher, CartLine, OrderStatus } from "~/lib/domain.types";

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

const TAX_RATE = 0.1; // PB1 10% — excluded from Crystal accrual

function genPickupCode(): string {
  return "HT-" + crypto.randomInt(100, 1000) + "-" + crypto.randomInt(100, 1000);
}

interface CartTotals {
  subtotal: number;
  discount: number;
  netSpend: number;
  tax: number;
  total: number;
}

export function computeTotals(lines: CartLine[], voucher: Voucher | null): CartTotals {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  let discount = 0;
  if (voucher && subtotal >= voucher.minSpend) {
    if (voucher.discountType === "percent") {
      discount = Math.round((subtotal * voucher.discountValue) / 100);
    } else if (voucher.discountType === "fixed") {
      discount = Math.min(voucher.discountValue, subtotal);
    } else if (voucher.discountType === "bogo") {
      // Cheapest unit free (per voucher, one item).
      const cheapest = lines.length
        ? Math.min(...lines.map((l) => l.unitPrice))
        : 0;
      discount = cheapest;
    }
  }
  const netSpend = Math.max(0, subtotal - discount); // before tax
  const tax = Math.round(netSpend * TAX_RATE);
  const total = netSpend + tax;
  return { subtotal, discount, netSpend, tax, total };
}

function orderDto(o: any) {
  return {
    id: o._id.toString(),
    pickupCode: o.pickupCode,
    outletId: o.outletId,
    outletName: o.outletName,
    status: o.status,
    lines: o.lines ?? [],
    subtotal: o.subtotal,
    discount: o.discount,
    tax: o.tax,
    total: o.total,
    netSpend: o.netSpend,
    crystalsEarned: o.crystalsEarned,
    bowlsEarned: o.bowlsEarned,
    voucherCode: o.voucherCode ?? null,
    paymentMethod: o.paymentMethod,
    etaMinutes: o.etaMinutes,
    createdAt: (o.createdAt as Date)?.toISOString?.() ?? new Date().toISOString(),
    statusHistory: o.statusHistory ?? [],
  };
}

export class OrderService {
  /** Validate a voucher / promo code against the current cart. */
  static async validateVoucher(userId: string, code: string, lines: CartLine[]) {
    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);
    const vouchers: Voucher[] = user.profile?.vouchers ?? [];
    const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);

    const normalized = code.trim().toUpperCase();
    const voucher = vouchers.find((v) => v.code.toUpperCase() === normalized && !v.used);

    // Promo codes (not in wallet) — accept a couple of simulated public codes.
    const PROMO: Record<string, Voucher> = {
      TANG10: {
        id: "promo-tang10",
        code: "TANG10",
        title: "Promo: 10% Off",
        description: "10% off this order.",
        discountType: "percent",
        discountValue: 10,
        minSpend: 30000,
        expiresAt: new Date(Date.now() + 86400_000).toISOString(),
        used: false,
        source: "promo",
      },
      PEARLFREE: {
        id: "promo-pearlfree",
        code: "PEARLFREE",
        title: "Promo: Rp 6.000 Off",
        description: "Rp 6.000 off — pearls on us.",
        discountType: "fixed",
        discountValue: 6000,
        minSpend: 25000,
        expiresAt: new Date(Date.now() + 86400_000).toISOString(),
        used: false,
        source: "promo",
      },
    };

    const resolved = voucher ?? PROMO[normalized];
    if (!resolved) throw makeError("Code not found or already used", 404);
    if (new Date(resolved.expiresAt) < new Date()) throw makeError("This code has expired", 400);
    if (subtotal < resolved.minSpend) {
      throw makeError(`Minimum spend Rp ${resolved.minSpend.toLocaleString("id-ID")} required`, 400);
    }
    return resolved;
  }

  /** Place + pay (simulated) → create order, accrue Crystals & Bowls, consume voucher. */
  static async checkout(
    userId: string,
    payload: {
      outletId: string;
      lines: CartLine[];
      voucherCode: string | null;
      paymentMethod: string;
    },
  ) {
    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);
    if (!payload.lines?.length) throw makeError("Cart is empty", 400);

    const outlet = await OutletModel.findById(payload.outletId).lean();
    if (!outlet) throw makeError("Outlet not found", 404);
    if (!outlet.isOpen || !outlet.pickupEnabled) {
      throw makeError("This outlet is not accepting pickup orders right now", 409);
    }

    let voucher: Voucher | null = null;
    if (payload.voucherCode) {
      voucher = await OrderService.validateVoucher(userId, payload.voucherCode, payload.lines);
    }

    const totals = computeTotals(payload.lines, voucher);

    // Loyalty: tier multiplier from current bowls; crystals on net spend (excl tax).
    const profile = (user.profile ?? {}) as Record<string, any>;
    const currentBowls = (profile.bowls as number) ?? 0;
    const tier = tierForBowls(currentBowls);
    const crystalsEarned = computeCrystals(totals.netSpend, tier.multiplier);
    const bowlsEarned = payload.lines.reduce((s, l) => s + l.quantity, 0);

    const now = new Date();
    const order = await OrderModel.create({
      userId,
      pickupCode: genPickupCode(),
      outletId: payload.outletId,
      outletName: outlet.name,
      status: "received",
      lines: payload.lines.map((l) => ({
        itemId: l.itemId,
        name: l.name,
        imageUrl: l.imageUrl,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        options: l.options,
      })),
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      netSpend: totals.netSpend,
      crystalsEarned,
      bowlsEarned,
      voucherCode: voucher?.code ?? null,
      paymentMethod: payload.paymentMethod || "QRIS",
      etaMinutes: outlet.prepMinutes,
      statusHistory: [{ status: "received", at: now.toISOString() }],
    });

    // Apply loyalty + consume wallet voucher (promo codes are not in wallet).
    profile.crystals = ((profile.crystals as number) ?? 0) + crystalsEarned;
    profile.bowls = currentBowls + bowlsEarned;
    if (voucher && Array.isArray(profile.vouchers)) {
      const v = (profile.vouchers as Voucher[]).find((x) => x.code === voucher!.code);
      if (v) v.used = true;
    }
    user.profile = profile;
    user.markModified("profile");
    await user.save();

    return orderDto(order.toObject());
  }

  static async listOrders(userId: string) {
    const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return orders.map(orderDto);
  }

  static async getOrder(userId: string, orderId: string) {
    const o = await OrderModel.findOne({ _id: orderId, userId }).lean();
    return o ? orderDto(o) : null;
  }

  /** Advance order to the next status (simulated kitchen progression / ops override). */
  static async advanceStatus(orderId: string, target?: OrderStatus) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw makeError("Order not found", 404);
    const flow: OrderStatus[] = ["received", "preparing", "ready", "collected"];
    let next: OrderStatus;
    if (target) {
      next = target;
    } else {
      const idx = flow.indexOf(order.status as OrderStatus);
      next = flow[Math.min(idx + 1, flow.length - 1)];
    }
    order.status = next;
    order.statusHistory = [
      ...(order.statusHistory ?? []),
      { status: next, at: new Date().toISOString() },
    ];
    await order.save();
    return orderDto(order.toObject());
  }

  static async cancelOrder(userId: string, orderId: string) {
    const order = await OrderModel.findOne({ _id: orderId, userId });
    if (!order) throw makeError("Order not found", 404);
    if (order.status === "collected") throw makeError("Order already collected", 409);
    if (order.status === "cancelled") return orderDto(order.toObject());

    // Reverse loyalty accrual on cancellation + refund (simulated).
    const user = await UserModel.findById(userId);
    if (user) {
      const p = (user.profile ?? {}) as Record<string, any>;
      p.crystals = Math.max(0, ((p.crystals as number) ?? 0) - order.crystalsEarned);
      p.bowls = Math.max(0, ((p.bowls as number) ?? 0) - order.bowlsEarned);
      user.profile = p;
      user.markModified("profile");
      await user.save();
    }

    order.status = "cancelled";
    order.statusHistory = [
      ...(order.statusHistory ?? []),
      { status: "cancelled", at: new Date().toISOString() },
    ];
    await order.save();
    return orderDto(order.toObject());
  }

  // ── Operations Console: live board ────────────────────────────────────────
  static async listOutletOrders(outletId: string) {
    const orders = await OrderModel.find({ outletId }).sort({ createdAt: -1 }).limit(50).lean();
    return orders.map(orderDto);
  }
}
