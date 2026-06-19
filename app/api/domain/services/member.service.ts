import { UserModel } from "~/modules/authentication/authentication.model";
import { PhoneOtpService } from "~/modules/authentication/phone-otp.service";
import { LoyaltyService } from "./loyalty.service";
import { NotificationService } from "./notification.service";
import { RewardsService } from "./rewards.service";
import type { Voucher } from "~/lib/domain.types";
import { welcomeVoucher, referralWelcomeVoucher } from "../rewards.catalog";

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

function ensureProfile(user: any) {
  const p = LoyaltyService.ensure((user.profile ?? {}) as Record<string, any>);
  if (!Array.isArray(p.vouchers)) p.vouchers = [];
  if (!Array.isArray(p.favorites)) p.favorites = [];
  if (!Array.isArray(p.addresses)) p.addresses = [];
  if (!Array.isArray(p.paymentMethods)) p.paymentMethods = [];
  if (!p.notificationPreferences) p.notificationPreferences = NotificationService.defaultPreferences();
  if (!p.referralCode) p.referralCode = PhoneOtpService.genReferralCode();
  return p;
}

export function memberSnapshot(user: any) {
  const p = ensureProfile(user);
  const bowls = LoyaltyService.bowlsWindow(p);
  return {
    name: p.name ?? "Tang Member",
    phone: user.phone ?? "",
    birthday: p.birthday ?? null,
    email: user.email?.endsWith("@phone.hongtang.id") ? null : user.email,
    gender: p.gender ?? null,
    referralCode: p.referralCode,
    crystals: LoyaltyService.balance(p),
    bowls,
    tier: LoyaltyService.effectiveTier(p),
    joinedAt: (user.createdAt as Date)?.toISOString?.() ?? new Date().toISOString(),
    vouchers: (p.vouchers as Voucher[]) ?? [],
    favorites: (p.favorites as string[]) ?? [],
    addresses: p.addresses ?? [],
    paymentMethods: p.paymentMethods ?? [],
    notificationPreferences: p.notificationPreferences,
    expiringSoon: LoyaltyService.expiringSoon(p).map((b) => ({ amount: b.remaining, expiresAt: b.expiresAt })),
    onboarded: !!p.onboarded,
    deletionRequested: !!p.deletionRequested,
  };
}

export class MemberService {
  static async getMember(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);
    const p = ensureProfile(user);

    // Expire aged-out crystal batches on read.
    LoyaltyService.expireSweep(p);

    // Welcome grant once after onboarding (referee bonus if referred).
    if (p.onboarded && !p.welcomeGranted) {
      (p.vouchers as Voucher[]).push(welcomeVoucher());
      if (p.referredBy) (p.vouchers as Voucher[]).push(referralWelcomeVoucher());
      p.welcomeGranted = true;
    }

    user.profile = p;
    user.markModified("profile");
    await user.save();
    return memberSnapshot(user);
  }

  /** Sugar Crystal transaction history (earned/redeemed/expired) + running balance. */
  static async crystalHistory(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);
    const p = ensureProfile(user);
    return {
      balance: LoyaltyService.balance(p),
      batches: p.crystalBatches ?? [],
      ledger: [...(p.ledger ?? [])].reverse(), // newest first
    };
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

  static async redeemReward(userId: string, rewardId: string, idempotencyKey?: string) {
    await RewardsService.redeem(userId, rewardId, idempotencyKey);
    const user = await UserModel.findById(userId);
    return memberSnapshot(user);
  }
}
