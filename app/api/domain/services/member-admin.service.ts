import { UserModel } from "~/modules/authentication/authentication.model";
import { OrderModel } from "../models/order.model";
import { RewardRedemptionModel } from "../models/reward-redemption.model";
import { ReferralModel } from "../models/referral.model";
import { MemberAdjustmentModel } from "../models/member-adjustment.model";
import { LoyaltyService } from "./loyalty.service";
import { AuditService } from "./audit.service";
import { voucherFromTemplate } from "../rewards.catalog";
import type { AdminIdentity } from "../admin/rbac";
import type { Voucher } from "~/lib/domain.types";

type Actor = { id: string; admin?: AdminIdentity | null };

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

// Mask a phone number for display (no raw contact in console lists).
function maskPhone(phone?: string | null): string {
  if (!phone) return "";
  return phone.length <= 5 ? phone : phone.slice(0, 4) + "••••" + phone.slice(-3);
}

// Adjustments above these magnitudes require maker-checker dual approval (§14.19).
function needsApproval(type: string, payload: any): boolean {
  if (type === "tier_set" || type === "suspend" || type === "merge") return true;
  if ((type === "crystals_grant" || type === "crystals_deduct") && Math.abs(payload.amount ?? 0) > 100) return true;
  if (type === "bowls_adjust" && Math.abs(payload.delta ?? 0) > 5) return true;
  return false;
}

export class MemberAdminService {
  static async search(query: string) {
    const q = query.trim();
    let filter: any = { phone: { $ne: null } };
    if (q) {
      const or: any[] = [
        { phone: new RegExp(q.replace(/\D/g, "") || "\\b", "i") },
        { "profile.name": new RegExp(q, "i") },
      ];
      if (/^[a-f0-9]{24}$/i.test(q)) or.push({ _id: q });
      filter = { $and: [{ phone: { $ne: null } }, { $or: or }] };
    }
    const users = await UserModel.find(filter).limit(50).lean();
    return users
      .filter((u) => u.phone)
      .map((u) => {
        const p = (u.profile ?? {}) as Record<string, any>;
        return {
          id: u._id.toString(),
          name: p.name ?? "Tang Member",
          phoneMasked: maskPhone(u.phone),
          tier: LoyaltyService.effectiveTier(LoyaltyService.ensure(p)),
          suspended: !!p.suspended,
        };
      });
  }

