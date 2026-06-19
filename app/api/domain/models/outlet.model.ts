import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

@modelOptions({
  schemaOptions: { collection: "tbl_outlets", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class Outlet extends CommonTypegooseEntity {
  @prop({ type: String, required: true, unique: true })
  slug!: string;

  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: String, required: true })
  mall!: string;

  @prop({ type: String, required: true })
  city!: string;

  @prop({ type: String, required: true })
  address!: string;

  @prop({ type: Number, default: 0 })
  distanceKm!: number;

  @prop({ type: String, default: "10:00" })
  openTime!: string;

  @prop({ type: String, default: "22:00" })
  closeTime!: string;

  @prop({ type: String, default: "21:30" })
  lastOrderTime!: string;

  @prop({ type: Number, default: 15 })
  prepMinutes!: number;

  @prop({ type: Boolean, default: true })
  isOpen!: boolean;

  @prop({ type: Boolean, default: true })
  pickupEnabled!: boolean;

  @prop({ type: Number, default: 0 })
  lat!: number;

  @prop({ type: Number, default: 0 })
  lng!: number;

  @prop({ type: [String], default: [] })
  soldOutItemIds!: string[];
}

export const OutletModel = getModelForClass(Outlet);
