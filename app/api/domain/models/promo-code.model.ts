import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

// Admin-built voucher / promo codes (Sprint 15). The consumer VoucherEngine
// reads these via OrderService.validateVoucher; usage caps enforced on apply.
@modelOptions({
  schemaOptions: { collection: "tbl_promo_codes", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class PromoCode extends CommonTypegooseEntity {
  @prop({ type: String, required: true, unique: true, uppercase: true })
  code!: string;

  @prop({ type: String, default: "" })
  title!: string;

  @prop({ type: String, default: "" })
  description!: string;

  @prop({ type: String, default: "fixed" })
  discountType!: string; // percent | fixed | bogo

  @prop({ type: Number, default: 0 })
  discountValue!: number;

  @prop({ type: Number, default: 0 })
  minSpend!: number;

  @prop({ type: [String], default: [] })
  eligibleItemIds!: string[];

  @prop({ type: [String], default: [] })
  eligibleCategories!: string[];

  @prop({ type: [String], default: [] })
  fulfillmentModes!: string[]; // empty = any

  @prop({ type: Date, default: null })
  validFrom!: Date | null;

  @prop({ type: Date, default: null })
  validUntil!: Date | null;

  @prop({ type: Number, default: null })
  usageCapGlobal!: number | null;

  @prop({ type: Number, default: null })
  usageCapPerUser!: number | null;

  @prop({ type: Number, default: 0 })
  usedGlobal!: number;

  // Per-user redemption counts { userId: count }.
  @prop({ type: Object, default: {} })
  usedByUser!: Record<string, number>;

  // draft | pending_approval | active | scheduled | expired | rejected
  @prop({ type: String, default: "active" })
  status!: string;

  @prop({ type: Boolean, default: false })
  isGlobal!: boolean; // global / high-value → dual-approval

  @prop({ type: String, default: null })
  batchId!: string | null;

  @prop({ type: String, default: null })
  approvedBy!: string | null;
}

export const PromoCodeModel = getModelForClass(PromoCode);
