import { UserModel } from "~/modules/authentication/authentication.model";
import { OrderModel } from "../models/order.model";
import { SupportTicketModel } from "../models/support-ticket.model";
import { LoyaltyService } from "./loyalty.service";
import { NotificationService } from "./notification.service";
import { AuditService } from "./audit.service";
import { voucherFromTemplate } from "../rewards.catalog";
import type { AdminIdentity } from "../admin/rbac";
import type { Voucher } from "~/lib/domain.types";

type Actor = { id: string; admin?: AdminIdentity | null };

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

// ── GoodwillPolicy (Sprint 16) — per-agent daily caps on goodwill actions ────
const GoodwillPolicy = {
  maxCrystalsPerDay: 200,
  maxVouchersPerDay: 5,
};

export class SupportService {
  /**
   * Read-only impersonation snapshot — the member's app state as they'd see it.
   * Strictly read-only: this method only reads; no mutation path exists.
   */
  static async impersonateView(memberId: string) {
    const user = await UserModel.findById(memberId);
    if (!user) throw makeError("Member not found", 404);
    const p = LoyaltyService.ensure((user.profile ?? {}) as Record<string, any>);
    const orders = await OrderModel.find({ userId: memberId }).sort({ createdAt: -1 }).limit(10).lean();
    return {
      readOnly: true,
      name: p.name ?? "Tang Member",
      tier: LoyaltyService.effectiveTier(p),
      crystals: LoyaltyService.balance(p),
      bowls: LoyaltyService.bowlsWindow(p),
      vouchers: (p.vouchers as Voucher[] ?? []).filter((v) => !v.used),
      recentOrders: orders.map((o) => ({ pickupCode: o.pickupCode, status: o.status, total: o.total })),
      notifications: (p.notifications ?? []).slice(0, 10),
    };
  }

  // Sum today's goodwill by this agent for cap enforcement.
  private static async agentToday(agentId: string, action: string) {
    const since = new Date(Date.now() - 86400_000);
    return SupportTicketModel.find({ agentId, action, createdAt: { $gte: since } }).lean();
  }

  static async cannedAction(actor: Actor, memberId: string, action: string, detail: any = {}) {
    const user = await UserModel.findById(memberId);
    if (!user) throw makeError("Member not found", 404);
    const p = LoyaltyService.ensure((user.profile ?? {}) as Record<string, any>);

    switch (action) {
      case "resend_receipt": {
        const order = await OrderModel.findOne({ userId: memberId }).sort({ createdAt: -1 }).lean();
        if (!order) throw makeError("No order to resend", 404);
        NotificationService.emit(p, { type: "order_collected", title: "Your receipt", body: `Receipt for ${order.pickupCode}`, data: { orderId: order._id.toString() } });
        break;
      }
      case "retrigger_notification":
        NotificationService.emit(p, { type: "order_ready", title: detail.title ?? "Update", body: detail.body ?? "From Hong Tang support" });
        break;
      case "goodwill_crystals": {
        const amount = Number(detail.amount) || 0;
        const prior = await SupportService.agentToday(actor.id, "goodwill_crystals");
        const usedToday = prior.reduce((s, t) => s + (t.detail?.amount ?? 0), 0);
        if (usedToday + amount > GoodwillPolicy.maxCrystalsPerDay) {
          throw makeError(`Daily goodwill crystal cap (${GoodwillPolicy.maxCrystalsPerDay}) exceeded`, 429);
        }
        LoyaltyService.grant(p, amount, `Support goodwill: ${detail.reason ?? ""}`);
        break;
      }
      case "goodwill_voucher": {
        const prior = await SupportService.agentToday(actor.id, "goodwill_voucher");
        if (prior.length >= GoodwillPolicy.maxVouchersPerDay) {
          throw makeError(`Daily goodwill voucher cap (${GoodwillPolicy.maxVouchersPerDay}) exceeded`, 429);
        }
        if (!Array.isArray(p.vouchers)) p.vouchers = [];
        (p.vouchers as Voucher[]).push(voucherFromTemplate({ title: "Goodwill voucher", description: detail.reason ?? "On us", discountType: "fixed", discountValue: detail.amount ?? 15000, minSpend: 0, validDays: 30, source: "reward" }, "GOODWILL"));
        break;
      }
      default:
        throw makeError(`Unknown canned action: ${action}`, 400);
    }

    user.profile = p;
    user.markModified("profile");
    await user.save();
    await SupportTicketModel.create({ memberId, agentId: actor.id, action, detail, note: detail.reason ?? "" });
    await AuditService.record({ actor, action: `support.${action}`, entity: "member", entityId: memberId, after: detail, reason: detail.reason });
    return { done: true };
  }
}
