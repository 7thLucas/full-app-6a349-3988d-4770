import crypto from "node:crypto";
import { UserModel } from "~/modules/authentication/authentication.model";
import { ReferralModel } from "../models/referral.model";
import { referrerRewardVoucher } from "../rewards.catalog";
import { LoyaltyService } from "./loyalty.service";
import { NotificationService } from "./notification.service";
import type { Voucher } from "~/lib/domain.types";

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

// ── AntiAbusePolicy (Sprint 9) ───────────────────────────────────────────────
// Campaign-tunable caps (admin-configurable in Sprint 15). Conservative defaults.
const AntiAbusePolicy = {
  perUserRewardCap: 20, // lifetime rewards a single referrer can earn
  dailyVelocityCap: 5, // rewards per referrer per rolling 24h
};

export class ReferralService {
  static generateCode(): string {
    return "TANG" + crypto.randomBytes(3).toString("hex").toUpperCase();
  }

  /** Look up the referrer for a code. Throws on unknown code. */
  static async resolveReferrer(code: string) {
    const normalized = code.trim().toUpperCase();
    const referrer = await UserModel.findOne({ "profile.referralCode": normalized });
    if (!referrer) throw makeError("Invalid referral code", 404);
    return referrer;
  }

  /** Validate at registration time (referee must be a first-timer, no self-ref). */
  static async validateCode(code: string, refereeUserId?: string) {
    const referrer = await ReferralService.resolveReferrer(code);
    if (refereeUserId && referrer.id === refereeUserId) {
      throw makeError("You can't use your own referral code", 400);
    }
    return { valid: true, referrerId: referrer.id };
  }

  /**
   * Attribute a code to a first-time referee (called from registration).
   * Blocks self-referral and double-attribution. Returns the created record.
   */
  static async attribute(refereeUserId: string, code: string) {
    const referee = await UserModel.findById(refereeUserId);
    if (!referee) throw makeError("User not found", 404);
    if (referee.profile?.onboarded) {
      throw makeError("Referral codes can only be applied during sign-up", 400);
    }

    const referrer = await ReferralService.resolveReferrer(code);
    if (referrer.id === referee.id) throw makeError("You can't refer yourself", 400);

    const existing = await ReferralModel.findOne({ refereeId: referee.id });
    if (existing) throw makeError("A referral code was already applied", 400);

    await ReferralModel.create({
      referrerId: referrer.id,
      refereeId: referee.id,
      code: (referrer.profile?.referralCode as string) ?? code.toUpperCase(),
      status: "pending",
    });

    const p = (referee.profile ?? {}) as Record<string, any>;
    p.referredBy = (referrer.profile?.referralCode as string) ?? code.toUpperCase();
    referee.profile = p;
    referee.markModified("profile");
    await referee.save();
    return { attributed: true };
  }

  /**
   * Fire on the referee's first qualifying (completed) order. Rewards the
   * referrer once, subject to anti-abuse caps. Idempotent per referral.
   */
  static async qualify(refereeUserId: string) {
    const referral = await ReferralModel.findOne({ refereeId: refereeUserId });
    if (!referral || referral.status === "rewarded") return { rewarded: false };

    const referrer = await UserModel.findById(referral.referrerId);
    if (!referrer) return { rewarded: false };

    // Anti-abuse: lifetime cap + 24h velocity.
    const rewardedCount = await ReferralModel.countDocuments({
      referrerId: referral.referrerId,
      status: "rewarded",
    });
    if (rewardedCount >= AntiAbusePolicy.perUserRewardCap) {
      referral.status = "qualified"; // qualified but capped — no reward
      await referral.save();
      return { rewarded: false, reason: "cap" };
    }
    const since = new Date(Date.now() - 86400_000);
    const recent = await ReferralModel.countDocuments({
      referrerId: referral.referrerId,
      status: "rewarded",
      rewardedAt: { $gte: since },
    });
    if (recent >= AntiAbusePolicy.dailyVelocityCap) {
      referral.status = "qualified";
      await referral.save();
      return { rewarded: false, reason: "velocity" };
    }

    // Grant the referrer reward voucher + notify.
    const p = LoyaltyService.ensure((referrer.profile ?? {}) as Record<string, any>);
    if (!Array.isArray(p.vouchers)) p.vouchers = [];
    (p.vouchers as Voucher[]).push(referrerRewardVoucher());
    NotificationService.emit(p, {
      type: "referral_reward",
      title: "Referral reward earned! 🎁",
      body: "Your friend made their first order — enjoy your reward.",
    });
    referrer.profile = p;
    referrer.markModified("profile");
    await referrer.save();

    referral.status = "rewarded";
    referral.rewardedAt = new Date();
    await referral.save();
    return { rewarded: true };
  }

  /** Referral code + stats for the member's referral view. */
  static async stats(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);
    const p = (user.profile ?? {}) as Record<string, any>;
    if (!p.referralCode) {
      p.referralCode = ReferralService.generateCode();
      user.profile = p;
      user.markModified("profile");
      await user.save();
    }
    const records = await ReferralModel.find({ referrerId: userId }).sort({ createdAt: -1 }).lean();
    const rewarded = records.filter((r) => r.status === "rewarded").length;
    const pending = records.filter((r) => r.status !== "rewarded").length;
    return {
      code: p.referralCode as string,
      totalInvited: records.length,
      rewarded,
      pending,
      referrals: records.map((r) => ({ status: r.status, at: (r as any).createdAt })),
    };
  }
}
