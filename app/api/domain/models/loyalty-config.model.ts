import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

// Singleton loyalty engine config (Sprint 14). LoyaltyService / EarnRule /
// TierPolicy READ this (DIP) — changing a multiplier or threshold needs no code.
// Versioned + reversible (§14.18): each save snapshots prior values.
@modelOptions({
  schemaOptions: { collection: "tbl_loyalty_config", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class LoyaltyConfig extends CommonTypegooseEntity {
  @prop({ type: String, default: "default", unique: true })
  key!: string;

  @prop({ type: Number, default: 1000 })
  earnRatePerRp!: number; // 1 crystal per this many IDR of net spend

  @prop({ type: String, default: "floor" })
  rounding!: string; // floor | round

  // Tier multipliers keyed by tier key.
  @prop({ type: Object, default: { seeker: 1.0, explorer: 1.25, pioneer: 1.5, master: 2.0 } })
  multipliers!: Record<string, number>;

  // Tier min-bowls thresholds keyed by tier key.
  @prop({ type: Object, default: { seeker: 0, explorer: 10, pioneer: 40, master: 80 } })
  tierThresholds!: Record<string, number>;

  @prop({ type: Number, default: 365 })
  expiryDays!: number;

  @prop({ type: Number, default: 7 })
  reminderDays!: number;

  @prop({ type: Number, default: 365 })
  bowlsWindowDays!: number;

  @prop({ type: Number, default: 1 })
  downgradeMaxSteps!: number;

  // Exclusions: orders on these channels earn nothing; these SKUs never qualify.
  @prop({ type: [String], default: ["third-party"] })
  excludedChannels!: string[];

  @prop({ type: [String], default: [] })
  excludedSkus!: string[];

  // Snapshot history for revert (§14.18).
  @prop({ type: Object, default: [] })
  versions!: any[];
}

export const LoyaltyConfigModel = getModelForClass(LoyaltyConfig);
