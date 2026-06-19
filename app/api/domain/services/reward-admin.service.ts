import crypto from "node:crypto";
import { RewardModel } from "../models/reward.model";
import { RewardRedemptionModel } from "../models/reward-redemption.model";
import { REWARDS } from "../rewards.catalog";
import { AuditService } from "./audit.service";
import type { AdminIdentity } from "../admin/rbac";

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

// ── RewardAdminService (Sprint 14 §14.9) ─────────────────────────────────────
export class RewardAdminService {
  /** Seed the DB catalog from the static list on first boot (idempotent). */
  static async seedFromStatic() {
    const count = await RewardModel.countDocuments();
    if (count > 0) return;
    await RewardModel.insertMany(
      REWARDS.map((r, i) => ({
        slug: r.id,
        title: r.title,
        description: r.description,
        crystalCost: r.crystalCost,
        type: r.type,
        imageUrl: r.imageUrl,
        stockCap: (r as any).stockCap ?? null,
        perUserLimit: (r as any).perUserLimit ?? null,
        tierGate: (r as any).tierGate ?? null,
        voucherTemplate: r.voucherTemplate ?? null,
        enabled: true,
        sortOrder: i,
      })),
    );
  }

  static async list() {
    const rewards = await RewardModel.find().sort({ sortOrder: 1 }).lean();
    return rewards.map((r) => ({ ...r, id: r._id.toString() }));
  }

  static async create(data: any, actor: { id: string; admin?: AdminIdentity | null }) {
    const slug = data.slug || "rw-" + crypto.randomBytes(3).toString("hex");
    if (await RewardModel.findOne({ slug })) throw makeError("A reward with that slug exists", 409);
    const created = await RewardModel.create({
      slug,
      title: data.title,
      description: data.description ?? "",
      crystalCost: Number(data.crystalCost) || 0,
      type: data.type ?? "voucher",
      imageUrl: data.imageUrl ?? "",
      stockCap: data.stockCap != null ? Number(data.stockCap) : null,
      perUserLimit: data.perUserLimit != null ? Number(data.perUserLimit) : null,
      tierGate: data.tierGate ?? null,
      voucherTemplate: data.voucherTemplate ?? null,
      enabled: data.enabled ?? true,
      sortOrder: Number(data.sortOrder) || 0,
    });
    await AuditService.record({ actor, action: "reward.create", entity: "reward", entityId: slug, after: data });
    return created.toObject();
  }

  static async update(slug: string, patch: any, actor: { id: string; admin?: AdminIdentity | null }) {
    const reward = await RewardModel.findOne({ slug });
    if (!reward) throw makeError("Reward not found", 404);
    const before = reward.toObject();
    for (const k of ["title", "description", "imageUrl", "type", "tierGate", "voucherTemplate", "disabledReason"]) {
      if (patch[k] !== undefined) (reward as any)[k] = patch[k];
    }
    if (patch.crystalCost !== undefined) reward.crystalCost = Number(patch.crystalCost);
    if (patch.stockCap !== undefined) reward.stockCap = patch.stockCap === null ? null : Number(patch.stockCap);
    if (patch.perUserLimit !== undefined) reward.perUserLimit = patch.perUserLimit === null ? null : Number(patch.perUserLimit);
    if (patch.enabled !== undefined) {
      reward.enabled = !!patch.enabled;
      if (patch.enabled) reward.disabledReason = null;
    }
    if (patch.sortOrder !== undefined) reward.sortOrder = Number(patch.sortOrder);
    await reward.save();
    await AuditService.record({
      actor, action: "reward.update", entity: "reward", entityId: slug,
      before, after: reward.toObject(),
    });
    return reward.toObject();
  }

  static async remove(slug: string, actor: { id: string; admin?: AdminIdentity | null }) {
    const reward = await RewardModel.findOne({ slug }).lean();
    if (!reward) throw makeError("Reward not found", 404);
    await RewardModel.deleteOne({ slug });
    await AuditService.record({ actor, action: "reward.delete", entity: "reward", entityId: slug, before: reward });
    return { deleted: true };
  }

  /** Live redemption monitor: counts, remaining stock, depletion + abuse flags. */
  static async monitor() {
    const rewards = await RewardModel.find().sort({ sortOrder: 1 }).lean();
    return Promise.all(
      rewards.map(async (r) => {
        const redeemed = await RewardRedemptionModel.countDocuments({ rewardId: r.slug });
        const remaining = r.stockCap != null ? Math.max(0, r.stockCap - redeemed) : null;
        // Abuse heuristic: any user with > perUserLimit recorded redemptions.
        const overLimit = r.perUserLimit != null
          ? await RewardRedemptionModel.aggregate([
              { $match: { rewardId: r.slug } },
              { $group: { _id: "$userId", n: { $sum: 1 } } },
              { $match: { n: { $gt: r.perUserLimit } } },
              { $count: "c" },
            ]).then((a) => a[0]?.c ?? 0)
          : 0;
        return {
          slug: r.slug,
          title: r.title,
          enabled: r.enabled,
          redeemed,
          stockCap: r.stockCap,
          remaining,
          depletionAlert: r.stockCap != null && remaining === 0,
          abuseFlags: overLimit,
        };
      }),
    );
  }
}
