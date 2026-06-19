import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

// Saved member segment (Sprint 16). Criteria → materialized member id set,
// reused by campaigns (Sprint 18) and vouchers (Sprint 15).
@modelOptions({
  schemaOptions: { collection: "tbl_segments", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class Segment extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  name!: string;

  // { tier?, minBowls?, activeWithinDays?, consentCategory?, country? }
  @prop({ type: Object, default: {} })
  criteria!: Record<string, any>;

  @prop({ type: [String], default: [] })
  memberIds!: string[];

  @prop({ type: Number, default: 0 })
  size!: number;
}

export const SegmentModel = getModelForClass(Segment);
