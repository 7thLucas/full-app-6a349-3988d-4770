import crypto from "node:crypto";
import { UserModel } from "~/modules/authentication/authentication.model";
import { OrderModel } from "../models/order.model";
import { OutletModel } from "../models/outlet.model";
import { MenuItemModel } from "../models/menu-item.model";
import { TransactionModel } from "../models/transaction.model";
import { OutletService } from "./outlet.service";
import { paymentGateway } from "./payment.gateway";
import { LoyaltyService } from "./loyalty.service";
import { NotificationService } from "./notification.service";
import { ReferralService } from "./referral.service";
import { VoucherEngine, type VoucherLine } from "./voucher.engine";
import { PromoCodeModel } from "../models/promo-code.model";
import { promoToVoucher } from "./voucher-admin.service";
import { TIERS } from "~/lib/domain.types";
import { breakdown, resolveOptions, unitPrice as calcUnitPrice } from "~/lib/price";
import type { Voucher, CartLine, OrderStatus, SelectedOption } from "~/lib/domain.types";

// Status → push copy for transactional notifications (Sprint 6).
const STATUS_PUSH: Record<string, { type: any; title: string; body: string }> = {
  received: { type: "order_received", title: "Order received", body: "We've got your order — sit tight!" },
  preparing: { type: "order_preparing", title: "Preparing your order", body: "Our team is making it fresh." },
  ready: { type: "order_ready", title: "Your order is ready! 🎉", body: "Show your pickup code at the counter." },
  collected: { type: "order_collected", title: "Enjoy! 🍮", body: "Thanks for choosing Hong Tang." },
  cancelled: { type: "order_cancelled", title: "Order cancelled", body: "Any payment is refunded within 15 working days." },
};

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

function genPickupCode(): string {
  return "HT-" + crypto.randomInt(100, 1000) + "-" + crypto.randomInt(100, 1000);
}

// Voucher discount via the shared VoucherEngine (eligibility-aware).
function voucherDiscount(lines: VoucherLine[], voucher: Voucher | null): number {
  return voucher ? VoucherEngine.discount(voucher, lines) : 0;
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
  return breakdown(subtotal, voucherDiscount(lines, voucher));
}

interface ResolvedLine {
  itemId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  options: SelectedOption[];
}

/**
 * Re-derive every line from the catalog: real base price, validated options,
 * server-computed unit price. Rejects unavailable / sold-out items. Client-sent
 * prices are ignored entirely (Sprint 5 — never trust client totals).
 */
