import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

// Saved report view + optional schedule (Sprint 17 §14.15).
@modelOptions({
  schemaOptions: { collection: "tbl_saved_reports", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class SavedReport extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: String, required: true })
  reportKey!: string; // ReportDefinition key

  @prop({ type: Object, default: {} })
  filters!: Record<string, any>;

  // Cron-ish schedule string for scheduled delivery (e.g. "0 8 * * *"); null = manual.
  @prop({ type: String, default: null })
  schedule!: string | null;

  @prop({ type: String, default: null })
  deliverTo!: string | null; // email
}

export const SavedReportModel = getModelForClass(SavedReport);
