import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

// Append-only log of reward redemptions. Stock and per-user limits are derived
// by counting these (Sprint 8). Unique idempotencyKey makes redeem retry-safe.
@modelOptions({
  schemaOptions: { collection: "tbl_reward_redemptions", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class RewardRedemption extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  userId!: string;

  @prop({ type: String, required: true, index: true })
  rewardId!: string;

  @prop({ type: Number, required: true })
  crystalCost!: number;

  @prop({ type: String, default: null })
  voucherId!: string | null;

  @prop({ type: String, required: false, default: null, index: true, sparse: true })
  idempotencyKey?: string | null;
}

export const RewardRedemptionModel = getModelForClass(RewardRedemption);