async function resolveLines(rawLines: CartLine[], outlet: any): Promise<ResolvedLine[]> {
  const soldOut = new Set((outlet.soldOutItemIds ?? []).map(String));
  const resolved: ResolvedLine[] = [];

  for (const line of rawLines) {
    const item = await MenuItemModel.findById(line.itemId).lean();
    if (!item) throw makeError(`An item in your cart is no longer available`, 409);
    if (item.available === false) throw makeError(`"${item.name}" is currently unavailable`, 409);
    if (soldOut.has(item._id.toString())) throw makeError(`"${item.name}" is sold out at this outlet`, 409);

    const qty = Math.max(1, Math.floor(Number(line.quantity) || 0));
    const options = resolveOptions(item.optionGroups ?? [], line.options ?? []);
    resolved.push({
      itemId: item._id.toString(),
      name: item.name,
      imageUrl: item.imageUrl,
      quantity: qty,
      unitPrice: calcUnitPrice(item.basePrice, options),
      options,
    });
  }
  return resolved;
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
    paymentStatus: o.paymentStatus ?? "paid",
    channel: o.channel ?? "app",
    cancellationReason: o.cancellationReason ?? null,
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
    const normalized = code.trim().toUpperCase();
    const walletVoucher = vouchers.find((v) => v.code.toUpperCase() === normalized && !v.used);

    let resolved: Voucher | null = walletVoucher ?? null;

    // Admin-built promo codes (Sprint 15) live in the DB; enforce caps + window.
    if (!resolved) {
      const promo = await PromoCodeModel.findOne({ code: normalized }).lean();
      if (!promo) throw makeError("Code not found or already used", 404);
      if (promo.status !== "active") throw makeError("This code is not active", 400);
      const now = Date.now();
      if (promo.validFrom && new Date(promo.validFrom).getTime() > now) throw makeError("This code isn't active yet", 400);
      if (promo.validUntil && new Date(promo.validUntil).getTime() < now) throw makeError("This code has expired", 400);
      if (promo.usageCapGlobal != null && promo.usedGlobal >= promo.usageCapGlobal) {
        throw makeError("This code has reached its usage limit", 400);
      }
      if (promo.usageCapPerUser != null && (promo.usedByUser?.[userId] ?? 0) >= promo.usageCapPerUser) {
        throw makeError("You've already used this code", 400);
      }
      resolved = promoToVoucher(promo);
    }

    // VoucherEngine enforces expiry, eligibility (items/categories), mode, min-spend.
    VoucherEngine.assertApplicable(resolved, { lines, fulfillmentMode: "pickup" });
    return resolved;
  }

  /** Place + pay → re-validate, recompute server-side, charge (idempotent), accrue loyalty. */
  static async checkout(
    userId: string,
    payload: {
      outletId: string;
      lines: CartLine[];
      voucherCode: string | null;
      paymentMethod: string;
      idempotencyKey?: string;
      channel?: string;
    },
  ) {
    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);
    if (!payload.lines?.length) throw makeError("Cart is empty", 400);

    // Idempotency: a retry with the same key returns the original order — no
    // second order, no second charge (Sprint 5 verification 3).
    const idempotencyKey = payload.idempotencyKey?.trim() || null;
    if (idempotencyKey) {
      const existing = await OrderModel.findOne({ userId, idempotencyKey }).lean();
      if (existing) return orderDto(existing);
    }

    // Re-validate outlet open + accepting pickup before last-order cutoff.
    const outlet = await OutletService.assertAcceptingOrders(payload.outletId);

    // Re-derive lines + totals server-side. Client prices are never trusted.
    const lines = await resolveLines(payload.lines, outlet);

    let voucher: Voucher | null = null;
    if (payload.voucherCode) {
      voucher = await OrderService.validateVoucher(userId, payload.voucherCode, payload.lines);
    }
    const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    const totals = breakdown(subtotal, voucherDiscount(lines, voucher));

    // Charge via gateway (idempotent). Failure keeps cart, creates no order.
    const charge = await paymentGateway.charge({
      idempotencyKey: idempotencyKey ?? crypto.randomUUID(),
      amount: totals.total,
      method: payload.paymentMethod || "QRIS",
      orderRef: genPickupCode(),
    });
    if (charge.status === "failed") {
      throw makeError("Payment was declined. Please try another method.", 402);
    }

    // Projected loyalty (display only). Actual credit happens on completion
    // (Sprint 7). Exclusions (channel / SKU) come from LoyaltyConfig (Sprint 14).
    const profile = LoyaltyService.ensure((user.profile ?? {}) as Record<string, any>);
    const channel = payload.channel || "app";
    const tier = LoyaltyService.effectiveTier(profile);
    const qualLines = lines.filter((l) => !LoyaltyService.isExcludedSku(l.itemId));
    const qualNet = LoyaltyService.isExcludedChannel(channel)
      ? 0
      : qualLines.reduce((s, l) => s + l.unitPrice * l.quantity, 0) - totals.discount;
    const crystalsEarned = LoyaltyService.crystalsFor(Math.max(0, qualNet), tier);
    const bowlsEarned = LoyaltyService.isExcludedChannel(channel)
      ? 0
      : qualLines.reduce((s, l) => s + l.quantity, 0);

    const now = new Date();
    let order;
    try {
      order = await OrderModel.create({
        userId,
        pickupCode: genPickupCode(),
        outletId: payload.outletId,
        outletName: outlet.name,
        status: "received",
        lines,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
        netSpend: totals.netSpend,
        crystalsEarned,
        bowlsEarned,
        voucherCode: voucher?.code ?? null,
        paymentMethod: payload.paymentMethod || "QRIS",
        paymentStatus: charge.status,
        idempotencyKey,
        channel,
        loyaltyAccrued: false,
        etaMinutes: outlet.prepMinutes,
        statusHistory: [{ status: "received", at: now.toISOString() }],
      });
    } catch (e: any) {
      // Unique-index race on idempotencyKey → return the winning order.
      if (e?.code === 11000 && idempotencyKey) {
        const existing = await OrderModel.findOne({ userId, idempotencyKey }).lean();
        if (existing) return orderDto(existing);
      }
      throw e;
    }

    const txn = await TransactionModel.create({
      userId,
      orderId: order._id.toString(),
      method: payload.paymentMethod || "QRIS",
      amount: totals.total,
      status: charge.status,
      gatewayRef: charge.gatewayRef,
      idempotencyKey,
      outletId: payload.outletId,
    });
    order.transactionId = txn._id.toString();
    await order.save();

    // Consume wallet voucher; or increment admin promo-code usage caps (Sprint 15).
    if (voucher && Array.isArray(profile.vouchers)) {
      const v = (profile.vouchers as Voucher[]).find((x) => x.code === voucher!.code);
      if (v) v.used = true;
    }
    if (voucher && voucher.source === "promo") {
      await PromoCodeModel.updateOne(
        { code: voucher.code.toUpperCase() },
        { $inc: { usedGlobal: 1, [`usedByUser.${userId}`]: 1 } },
      );
    }
    NotificationService.emit(profile, {
      ...STATUS_PUSH.received,
      data: { orderId: order._id.toString() },
    });
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

  /** Advance order status; emits push, credits loyalty + referral on completion. */
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
    if (next === order.status) return orderDto(order.toObject());

    order.status = next;
    order.statusHistory = [
      ...(order.statusHistory ?? []),
      { status: next, at: new Date().toISOString() },
    ];
    await order.save();

    // Load member once for notification + completion side-effects.
    const user = await UserModel.findById(order.userId);
    if (user) {
      const profile = LoyaltyService.ensure((user.profile ?? {}) as Record<string, any>);

      if (next === "collected" && !order.loyaltyAccrued) {
        await OrderService.creditCompletion(order, profile, user.id);
      }

      const push = STATUS_PUSH[next];
      if (push) {
        NotificationService.emit(profile, { ...push, data: { orderId: order.id } });
      }
      user.profile = profile;
      user.markModified("profile");
      await user.save();
    }

    return orderDto(order.toObject());
  }

  /** Credit Sugar Crystals + Bowls + fire referral qualification on completion. */
  private static async creditCompletion(order: any, profile: Record<string, any>, userId: string) {
    // Exclusions (channel / SKU) are config-driven (Sprint 14).
    const channelOk = !LoyaltyService.isExcludedChannel(order.channel ?? "app");
    const qualLines = (order.lines ?? []).filter((l: any) => !LoyaltyService.isExcludedSku(l.itemId));
    const qualNet = qualLines.reduce((s: number, l: any) => s + l.unitPrice * l.quantity, 0) - (order.discount ?? 0);

    if (channelOk && qualNet > 0) {
      const result = LoyaltyService.accrue(profile, {
        netSpend: Math.max(0, qualNet),
        bowlItems: qualLines.map((l: any) => ({ itemId: l.itemId, qty: l.quantity })),
      });
      order.crystalsEarned = result.crystalsEarned; // actual (multiplier at completion)
      order.bowlsEarned = result.bowlsEarned;

      if (result.crystalsEarned > 0) {
        NotificationService.emit(profile, {
          type: "crystals_earned",
          title: `You earned ${result.crystalsEarned} Sugar Crystals 💎`,
          body: "Crystals added to your balance.",
          data: { orderId: order.id },
        });
      }
      if (result.tieredUp) {
        const name = TIERS.find((t) => t.key === result.tierAfter)?.name ?? "a new tier";
        NotificationService.emit(profile, {
          type: "tier_up",
          title: `Welcome to ${name}! 🎉`,
          body: "You've unlocked new member perks.",
          data: { tier: result.tierAfter },
        });
      }
    }
    order.loyaltyAccrued = true;
    await order.save();

    // First qualifying purchase fires referrer reward (Sprint 9).
    await ReferralService.qualify(userId).catch(() => {});
  }

  static async cancelOrder(userId: string, orderId: string, reason?: string) {
    const order = await OrderModel.findOne({ _id: orderId, userId });
    if (!order) throw makeError("Order not found", 404);
    if (order.status === "collected") throw makeError("Order already collected", 409);
    if (order.status === "cancelled") return orderDto(order.toObject());

    // Reverse loyalty only if it was actually credited (completion).
    const user = await UserModel.findById(userId);
    if (user) {
      const p = LoyaltyService.ensure((user.profile ?? {}) as Record<string, any>);
      if (order.loyaltyAccrued) {
        LoyaltyService.reverse(p, order.crystalsEarned, order.bowlsEarned);
        order.loyaltyAccrued = false;
      }
      NotificationService.emit(p, { ...STATUS_PUSH.cancelled, data: { orderId: order.id } });
      user.profile = p;
      user.markModified("profile");
      await user.save();
    }

    // Refund through the gateway seam + mark the transaction refunded.
    if (order.transactionId) {
      const txn = await TransactionModel.findById(order.transactionId);
      if (txn && txn.status === "paid") {
        await paymentGateway.refund(txn.gatewayRef ?? "", txn.amount);
        txn.status = "refunded";
        await txn.save();
        order.paymentStatus = "refunded";
      }
    }

    order.cancellationReason = reason ?? null;
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
