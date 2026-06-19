import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

// Singleton marketing config (Sprint 15): welcome-offer set (feeds Sprint 2
// registration) + referral campaign policy (feeds Sprint 9, DIP).
@modelOptions({
  schemaOptions: { collection: "tbl_marketing_config", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class MarketingConfig extends CommonTypegooseEntity {
  @prop({ type: String, default: "default", unique: true })
  key!: string;

  // Voucher templates deposited at registration (App users; non-extendable).
  // [{ title, description, discountType, discountValue, minSpend, validDays, source }]
  @prop({ type: Object, default: null })
  welcomeOffer!: any[] | null;

  // Referral reward policy + anti-abuse caps.
  @prop({ type: Object, default: null })
  referral!: {
    refereeReward: any;
    referrerReward: any;
    perUserRewardCap: number;
    dailyVelocityCap: number;
    selfReferralBlock: boolean;
  } | null;

  @prop({ type: Object, default: [] })
  versions!: any[];
}

export const MarketingConfigModel = getModelForClass(MarketingConfig);
