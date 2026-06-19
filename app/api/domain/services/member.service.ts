import { UserModel } from "~/modules/authentication/authentication.model";
import { PhoneOtpService } from "~/modules/authentication/phone-otp.service";
import { tierForBowls } from "~/lib/domain.types";
import type { Voucher } from "~/lib/domain.types";
import {
  REWARDS,
  welcomeVoucher,
  referralWelcomeVoucher,
  referrerRewardVoucher,
} from "../rewards.catalog";

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

function ensureProfile(user: any) {
  const p = (user.profile ?? {}) as Record<string, any>;
  if (typeof p.crystals !== "number") p.crystals = 0;
  if (typeof p.bowls !== "number") p.bowls = 0;
  if (!Array.isArray(p.vouchers)) p.vouchers = [];
  if (!p.referralCode) p.referralCode = PhoneOtpService.genReferralCode();
  return p;
}

export function memberSnapshot(user: any) {
  const p = ensureProfile(user);
  const bowls = p.bowls as number;
  return {
    name: p.name ?? "Tang Member",
    phone: user.phone ?? "",
    birthday: p.birthday ?? null,
    referralCode: p.referralCode,
    crystals: p.crystals as number,
    bowls,
    tier: tierForBowls(bowls).key,
    joinedAt: (user.createdAt as Date)?.toISOString?.() ?? new Date().toISOString(),
    vouchers: (p.vouchers as Voucher[]) ?? [],
    favorites: (p.favorites as string[]) ?? [],
    onboarded: !!p.onboarded,
  };
}

export class MemberService {
  static async getMember(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);
    const p = ensureProfile(user);
    // First-ever fetch: grant welcome voucher if member has none and is onboarded.
    if (p.onboarded && !p.welcomeGranted) {
      (p.vouchers as Voucher[]).push(welcomeVoucher());
      p.welcomeGranted = true;
      // Referral: referee gets a bonus voucher, referrer gets rewarded once.
      if (p.referredBy) {
        (p.vouchers as Voucher[]).push(referralWelcomeVoucher());
        await MemberService.rewardReferrer(p.referredBy);
      }
      user.profile = p;
      user.markModified("profile");
      await user.save();
    }
    return memberSnapshot(user);
  }

  static async rewardReferrer(referralCode: string) {
    const referrer = await UserModel.findOne({ "profile.referralCode": referralCode });
    if (!referrer) return;
    const p = ensureProfile(referrer);
    (p.vouchers as Voucher[]).push(referrerRewardVoucher());
    referrer.profile = p;
    referrer.markModified("profile");
    await referrer.save();
  }

  static async toggleFavorite(userId: string, itemId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);
    const p = ensureProfile(user);
    const favs = new Set<string>(p.favorites ?? []);
    if (favs.has(itemId)) favs.delete(itemId);
    else favs.add(itemId);
    p.favorites = [...favs];
    user.profile = p;
    user.markModified("profile");
    await user.save();
    return p.favorites as string[];
  }

  static async redeemReward(userId: string, rewardId: string) {
    const reward = REWARDS.find((r) => r.id === rewardId);
    if (!reward) throw makeError("Reward not found", 404);
    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);
    const p = ensureProfile(user);
    if ((p.crystals as number) < reward.crystalCost) {
      throw makeError("Not enough Sugar Crystals", 400);
    }
    // Spending Crystals NEVER lowers tier (tier is bowls-only).
    p.crystals = (p.crystals as number) - reward.crystalCost;

    if (reward.type === "voucher" && reward.voucherTemplate) {
      const t = reward.voucherTemplate;
      const voucher: Voucher = {
        id: "v-" + Date.now() + Math.random().toString(36).slice(2, 6),
        code: reward.id.toUpperCase() + "-" + Date.now().toString(36).toUpperCase().slice(-4),
        title: t.title,
        description: t.description,
        discountType: t.discountType,
        discountValue: t.discountValue,
        minSpend: t.minSpend,
        expiresAt: new Date(Date.now() + t.validDays * 86400_000).toISOString(),
        used: false,
        source: "reward",
      };
      (p.vouchers as Voucher[]).push(voucher);
    } else {
      // Merch redemption — record a collection voucher to show in wallet/in-store.
      const voucher: Voucher = {
        id: "v-merch-" + Date.now(),
        code: "MERCH-" + Date.now().toString(36).toUpperCase().slice(-4),
        title: `Collect: ${reward.title}`,
        description: "Show this at the counter to collect your merch.",
        discountType: "fixed",
        discountValue: 0,
        minSpend: 0,
        expiresAt: new Date(Date.now() + 60 * 86400_000).toISOString(),
        used: false,
        source: "reward",
      };
      (p.vouchers as Voucher[]).push(voucher);
    }

    user.profile = p;
    user.markModified("profile");
    await user.save();
    return memberSnapshot(user);
  }
}
