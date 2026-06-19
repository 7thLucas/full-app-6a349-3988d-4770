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

  @prop({ type: String, default: null })
  voucherCode!: string | null;

  @prop({ type: String, default: "QRIS" })
  paymentMethod!: string;

  @prop({ type: Number, default: 15 })
  etaMinutes!: number;

  @prop({ type: Object, default: [] })
  statusHistory!: any[];
}

export const OrderModel = getModelForClass(Order);
