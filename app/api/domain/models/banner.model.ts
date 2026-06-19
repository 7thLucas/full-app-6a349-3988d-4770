import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

// CMS home banners (Sprint 11). Scheduled (start/end), priority-ordered,
// country/outlet scoped, with a deep link the app resolves on tap.
@modelOptions({
  schemaOptions: { collection: "tbl_banners", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class Banner extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  title!: string;

  @prop({ type: String, default: "" })
  imageUrl!: string;

  @prop({ type: String, default: "" })
  caption!: string; // safe-area overlay text

  // Deep link, e.g. "/app/rewards", "/app/menu/<id>", "https://…"
  @prop({ type: String, default: "" })
  deepLink!: string;

  @prop({ type: Number, default: 0 })
  priority!: number; // higher shows first

  @prop({ type: Date, default: null })
  startAt!: Date | null;

  @prop({ type: Date, default: null })
  endAt!: Date | null;

  @prop({ type: String, default: null })
  country!: string | null; // null = all countries

  @prop({ type: Boolean, default: true })
  enabled!: boolean;
}

export const BannerModel = getModelForClass(Banner);
