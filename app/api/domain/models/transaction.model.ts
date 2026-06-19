import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

// Payment record for an order. Never stores card PAN (PCI-DSS scope via gateway).
@modelOptions({
  schemaOptions: { collection: "tbl_transactions", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class Transaction extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  userId!: string;

  @prop({ type: String, required: true, index: true })
  orderId!: string;

  @prop({ type: String, required: true })
  method!: string; // QRIS, GoPay, OVO, DANA, ShopeePay, Card

  @prop({ type: Number, required: true })
  amount!: number;

  // authorized | paid | failed | refunded
  @prop({ type: String, default: "paid" })
  status!: string;

  // Opaque reference returned by the payment gateway (no PAN).
  @prop({ type: String, default: null })
  gatewayRef!: string | null;

  // Idempotency key passed by the client to dedupe retries.
  @prop({ type: String, required: false, default: null, index: true, sparse: true })
  idempotencyKey?: string | null;
}

export const TransactionModel = getModelForClass(Transaction);
