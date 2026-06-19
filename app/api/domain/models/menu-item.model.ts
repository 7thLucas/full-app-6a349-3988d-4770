import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

@modelOptions({
  schemaOptions: { collection: "tbl_menu_items", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class MenuItem extends CommonTypegooseEntity {
  @prop({ type: String, required: true, unique: true })
  slug!: string;

  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: String, default: "" })
  description!: string;

  @prop({ type: String, required: true })
  category!: string;

  @prop({ type: Number, required: true })
  basePrice!: number;

  @prop({ type: String, default: "" })
  imageUrl!: string;

  @prop({ type: [String], default: [] })
  tags!: string[];

  @prop({ type: Boolean, default: false })
  isSignature!: boolean;

  @prop({ type: Boolean, default: true })
  available!: boolean;

  // Array of option groups (single/multi choice). Stored as mixed.
  @prop({ type: Object, default: [] })
  optionGroups!: any[];

  @prop({ type: Number, default: 0 })
  sortOrder!: number;

  // Draft/publish (Sprint 13): draft edits do not appear in the consumer menu.
  @prop({ type: Boolean, default: true })
  published!: boolean;

  // Effective-dated per-outlet/country price overrides (Sprint 13 §14.5).
  // [{ outletId?, country?, price, effectiveFrom (ISO) }]
  @prop({ type: Object, default: [] })
  priceOverrides!: any[];

  // Calorie / allergen metadata (Sprint 1/13).
  @prop({ type: Number, default: null })
  calories!: number | null;

  @prop({ type: [String], default: [] })
  allergens!: string[];
}

export const MenuItemModel = getModelForClass(MenuItem);
