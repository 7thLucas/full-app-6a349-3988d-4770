import crypto from "node:crypto";
import { UserModel } from "~/modules/authentication/authentication.model";
import { RewardRedemptionModel } from "../models/reward-redemption.model";
import { REWARDS } from "../rewards.catalog";
import { LoyaltyService } from "./loyalty.service";
import { NotificationService } from "./notification.service";
import { TIERS } from "~/lib/domain.types";
import type { Voucher, TierKey } from "~/lib/domain.types";

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

function tierIndex(tier: TierKey): number {
  return TIERS.findIndex((t) => t.key === tier);
}

// ── RewardsService (Sprint 8) ────────────────────────────────────────────────
// Atomic + idempotent redemption: deduct Crystals via LoyaltyService and grant a
// voucher, with stock / per-user-limit / tier-gate checks.
export class RewardsService {
  /** Rewards with affordability + gating annotated for the current member. */
  static async listForMember(userId: string) {
    const user = await UserModel.findById(userId);
    const profile = user ? LoyaltyService.ensure((user.profile ?? {}) as Record<string, any>) : null;
    const balance = profile ? LoyaltyService.balance(profile) : 0;
    const tier = profile ? LoyaltyService.effectiveTier(profile) : "seeker";

    return Promise.all(
      REWARDS.map(async (r) => {
        const redeemedTotal = await RewardRedemptionModel.countDocuments({ rewardId: r.id });
        const redeemedByUser = userId
          ? await RewardRedemptionModel.countDocuments({ rewardId: r.id, userId })
          : 0;
        const outOfStock = r.stockCap != null && redeemedTotal >= r.stockCap;
        const limitReached = r.perUserLimit != null && redeemedByUser >= r.perUserLimit;
        const tierLocked = r.tierGate ? tierIndex(tier) < tierIndex(r.tierGate) : false;
        const affordable = balance >= r.crystalCost;
        return {
          ...r,
          redeemable: affordable && !outOfStock && !limitReached && !tierLocked,
          reason: !affordable
            ? "Not enough Sugar Crystals"
            : tierLocked
              ? `Unlocks at ${TIERS.find((t) => t.key === r.tierGate)?.name}`
              : outOfStock
                ? "Out of stock"
                : limitReached
                  ? "Limit reached"
                  : null,
        };
      }),
    );
  }

  static async redeem(userId: string, rewardId: string, idempotencyKey?: string) {
    const reward = REWARDS.find((r) => r.id === rewardId);
    if (!reward) throw makeError("Reward not found", 404);

    const key = idempotencyKey?.trim() || null;
    if (key) {
      const prior = await RewardRedemptionModel.findOne({ userId, idempotencyKey: key }).lean();
      if (prior) {
        // Idempotent: return current snapshot without a second deduction.
        const u = await UserModel.findById(userId);
        return { member: memberLoyaltySnapshot(u), idempotentReplay: true };
      }
    }

    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);
    const profile = LoyaltyService.ensure((user.profile ?? {}) as Record<string, any>);

    // Gating checks (tier / stock / per-user limit) before any deduction.
    const tier = LoyaltyService.effectiveTier(profile);
    if (reward.tierGate && tierIndex(tier) < tierIndex(reward.tierGate)) {
      throw makeError(`Requires ${TIERS.find((t) => t.key === reward.tierGate)?.name} tier`, 403);
    }
    if (reward.stockCap != null) {
      const total = await RewardRedemptionModel.countDocuments({ rewardId });
      if (total >= reward.stockCap) throw makeError("This reward is out of stock", 409);
    }
    if (reward.perUserLimit != null) {
      const mine = await RewardRedemptionModel.countDocuments({ rewardId, userId });
      if (mine >= reward.perUserLimit) throw makeError("You've reached the limit for this reward", 409);
    }

    // Deduct crystals (throws if insufficient — balance untouched on failure).
    LoyaltyService.redeem(profile, reward.crystalCost, `Redeemed: ${reward.title}`);

    // Grant the voucher.
    const voucher = buildVoucher(reward);
    if (!Array.isArray(profile.vouchers)) profile.vouchers = [];
    (profile.vouchers as Voucher[]).push(voucher);

    // Record redemption (unique idempotencyKey guards double-tap races).
    try {
      await RewardRedemptionModel.create({
        userId,
        rewardId,
        crystalCost: reward.crystalCost,
        voucherId: voucher.id,
        idempotencyKey: key,
      });
    } catch (e: any) {
      if (e?.code === 11000 && key) {
        const u = await UserModel.findById(userId);
        return { member: memberLoyaltySnapshot(u), idempotentReplay: true };
      }
      throw e;
    }

    NotificationService.emit(profile, {
      type: "marketing",
      category: "loyalty_news",
      title: "Voucher added to My Vouchers 🎟️",
      body: reward.title,
    });

    user.profile = profile;
    user.markModified("profile");
    await user.save();
    return { member: memberLoyaltySnapshot(user), voucher };
  }
}

function buildVoucher(reward: any): Voucher {
  const now = Date.now();
  if (reward.type === "voucher" && reward.voucherTemplate) {
    const t = reward.voucherTemplate;
    return {
      id: "v-" + now + crypto.randomBytes(2).toString("hex"),
      code: reward.id.toUpperCase() + "-" + now.toString(36).toUpperCase().slice(-4),
      title: t.title,
      description: t.description,
      discountType: t.discountType,
      discountValue: t.discountValue,
      minSpend: t.minSpend,
      eligibleItemIds: t.eligibleItemIds,
      eligibleCategories: t.eligibleCategories,
      fulfillmentModes: t.fulfillmentModes,
      expiresAt: new Date(now + t.validDays * 86400_000).toISOString(),
      used: false,
      source: "reward",
    };
  }
  // Merch/experience → collection voucher shown in wallet / at counter.
  return {
    id: "v-merch-" + now,
    code: "MERCH-" + now.toString(36).toUpperCase().slice(-4),
    title: `Collect: ${reward.title}`,
    description: "Show this at the counter to collect your reward.",
    discountType: "fixed",
    discountValue: 0,
    minSpend: 0,
    expiresAt: new Date(now + 60 * 86400_000).toISOString(),
    used: false,
    source: "reward",
  };
}

// Lightweight loyalty snapshot (used for idempotent-replay returns).
function memberLoyaltySnapshot(user: any) {
  if (!user) return null;
  const p = LoyaltyService.ensure((user.profile ?? {}) as Record<string, any>);
  return {
    crystals: LoyaltyService.balance(p),
    bowls: LoyaltyService.bowlsWindow(p),
    tier: LoyaltyService.effectiveTier(p),
    vouchers: (p.vouchers as Voucher[]) ?? [],
  };
}
