import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

// Maker-checker record for privileged member adjustments (Sprint 16 §14.19).
// Below threshold: applied immediately (status=applied). Above threshold:
// status=pending until a second admin approves.
@modelOptions({
  schemaOptions: { collection: "tbl_member_adjustments", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class MemberAdjustment extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  memberId!: string;

  // crystals_grant | crystals_deduct | bowls_adjust | tier_set | goodwill_voucher | suspend | merge
  @prop({ type: String, required: true })
  type!: string;

  @prop({ type: Object, default: {} })
  payload!: Record<string, any>;

  @prop({ type: String, required: true })
  reason!: string;

  @prop({ type: String, required: true })
  makerId!: string;

  @prop({ type: String, default: null })
  checkerId!: string | null;

  // applied | pending | approved | rejected
  @prop({ type: String, default: "applied" })
  status!: string;
}

export const MemberAdjustmentModel = getModelForClass(MemberAdjustment);
