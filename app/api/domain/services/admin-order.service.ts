import { OrderModel } from "../models/order.model";
import { OrderService } from "./order.service";
import { AuditService } from "./audit.service";
import { inScope, type AdminIdentity } from "../admin/rbac";
import type { OrderStatus } from "~/lib/domain.types";

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

// Default SLA: an order should reach "ready" within prep estimate + 5 min grace.
const SLA_GRACE_MS = 5 * 60_000;

function adminOrderDto(o: any) {
  const created = new Date(o.createdAt ?? Date.now()).getTime();
  const ageMs = Date.now() - created;
  const slaMs = (o.etaMinutes ?? 15) * 60_000 + SLA_GRACE_MS;
  const open = !["collected", "cancelled"].includes(o.status);
  return {
    id: o._id.toString(),
    pickupCode: o.pickupCode,
    outletId: o.outletId,
    outletName: o.outletName,
    status: o.status,
    channel: o.channel ?? "app",
    isThirdParty: (o.channel ?? "app") === "third-party",
    earnsLoyalty: (o.channel ?? "app") !== "third-party", // §14.4 flag
    lines: o.lines ?? [],
    total: o.total,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus ?? "paid",
    peakHourProceeded: !!o.peakHourProceeded,
    cancellationReason: o.cancellationReason ?? null,
    ageMinutes: Math.floor(ageMs / 60_000),
    slaBreached: open && ageMs > slaMs,
    createdAt: o.createdAt,
    statusHistory: o.statusHistory ?? [],
  };
}

// Restrict a query to the admin's outlet scope (empty scope = all).
function scopeFilter(identity: AdminIdentity, base: Record<string, any> = {}) {
  if (identity.outletScope.length > 0) base.outletId = { $in: identity.outletScope };
  return base;
}

export class AdminOrderService {
  /** Live order board for the admin's scope. */
  static async board(identity: AdminIdentity, outletId?: string) {
    const q = scopeFilter(identity, {});
    if (outletId) {
      if (!inScope(identity, outletId)) throw makeError("Outlet not in your scope", 403);
      q.outletId = outletId;
    }
    const orders = await OrderModel.find(q).sort({ createdAt: -1 }).limit(100).lean();
    return orders.map(adminOrderDto);
  }

  /** Search/filter across orders (scoped). */
  static async search(
    identity: AdminIdentity,
    opts: { query?: string; status?: string; channel?: string; outletId?: string },
  ) {
    const q = scopeFilter(identity, {});
    if (opts.status) q.status = opts.status;
    if (opts.channel) q.channel = opts.channel;
    if (opts.outletId) {
      if (!inScope(identity, opts.outletId)) throw makeError("Outlet not in your scope", 403);
      q.outletId = opts.outletId;
    }
    if (opts.query) {
      const rx = new RegExp(opts.query.trim(), "i");
      q.$or = [{ pickupCode: rx }, { outletName: rx }, { voucherCode: rx }];
    }
    const orders = await OrderModel.find(q).sort({ createdAt: -1 }).limit(100).lean();
    return orders.map(adminOrderDto);
  }

  /** Manual state override — requires a reason; writes an audit entry. */
  static async overrideState(
    identity: AdminIdentity,
    actorId: string,
    orderId: string,
    status: OrderStatus,
    reason: string,
  ) {
    if (!reason?.trim()) throw makeError("A reason is required for a manual override", 400);
    const order = await OrderModel.findById(orderId).lean();
    if (!order) throw makeError("Order not found", 404);
    if (!inScope(identity, order.outletId)) throw makeError("Order not in your scope", 403);

    const before = { status: order.status };
    const updated = await OrderService.advanceStatus(orderId, status);
    await AuditService.record({
      actor: { id: actorId, admin: identity },
      action: "order.override",
      entity: "order",
      entityId: orderId,
      before,
      after: { status: updated.status },
      reason,
    });
    return updated;
  }

  /** Cancel + refund per Rule 10.4 (delegates to OrderService); audited. */
  static async cancelRefund(identity: AdminIdentity, actorId: string, orderId: string, reason: string) {
    const order = await OrderModel.findById(orderId).lean();
    if (!order) throw makeError("Order not found", 404);
    if (!inScope(identity, order.outletId)) throw makeError("Order not in your scope", 403);

    const before = { status: order.status, paymentStatus: order.paymentStatus };
    const updated = await OrderService.cancelOrder(order.userId, orderId, reason || "Admin cancellation");
    await AuditService.record({
      actor: { id: actorId, admin: identity },
      action: "order.cancel_refund",
      entity: "order",
      entityId: orderId,
      before,
      after: { status: updated.status, paymentStatus: updated.paymentStatus },
      reason,
    });
    return updated;
  }
}
