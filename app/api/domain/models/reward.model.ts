import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

// Admin-managed Rewards Store catalog (Sprint 14). Consumer RewardsService reads
// these; admin RewardAdminService writes them (DIP). `slug` is the stable id the
// consumer + redemption records reference.
@modelOptions({
  schemaOptions: { collection: "tbl_rewards", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class Reward extends CommonTypegooseEntity {
  @prop({ type: String, required: true, unique: true })
  slug!: string;

  @prop({ type: String, required: true })
  title!: string;

  @prop({ type: String, default: "" })
  description!: string;

  @prop({ type: Number, required: true })
  crystalCost!: number;

  @prop({ type: String, default: "voucher" })
  type!: string; // voucher | merch | experience

  @prop({ type: String, default: "" })
  imageUrl!: string;

  @prop({ type: Number, default: null })
  stockCap!: number | null;

  @prop({ type: Number, default: null })
  perUserLimit!: number | null;

  @prop({ type: String, default: null })
  tierGate!: string | null; // tier key

  @prop({ type: Object, default: null })
  voucherTemplate!: any;

  @prop({ type: Boolean, default: true })
  enabled!: boolean;

  @prop({ type: String, default: null })
  disabledReason!: string | null;

  @prop({ type: Number, default: 0 })
  sortOrder!: number;
}

export const RewardModel = getModelForClass(Reward);
