import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

// Settlement reconciliation: app vs POS vs gateway (Sprint 17 §14.14).
@modelOptions({
  schemaOptions: { collection: "tbl_reconciliations", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class Reconciliation extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  settlementDate!: string; // YYYY-MM-DD

  @prop({ type: String, default: null })
  outletId!: string | null;

  @prop({ type: Number, default: 0 })
  appTotal!: number;

  @prop({ type: Number, default: 0 })
  posTotal!: number;

  @prop({ type: Number, default: 0 })
  gatewayTotal!: number;

  // matched | mismatch | resolved
  @prop({ type: String, default: "matched" })
  status!: string;

  @prop({ type: [String], default: [] })
  mismatchFlags!: string[];

  @prop({ type: String, default: null })
  resolvedBy!: string | null;
}

export const ReconciliationModel = getModelForClass(Reconciliation);
