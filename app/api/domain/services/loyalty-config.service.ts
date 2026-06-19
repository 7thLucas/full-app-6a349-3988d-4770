import { LoyaltyConfigModel } from "../models/loyalty-config.model";
import { createLogger } from "~/lib/logger";

const logger = createLogger("LoyaltyConfig");

export interface LoyaltyConfigSnapshot {
  earnRatePerRp: number;
  rounding: string;
  multipliers: Record<string, number>;
  tierThresholds: Record<string, number>;
  expiryDays: number;
  reminderDays: number;
  bowlsWindowDays: number;
  downgradeMaxSteps: number;
  excludedChannels: string[];
  excludedSkus: string[];
}

const DEFAULTS: LoyaltyConfigSnapshot = {
  earnRatePerRp: 1000,
  rounding: "floor",
  multipliers: { seeker: 1.0, explorer: 1.25, pioneer: 1.5, master: 2.0 },
  tierThresholds: { seeker: 0, explorer: 10, pioneer: 40, master: 80 },
  expiryDays: 365,
  reminderDays: 7,
  bowlsWindowDays: 365,
  downgradeMaxSteps: 1,
  excludedChannels: ["third-party"],
  excludedSkus: [],
};

// In-memory cache so LoyaltyService (pure, synchronous) can read config without
// an await. Loaded at boot + refreshed on every admin write.
let cache: LoyaltyConfigSnapshot = { ...DEFAULTS };

function pick(doc: any): LoyaltyConfigSnapshot {
  return {
    earnRatePerRp: doc.earnRatePerRp,
    rounding: doc.rounding,
    multipliers: doc.multipliers,
    tierThresholds: doc.tierThresholds,
    expiryDays: doc.expiryDays,
    reminderDays: doc.reminderDays,
    bowlsWindowDays: doc.bowlsWindowDays,
    downgradeMaxSteps: doc.downgradeMaxSteps,
    excludedChannels: doc.excludedChannels,
    excludedSkus: doc.excludedSkus,
  };
}

/** Synchronous read used by LoyaltyService/EarnRule/TierPolicy. */
export function loyaltyConfig(): LoyaltyConfigSnapshot {
  return cache;
}

export class LoyaltyConfigService {
  /** Ensure the singleton exists + warm the cache (call at boot). */
  static async init() {
    let doc = await LoyaltyConfigModel.findOne({ key: "default" });
    if (!doc) doc = await LoyaltyConfigModel.create({ key: "default" });
    cache = pick(doc);
    logger.info("Loyalty config loaded");
    return cache;
  }

  static async get() {
    const doc = await LoyaltyConfigModel.findOne({ key: "default" });
    return doc ? pick(doc) : { ...DEFAULTS };
  }

  /** Update config; snapshots prior values for revert; refreshes cache. */
  static async update(patch: Partial<LoyaltyConfigSnapshot>, actorId: string) {
    const doc = (await LoyaltyConfigModel.findOne({ key: "default" })) ?? (await LoyaltyConfigModel.create({ key: "default" }));
    const before = pick(doc);
    doc.versions = [...(doc.versions ?? []), { at: new Date().toISOString(), by: actorId, snapshot: before }].slice(-50);
    for (const k of Object.keys(patch) as (keyof LoyaltyConfigSnapshot)[]) {
      if (patch[k] !== undefined) (doc as any)[k] = patch[k];
    }
    await doc.save();
    cache = pick(doc);
    return { before, after: cache };
  }

  static async versions() {
    const doc = await LoyaltyConfigModel.findOne({ key: "default" });
    return doc?.versions ?? [];
  }

  /** Revert to a prior version index; current state is itself snapshotted first. */
  static async revert(versionIndex: number, actorId: string) {
    const doc = await LoyaltyConfigModel.findOne({ key: "default" });
    if (!doc) throw Object.assign(new Error("Config not found"), { statusCode: 404 });
    const versions = doc.versions ?? [];
    const target = versions[versionIndex];
    if (!target?.snapshot) throw Object.assign(new Error("Version not found"), { statusCode: 404 });
    const before = pick(doc);
    doc.versions = [...versions, { at: new Date().toISOString(), by: actorId, snapshot: before, note: "pre-revert" }].slice(-50);
    Object.assign(doc, target.snapshot);
    await doc.save();
    cache = pick(doc);
    return { before, after: cache };
  }
}
