import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

@modelOptions({
  schemaOptions: { collection: "tbl_content_pages", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class ContentPage extends CommonTypegooseEntity {
  @prop({ type: String, required: true, unique: true })
  key!: string;

  @prop({ type: String, required: true })
  title!: string;

  @prop({ type: String, default: "" })
  body!: string;

  @prop({ type: Object, default: {} })
  localized!: Record<string, { title: string; body: string }>;

  @prop({ type: String, default: "published" })
  status!: string;
}

@modelOptions({
  schemaOptions: { collection: "tbl_notification_templates", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class NotificationTemplate extends CommonTypegooseEntity {
  @prop({ type: String, required: true, unique: true })
  key!: string;

  @prop({ type: String, required: true })
  category!: string;

  @prop({ type: String, required: true })
  title!: string;

  @prop({ type: String, required: true })
  body!: string;

  @prop({ type: Object, default: {} })
  localized!: Record<string, { title: string; body: string }>;

  @prop({ type: Boolean, default: true })
  transactional!: boolean;
}

@modelOptions({
  schemaOptions: { collection: "tbl_admin_campaigns", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class AdminCampaign extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: String, default: "draft" })
  status!: string;

  @prop({ type: String, default: "marketing" })
  category!: string;

  @prop({ type: String, required: true })
  title!: string;

  @prop({ type: String, required: true })
  body!: string;

  @prop({ type: Object, default: {} })
  segment!: Record<string, any>;

  @prop({ type: Object, default: null })
  abTest!: any;

  @prop({ type: Number, default: 1000 })
  throttlePerHour!: number;

  @prop({ type: Date, default: null })
  scheduledAt!: Date | null;

  @prop({ type: Object, default: { sent: 0, delivered: 0, opened: 0, converted: 0, skippedConsent: 0 } })
  analytics!: Record<string, number>;
}

@modelOptions({
  schemaOptions: { collection: "tbl_compliance_requests", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class ComplianceRequest extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  userId!: string;

  @prop({ type: String, required: true })
  type!: "deletion" | "export";

  @prop({ type: String, default: "pending" })
  status!: string;

  @prop({ type: String, default: null })
  reason!: string | null;

  @prop({ type: Object, default: null })
  result!: any;

  @prop({ type: String, default: null })
  processedBy!: string | null;
}

@modelOptions({
  schemaOptions: { collection: "tbl_platform_settings", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class PlatformSettings extends CommonTypegooseEntity {
  @prop({ type: String, default: "default", unique: true })
  key!: string;

  @prop({ type: Object, default: {} })
  featureFlags!: Record<string, any>;

  @prop({ type: Object, default: {} })
  marketConfig!: Record<string, any>;

  @prop({ type: Object, default: {} })
  otpPolicy!: Record<string, any>;

  @prop({ type: Object, default: [] })
  versions!: any[];
}

@modelOptions({
  schemaOptions: { collection: "tbl_incident_banners", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class IncidentBanner extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  message!: string;

  @prop({ type: String, default: "info" })
  severity!: string;

  @prop({ type: Date, default: null })
  startAt!: Date | null;

  @prop({ type: Date, default: null })
  endAt!: Date | null;

  @prop({ type: Boolean, default: true })
  enabled!: boolean;
}

export const ContentPageModel = getModelForClass(ContentPage);
export const NotificationTemplateModel = getModelForClass(NotificationTemplate);
export const AdminCampaignModel = getModelForClass(AdminCampaign);
export const ComplianceRequestModel = getModelForClass(ComplianceRequest);
export const PlatformSettingsModel = getModelForClass(PlatformSettings);
export const IncidentBannerModel = getModelForClass(IncidentBanner);
