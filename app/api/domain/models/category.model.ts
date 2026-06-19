import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

// Menu categories drive the consumer Menu pill bar / scroll-spy order (Sprint 4).
// Admin reorders them (Sprint 13 §14.5).
@modelOptions({
  schemaOptions: { collection: "tbl_categories", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class Category extends CommonTypegooseEntity {
  @prop({ type: String, required: true, unique: true })
  key!: string;

  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: Number, default: 0 })
  sortOrder!: number;
}

export const CategoryModel = getModelForClass(Category);
