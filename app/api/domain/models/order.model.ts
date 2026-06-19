import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

@modelOptions({
  schemaOptions: { collection: "tbl_orders", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class Order extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  userId!: string;

  @prop({ type: String, required: true, unique: true })
  pickupCode!: string;

  @prop({ type: String, required: true })
  outletId!: string;

  @prop({ type: String, required: true })
  outletName!: string;

  @prop({ type: String, default: "received" })
  status!: string;

  @prop({ type: Object, default: [] })
  lines!: any[];

  @prop({ type: Number, default: 0 })
  subtotal!: number;

  @prop({ type: Number, default: 0 })
  discount!: number;

  @prop({ type: Number, default: 0 })
  tax!: number;

  @prop({ type: Number, default: 0 })
  total!: number;

  @prop({ type: Number, default: 0 })
  netSpend!: number;

  @prop({ type: Number, default: 0 })
  crystalsEarned!: number;

  @prop({ type: Number, default: 0 })
  bowlsEarned!: number;

  // Loyalty is credited on completion (Sprint 7), not at checkout.
  @prop({ type: Boolean, default: false })
  loyaltyAccrued!: boolean;

  // Order channel — "third-party" earns no Crystals/Bowls (PRD §10 exclusions).
  @prop({ type: String, default: "app" })
  channel!: string;

  @prop({ type: String, default: null })
  cancellationReason!: string | null;

  // Set when the order proceeded during a peak-hour warning — excluded from
  // auto wait-time cancellation (PRD §18.5).
  @prop({ type: Boolean, default: false })
  peakHourProceeded!: boolean;

  @prop({ type: String, default: null })
  voucherCode!: string | null;

  @prop({ type: String, default: "QRIS" })
  paymentMethod!: string;

  @prop({ type: Number, default: 15 })
  etaMinutes!: number;

  // Payment lifecycle: authorized | paid | failed | refunded
  @prop({ type: String, default: "paid" })
  paymentStatus!: string;

  @prop({ type: String, default: null })
  transactionId!: string | null;

  // Idempotency: same key + user returns the existing order (no double charge).
  @prop({ type: String, required: false, default: null, index: true, sparse: true })
  idempotencyKey?: string | null;

  @prop({ type: Object, default: [] })
  statusHistory!: any[];
}

export const OrderModel = getModelForClass(Order);
