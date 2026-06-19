import crypto from "node:crypto";
import { TIERS, tierForBowls, computeCrystals } from "~/lib/domain.types";
import type { TierKey } from "~/lib/domain.types";

// ── LoyaltyService (Sprint 7) — the core earn/spend/tier engine ──────────────
// Pure mutations over a member `profile` bag; the caller persists. Rules live
// behind small policy objects (EarnRule / BowlsCounter / TierPolicy) so admin
// (Sprint 13/14) can reconfigure without touching consumer flows.

const YEAR_MS = 365 * 86400_000;
const BATCH_TTL_MS = YEAR_MS; // per-batch Sugar Crystal expiry (PRD §10)
const EXPIRY_REMINDER_MS = 7 * 86400_000;

export interface CrystalBatch {
  id: string;
  amount: number; // originally earned
  remaining: number; // unspent / unexpired
  earnedAt: string;
  expiresAt: string;
  reminded?: boolean;
}

export interface BowlEvent {
  itemId: string;
  qty: number;
  at: string;
}

export type LedgerType = "earned" | "redeemed" | "expired";

export interface LedgerEntry {
  id: string;
  type: LedgerType;
  amount: number; // +earned / −redeemed / −expired
  at: string;
  balanceAfter: number;
  note: string;
}

export interface TierChange {
  tier: TierKey;
  at: string;
  reason: "earn" | "recalc" | "init";
}

function uid(p: string): string {
  return p + "-" + crypto.randomBytes(5).toString("hex");
}

// ── EarnRule ─────────────────────────────────────────────────────────────────
// 1 crystal per Rp 1.000 of net spend (subtotal after discount, excl. PB1/
// delivery), times the tier multiplier, floored.
const EarnRule = {
  crystals(netSpend: number, multiplier: number): number {
    if (netSpend <= 0) return 0;
    return computeCrystals(netSpend, multiplier);
  },
};

// ── TierPolicy ───────────────────────────────────────────────────────────────
const TierPolicy = {
  forBowls(bowls: number): TierKey {
    return tierForBowls(bowls).key;
  },
  multiplier(tier: TierKey): number {
    return TIERS.find((t) => t.key === tier)?.multiplier ?? 1;
  },
  // One-tier-max downgrade (month-end). Never drops more than a single step.
  stepDown(current: TierKey, target: TierKey): TierKey {
    const ci = TIERS.findIndex((t) => t.key === current);
    const ti = TIERS.findIndex((t) => t.key === target);
    if (ti >= ci) return current; // no downgrade
    return TIERS[Math.max(ci - 1, ti)].key;
  },
};

export class LoyaltyService {
  static ensure(profile: Record<string, any>) {
    if (!Array.isArray(profile.crystalBatches)) profile.crystalBatches = [];
    if (!Array.isArray(profile.bowlEvents)) {
      // Migrate any legacy scalar bowls into a single dated event.
      profile.bowlEvents = [];
      const legacy = Number(profile.bowls) || 0;
      if (legacy > 0) {
        profile.bowlEvents.push({ itemId: "legacy", qty: legacy, at: new Date(0).toISOString() });
      }
    }
    if (!Array.isArray(profile.ledger)) {
      profile.ledger = [];
      const legacy = Number(profile.crystals) || 0;
      if (legacy > 0) {
        const now = new Date();
        profile.crystalBatches.push({
          id: uid("batch"),
          amount: legacy,
          remaining: legacy,
          earnedAt: now.toISOString(),
          expiresAt: new Date(now.getTime() + BATCH_TTL_MS).toISOString(),
        });
        profile.ledger.push({
          id: uid("led"),
          type: "earned",
          amount: legacy,
          at: now.toISOString(),
          balanceAfter: legacy,
          note: "Opening balance",
        });
      }
    }
    if (!Array.isArray(profile.tierHistory)) profile.tierHistory = [];
    if (!profile.tier) profile.tier = "seeker";
    return profile;
  }

  static balance(profile: Record<string, any>): number {
    return (profile.crystalBatches as CrystalBatch[]).reduce((s, b) => s + Math.max(0, b.remaining), 0);
  }

  /** Bowls in the trailing 365-day window (BowlsCounter). */
  static bowlsWindow(profile: Record<string, any>, now: Date = new Date()): number {
    const cutoff = now.getTime() - YEAR_MS;
    return (profile.bowlEvents as BowlEvent[])
      .filter((e) => new Date(e.at).getTime() >= cutoff || e.itemId === "legacy")
      .reduce((s, e) => s + e.qty, 0);
  }

  static effectiveTier(profile: Record<string, any>, now: Date = new Date()): TierKey {
    // Stored tier honors grace (down only at recalc); never below window tier.
    const windowTier = TierPolicy.forBowls(LoyaltyService.bowlsWindow(profile, now));
    const stored = (profile.tier as TierKey) ?? "seeker";
    const wi = TIERS.findIndex((t) => t.key === windowTier);
    const si = TIERS.findIndex((t) => t.key === stored);
    return wi > si ? windowTier : stored;
  }

