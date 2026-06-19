import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

// One record per attributed referral (Sprint 9).
@modelOptions({
  schemaOptions: { collection: "tbl_referrals", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class Referral extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  referrerId!: string;

  @prop({ type: String, required: true, unique: true })
  refereeId!: string; // a user can be referred at most once

  @prop({ type: String, required: true })
  code!: string;

  // pending → qualified → rewarded
  @prop({ type: String, default: "pending" })
  status!: string;

  @prop({ type: String, default: "default" })
  campaign!: string;

  @prop({ type: Date, default: null })
  rewardedAt!: Date | null;
}

export const ReferralModel = getModelForClass(Referral);