  static async detail(memberId: string) {
    const user = await UserModel.findById(memberId);
    if (!user) throw makeError("Member not found", 404);
    const p = LoyaltyService.ensure((user.profile ?? {}) as Record<string, any>);

    const [orders, redemptions, referrals] = await Promise.all([
      OrderModel.find({ userId: memberId }).sort({ createdAt: -1 }).limit(20).lean(),
      RewardRedemptionModel.find({ userId: memberId }).sort({ createdAt: -1 }).limit(20).lean(),
      ReferralModel.find({ $or: [{ referrerId: memberId }, { refereeId: memberId }] }).lean(),
    ]);

    const ledger = (p.ledger ?? []) as any[];
    const lifetime = {
      earned: ledger.filter((l) => l.type === "earned").reduce((s, l) => s + l.amount, 0),
      redeemed: -ledger.filter((l) => l.type === "redeemed").reduce((s, l) => s + l.amount, 0),
      expired: -ledger.filter((l) => l.type === "expired").reduce((s, l) => s + l.amount, 0),
    };

    const timeline = [
      ...orders.map((o) => ({ kind: "order", at: o.createdAt, ref: o.pickupCode, detail: `${o.status} · Rp ${o.total}` })),
      ...redemptions.map((r) => ({ kind: "redemption", at: (r as any).createdAt, ref: r.rewardId, detail: `−${r.crystalCost} crystals` })),
      ...referrals.map((r) => ({ kind: "referral", at: (r as any).createdAt, ref: r.code, detail: r.status })),
      ...((p.notifications ?? []) as any[]).slice(0, 20).map((n) => ({ kind: "notification", at: n.at, ref: n.type, detail: n.title })),
    ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    return {
      profile: {
        id: user._id.toString(),
        name: p.name ?? "Tang Member",
        email: user.email?.endsWith("@phone.hongtang.id") ? null : user.email,
        gender: p.gender ?? null,
        birthday: p.birthday ?? null,
        phoneMasked: maskPhone(user.phone),
        country: p.country ?? "ID",
        marketingConsent: p.notificationPreferences ?? {},
        addresses: p.addresses ?? [],
        // payment metadata only — never PAN
        paymentMethods: (p.paymentMethods ?? []).map((m: any) => ({ brand: m.brand, last4: m.last4 })),
        suspended: !!p.suspended,
      },
      loyalty: {
        tier: LoyaltyService.effectiveTier(p),
        bowls: LoyaltyService.bowlsWindow(p),
        balance: LoyaltyService.balance(p),
        batches: p.crystalBatches ?? [],
        lifetime,
      },
      timeline: timeline.slice(0, 40),
    };
  }

  /** Apply an audited adjustment, or queue it for approval above threshold. */
  static async adjust(actor: Actor, memberId: string, type: string, payload: any, reason: string) {
    if (!reason?.trim()) throw makeError("A reason is required", 400);
    const user = await UserModel.findById(memberId);
    if (!user) throw makeError("Member not found", 404);

    if (needsApproval(type, payload)) {
      const adj = await MemberAdjustmentModel.create({ memberId, type, payload, reason, makerId: actor.id, status: "pending" });
      await AuditService.record({ actor, action: "member.adjust.request", entity: "member", entityId: memberId, after: { type, payload }, reason });
      return { status: "pending", adjustmentId: adj._id.toString() };
    }

    await MemberAdminService.applyAdjustment(user, type, payload, reason, actor);
    await MemberAdjustmentModel.create({ memberId, type, payload, reason, makerId: actor.id, status: "applied" });
    return { status: "applied" };
  }

  /** Second admin approves a pending adjustment → apply it (maker ≠ checker). */
  static async approveAdjustment(actor: Actor, adjustmentId: string) {
    const adj = await MemberAdjustmentModel.findById(adjustmentId);
    if (!adj) throw makeError("Adjustment not found", 404);
    if (adj.status !== "pending") throw makeError("Not pending approval", 409);
    if (adj.makerId === actor.id) throw makeError("Maker cannot approve their own request", 403);
    const user = await UserModel.findById(adj.memberId);
    if (!user) throw makeError("Member not found", 404);

    await MemberAdminService.applyAdjustment(user, adj.type, adj.payload, adj.reason, actor);
    adj.status = "approved";
    adj.checkerId = actor.id;
    await adj.save();
    return { status: "approved" };
  }

  private static async applyAdjustment(user: any, type: string, payload: any, reason: string, actor: Actor) {
    const p = LoyaltyService.ensure((user.profile ?? {}) as Record<string, any>);
    const before = { tier: p.tier, balance: LoyaltyService.balance(p), bowls: LoyaltyService.bowlsWindow(p), suspended: !!p.suspended };

    switch (type) {
      case "crystals_grant":
        LoyaltyService.grant(p, Number(payload.amount), `Goodwill: ${reason}`);
        break;
      case "crystals_deduct":
        LoyaltyService.redeem(p, Number(payload.amount), `Adjustment: ${reason}`);
        break;
      case "bowls_adjust":
        LoyaltyService.adjustBowls(p, Number(payload.delta));
        break;
      case "tier_set":
        LoyaltyService.setTier(p, payload.tier);
        break;
      case "goodwill_voucher":
        if (!Array.isArray(p.vouchers)) p.vouchers = [];
        (p.vouchers as Voucher[]).push(voucherFromTemplate(payload.template ?? { title: "Goodwill voucher", description: reason, discountType: "fixed", discountValue: payload.amount ?? 15000, minSpend: 0, validDays: 30, source: "reward" }, "GOODWILL"));
        break;
      case "reissue_welcome":
        p.welcomeGranted = false; // next /member/me re-grants
        break;
      case "suspend":
        p.suspended = true;
        user.is_active = false;
        break;
      case "merge":
        p.mergedInto = payload.targetId ?? null;
        break;
      default:
        throw makeError(`Unknown adjustment type: ${type}`, 400);
    }

    user.profile = p;
    user.markModified("profile");
    await user.save();
    await AuditService.record({
      actor, action: `member.adjust.${type}`, entity: "member", entityId: user._id.toString(),
      before, after: { tier: p.tier, balance: LoyaltyService.balance(p), bowls: LoyaltyService.bowlsWindow(p), suspended: !!p.suspended }, reason,
    });
  }
}