  /**
   * Accrue Sugar Crystals + Bowls for a completed, qualifying order.
   * Returns the earn result incl. any real-time tier-up.
   */
  static accrue(
    profile: Record<string, any>,
    args: { netSpend: number; bowlItems: { itemId: string; qty: number }[]; now?: Date },
  ) {
    LoyaltyService.ensure(profile);
    const now = args.now ?? new Date();

    const tierBefore = LoyaltyService.effectiveTier(profile, now);
    const multiplier = TierPolicy.multiplier(tierBefore);
    const crystalsEarned = EarnRule.crystals(args.netSpend, multiplier);
    const bowlsEarned = args.bowlItems.reduce((s, i) => s + i.qty, 0);

    if (crystalsEarned > 0) {
      profile.crystalBatches.push({
        id: uid("batch"),
        amount: crystalsEarned,
        remaining: crystalsEarned,
        earnedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + BATCH_TTL_MS).toISOString(),
      });
      profile.ledger.push({
        id: uid("led"),
        type: "earned",
        amount: crystalsEarned,
        at: now.toISOString(),
        balanceAfter: LoyaltyService.balance(profile),
        note: "Order reward",
      });
    }
    for (const item of args.bowlItems) {
      if (item.qty > 0) profile.bowlEvents.push({ itemId: item.itemId, qty: item.qty, at: now.toISOString() });
    }

    // Real-time tier-up (never down here).
    const windowTier = TierPolicy.forBowls(LoyaltyService.bowlsWindow(profile, now));
    let tieredUp = false;
    const beforeIdx = TIERS.findIndex((t) => t.key === (profile.tier as TierKey));
    const winIdx = TIERS.findIndex((t) => t.key === windowTier);
    if (winIdx > beforeIdx) {
      profile.tier = windowTier;
      profile.tierHistory.push({ tier: windowTier, at: now.toISOString(), reason: "earn" });
      tieredUp = true;
    }

    return { crystalsEarned, bowlsEarned, tierBefore, tierAfter: profile.tier as TierKey, tieredUp };
  }

  /** Reverse a prior accrual (e.g. order cancelled). FIFO-safe best effort. */
  static reverse(profile: Record<string, any>, crystals: number, bowls: number, now: Date = new Date()) {
    LoyaltyService.ensure(profile);
    // Remove the most recent earned batch matching the amount, else trim balance.
    let toRemove = crystals;
    for (let i = profile.crystalBatches.length - 1; i >= 0 && toRemove > 0; i--) {
      const b = profile.crystalBatches[i] as CrystalBatch;
      const take = Math.min(b.remaining, toRemove);
      b.remaining -= take;
      toRemove -= take;
    }
    if (crystals > 0) {
      profile.ledger.push({
        id: uid("led"),
        type: "redeemed",
        amount: -crystals,
        at: now.toISOString(),
        balanceAfter: LoyaltyService.balance(profile),
        note: "Order cancelled — reversal",
      });
    }
    // Drop matching bowl events (most recent first).
    let bowlsLeft = bowls;
    for (let i = profile.bowlEvents.length - 1; i >= 0 && bowlsLeft > 0; i--) {
      const e = profile.bowlEvents[i] as BowlEvent;
      const take = Math.min(e.qty, bowlsLeft);
      e.qty -= take;
      bowlsLeft -= take;
    }
    profile.bowlEvents = (profile.bowlEvents as BowlEvent[]).filter((e) => e.qty > 0);
  }

  /** Spend crystals FIFO (oldest batch first). Throws if insufficient. */
  static redeem(profile: Record<string, any>, cost: number, note: string, now: Date = new Date()) {
    LoyaltyService.ensure(profile);
    if (LoyaltyService.balance(profile) < cost) {
      throw Object.assign(new Error("Not enough Sugar Crystals"), { statusCode: 400 });
    }
    const batches = [...(profile.crystalBatches as CrystalBatch[])].sort(
      (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
    );
    let toSpend = cost;
    for (const b of batches) {
      if (toSpend <= 0) break;
      const take = Math.min(b.remaining, toSpend);
      b.remaining -= take;
      toSpend -= take;
    }
    profile.ledger.push({
      id: uid("led"),
      type: "redeemed",
      amount: -cost,
      at: now.toISOString(),
      balanceAfter: LoyaltyService.balance(profile),
      note,
    });
  }

  /** Expire batches past their TTL; logs an `expired` ledger entry. */
  static expireSweep(profile: Record<string, any>, now: Date = new Date()): number {
    LoyaltyService.ensure(profile);
    let expired = 0;
    for (const b of profile.crystalBatches as CrystalBatch[]) {
      if (b.remaining > 0 && new Date(b.expiresAt).getTime() <= now.getTime()) {
        expired += b.remaining;
        b.remaining = 0;
      }
    }
    if (expired > 0) {
      profile.ledger.push({
        id: uid("led"),
        type: "expired",
        amount: -expired,
        at: now.toISOString(),
        balanceAfter: LoyaltyService.balance(profile),
        note: "Crystals expired (365-day limit)",
      });
    }
    return expired;
  }

  /** Batches expiring within 7 days and not yet reminded. */
  static expiringSoon(profile: Record<string, any>, now: Date = new Date()): CrystalBatch[] {
    LoyaltyService.ensure(profile);
    const limit = now.getTime() + EXPIRY_REMINDER_MS;
    return (profile.crystalBatches as CrystalBatch[]).filter(
      (b) => b.remaining > 0 && !b.reminded && new Date(b.expiresAt).getTime() <= limit,
    );
  }

  /** Month-end recalc: downgrade at most one tier vs the current window. */
  static monthEndRecalc(profile: Record<string, any>, now: Date = new Date()) {
    LoyaltyService.ensure(profile);
    const windowTier = TierPolicy.forBowls(LoyaltyService.bowlsWindow(profile, now));
    const current = profile.tier as TierKey;
    const next = TierPolicy.stepDown(current, windowTier);
    if (next !== current) {
      profile.tier = next;
      profile.tierHistory.push({ tier: next, at: now.toISOString(), reason: "recalc" });
      return { downgraded: true, from: current, to: next };
    }
    return { downgraded: false, from: current, to: current };
  }
}

export { EarnRule, TierPolicy };
