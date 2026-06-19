import { UserModel } from "~/modules/authentication/authentication.model";
import { OrderModel } from "../models/order.model";
import { SegmentModel } from "../models/segment.model";
import { LoyaltyService } from "./loyalty.service";
import { AuditService } from "./audit.service";
import type { AdminIdentity } from "../admin/rbac";

type Actor = { id: string; admin?: AdminIdentity | null };

// ── SegmentService (Sprint 16) — criteria → member set ───────────────────────
// Reused by campaigns (Sprint 18) and voucher targeting (Sprint 15).
export class SegmentService {
  /** Resolve criteria to a concrete member-id list (materialization). */
  static async resolve(criteria: Record<string, any>): Promise<string[]> {
    const users = await UserModel.find({ phone: { $ne: null }, "profile.onboarded": true }).lean();

    // Members active within N days (by order recency).
    let activeSet: Set<string> | null = null;
    if (criteria.activeWithinDays) {
      const since = new Date(Date.now() - Number(criteria.activeWithinDays) * 86400_000);
      const ids = await OrderModel.distinct("userId", { createdAt: { $gte: since } });
      activeSet = new Set(ids.map(String));
    }

    return users
      .filter((u) => {
        const p = LoyaltyService.ensure((u.profile ?? {}) as Record<string, any>);
        if (criteria.tier && LoyaltyService.effectiveTier(p) !== criteria.tier) return false;
        if (criteria.minBowls != null && LoyaltyService.bowlsWindow(p) < Number(criteria.minBowls)) return false;
        if (criteria.country && (p.country ?? "ID") !== criteria.country) return false;
        if (criteria.consentCategory && p.notificationPreferences?.[criteria.consentCategory] === false) return false;
        if (activeSet && !activeSet.has(u._id.toString())) return false;
        return true;
      })
      .map((u) => u._id.toString());
  }

  static async preview(criteria: Record<string, any>) {
    const ids = await SegmentService.resolve(criteria);
    return { size: ids.length, sample: ids.slice(0, 10) };
  }

  static async create(name: string, criteria: Record<string, any>, actor: Actor) {
    const memberIds = await SegmentService.resolve(criteria);
    const seg = await SegmentModel.create({ name, criteria, memberIds, size: memberIds.length });
    await AuditService.record({ actor, action: "segment.create", entity: "segment", entityId: seg._id.toString(), after: { name, criteria, size: memberIds.length } });
    return { id: seg._id.toString(), name, size: memberIds.length };
  }

  static async list() {
    const segs = await SegmentModel.find().sort({ createdAt: -1 }).lean();
    return segs.map((s) => ({ id: s._id.toString(), name: s.name, criteria: s.criteria, size: s.size }));
  }

  /** Re-materialize a saved segment's membership. */
  static async refresh(id: string) {
    const seg = await SegmentModel.findById(id);
    if (!seg) throw Object.assign(new Error("Segment not found"), { statusCode: 404 });
    seg.memberIds = await SegmentService.resolve(seg.criteria);
    seg.size = seg.memberIds.length;
    await seg.save();
    return { id, size: seg.size };
  }
}
