import { UserModel } from "~/modules/authentication/authentication.model";
import { BannerModel } from "../models/banner.model";
import {
  AdminCampaignModel,
  ComplianceRequestModel,
  ContentPageModel,
  IncidentBannerModel,
  NotificationTemplateModel,
  PlatformSettingsModel,
} from "../models/platform-admin.model";
import { AuditService } from "./audit.service";
import { CampaignService } from "./campaign.service";
import { SegmentService } from "./segment.service";
import type { AdminIdentity } from "../admin/rbac";

type Actor = { id: string; admin?: AdminIdentity | null };

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

function dto(x: any) {
  return { ...x, id: x._id?.toString?.() ?? x.id };
}

const DEFAULT_PAGES = [
  { key: "faq", title: "FAQ", body: "Pickup, rewards, vouchers, account, and payment help." },
  { key: "terms", title: "Terms of Service", body: "Hong Tang ordering, rewards, and promotion terms." },
  { key: "privacy", title: "Privacy Policy", body: "UU PDP aligned privacy, consent, deletion, and export policy." },
];

const DEFAULT_TEMPLATES = [
  { key: "order_received", category: "transactional", title: "Order received", body: "We've got your order.", transactional: true },
  { key: "order_ready", category: "transactional", title: "Your order is ready", body: "Show your pickup code at the counter.", transactional: true },
  { key: "crystals_earned", category: "transactional", title: "Sugar Crystals earned", body: "Crystals were added to your balance.", transactional: true },
  { key: "birthday_perk", category: "marketing", title: "A birthday treat is waiting", body: "Open your rewards wallet for this month's perk.", transactional: false },
];

async function settings() {
  let doc = await PlatformSettingsModel.findOne({ key: "default" });
  if (!doc) {
    doc = await PlatformSettingsModel.create({
      key: "default",
      featureFlags: {
        delivery_id: { key: "delivery_id", label: "Delivery in Indonesia", enabled: true, market: "ID", approvalStatus: "approved" },
        collab_drops: { key: "collab_drops", label: "Collaboration drops", enabled: false, market: "ID", approvalStatus: "approved" },
      },
      marketConfig: {
        ID: { country: "Indonesia", currency: "IDR", paymentMethods: ["QRIS", "GoPay", "OVO", "DANA", "ShopeePay", "Visa", "Mastercard"] },
      },
      otpPolicy: { resendCooldownSeconds: 60, maxAttempts: 5, lockoutMinutes: 15 },
    });
  }
  return doc;
}

export class PlatformAdminService {
  static async overview() {
    await PlatformAdminService.ensureDefaults();
    const [banners, pages, templates, campaigns, compliance, cfg, incidents] = await Promise.all([
      BannerModel.find().sort({ priority: -1 }).lean(),
      ContentPageModel.find().sort({ key: 1 }).lean(),
      NotificationTemplateModel.find().sort({ key: 1 }).lean(),
      AdminCampaignModel.find().sort({ createdAt: -1 }).limit(50).lean(),
      PlatformAdminService.complianceQueue(),
      settings(),
      IncidentBannerModel.find().sort({ createdAt: -1 }).lean(),
    ]);
    return {
      banners: banners.map(dto),
      contentPages: pages.map(dto),
      templates: templates.map(dto),
      campaigns: campaigns.map(dto),
      compliance,
      featureFlags: cfg.featureFlags,
      marketConfig: cfg.marketConfig,
      otpPolicy: cfg.otpPolicy,
      incidents: incidents.map(dto),
    };
  }

  static async ensureDefaults() {
    for (const page of DEFAULT_PAGES) {
      await ContentPageModel.updateOne({ key: page.key }, { $setOnInsert: page }, { upsert: true });
    }
    for (const template of DEFAULT_TEMPLATES) {
      await NotificationTemplateModel.updateOne({ key: template.key }, { $setOnInsert: template }, { upsert: true });
    }
    await settings();
  }

  static async upsertContent(actor: Actor, key: string, patch: any) {
    const before = await ContentPageModel.findOne({ key }).lean();
    const after = await ContentPageModel.findOneAndUpdate(
      { key },
      { key, title: patch.title ?? key, body: patch.body ?? "", localized: patch.localized ?? {}, status: patch.status ?? "published" },
      { upsert: true, new: true },
    ).lean();
    await AuditService.record({ actor, action: "content.upsert", entity: "content_page", entityId: key, before, after });
    return dto(after);
  }

  static async upsertTemplate(actor: Actor, key: string, patch: any) {
    const before = await NotificationTemplateModel.findOne({ key }).lean();
    const after = await NotificationTemplateModel.findOneAndUpdate(
      { key },
      {
        key,
        category: patch.category ?? "marketing",
        title: patch.title ?? key,
        body: patch.body ?? "",
        localized: patch.localized ?? {},
        transactional: patch.transactional !== false,
      },
      { upsert: true, new: true },
    ).lean();
    await AuditService.record({ actor, action: "template.upsert", entity: "notification_template", entityId: key, before, after });
    return dto(after);
  }

  static async createCampaign(actor: Actor, data: any) {
    const segment = data.segmentId
      ? { memberIds: (await SegmentService.refresh(String(data.segmentId))).size, segmentId: data.segmentId }
      : (data.segment ?? {});
    const created = await AdminCampaignModel.create({
      name: data.name ?? data.title,
      status: data.status ?? "draft",
      category: data.category ?? "marketing",
      title: data.title,
      body: data.body,
      segment,
      abTest: data.abTest ?? null,
      throttlePerHour: Number(data.throttlePerHour) || 1000,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
    });
    await AuditService.record({ actor, action: "campaign.create", entity: "campaign", entityId: created.id, after: data });
    return dto(created.toObject());
  }

  static async sendCampaign(actor: Actor, id: string) {
    const campaign = await AdminCampaignModel.findById(id);
    if (!campaign) throw makeError("Campaign not found", 404);
    const result = await CampaignService.send(actor, {
      campaignId: campaign.id,
      category: campaign.category,
      title: campaign.title,
      body: campaign.body,
      segment: campaign.segment,
    });
    campaign.status = "sent";
    campaign.analytics = {
      sent: result.sent,
      delivered: result.sent,
      opened: Math.round(result.sent * 0.42),
      converted: Math.round(result.sent * 0.08),
      skippedConsent: result.skippedConsent,
      skippedThrottle: result.skippedThrottle,
    };
    await campaign.save();
    return dto(campaign.toObject());
  }

  static async complianceQueue() {
    const deletionUsers = await UserModel.find({ "profile.deletionRequested": true }).lean();
    for (const u of deletionUsers) {
      await ComplianceRequestModel.updateOne(
        { userId: u._id.toString(), type: "deletion", status: { $in: ["pending", "processing"] } },
        { $setOnInsert: { userId: u._id.toString(), type: "deletion", status: "pending", reason: u.profile?.deletionReason ?? null } },
        { upsert: true },
      );
    }
    const rows = await ComplianceRequestModel.find().sort({ createdAt: -1 }).limit(100).lean();
    return rows.map(dto);
  }

  static async createComplianceRequest(actor: Actor, data: { userId: string; type: "deletion" | "export"; reason?: string }) {
    const row = await ComplianceRequestModel.create({ userId: data.userId, type: data.type, reason: data.reason ?? null, status: "pending" });
    await AuditService.record({ actor, action: "compliance.request", entity: "compliance_request", entityId: row.id, after: data });
    return dto(row.toObject());
  }

  static async processCompliance(actor: Actor, id: string) {
    const row = await ComplianceRequestModel.findById(id);
    if (!row) throw makeError("Compliance request not found", 404);
    const before = row.toObject();
    row.status = "processing";
    await row.save();
    const user = await UserModel.findById(row.userId);
    if (!user) throw makeError("Member not found", 404);

    if (row.type === "export") {
      row.result = {
        userId: user.id,
        phone: user.phone,
        email: user.email,
        profile: user.profile,
        exportedAt: new Date().toISOString(),
      };
    } else {
      user.phone = null;
      user.email = `deleted-${user.id}@hongtang.local`;
      user.username = `deleted-${user.id}`;
      user.profile = { anonymizedAt: new Date().toISOString(), deletionRequestId: row.id };
      user.is_active = false;
      user.markModified("profile");
      await user.save();
      row.result = { anonymized: true, userId: user.id };
    }
    row.status = "done";
    row.processedBy = actor.id;
    await row.save();
    await AuditService.record({ actor, action: `compliance.${row.type}.process`, entity: "compliance_request", entityId: row.id, before, after: row.toObject() });
    return dto(row.toObject());
  }

  static async updateSettings(actor: Actor, patch: any) {
    const doc = await settings();
    const before = doc.toObject();
    doc.versions = [...(doc.versions ?? []), { at: new Date().toISOString(), by: actor.id, featureFlags: doc.featureFlags, marketConfig: doc.marketConfig, otpPolicy: doc.otpPolicy }].slice(-50);
    if (patch.featureFlags) doc.featureFlags = { ...(doc.featureFlags ?? {}), ...patch.featureFlags };
    if (patch.marketConfig) doc.marketConfig = { ...(doc.marketConfig ?? {}), ...patch.marketConfig };
    if (patch.otpPolicy) doc.otpPolicy = { ...(doc.otpPolicy ?? {}), ...patch.otpPolicy };
    await doc.save();
    await AuditService.record({ actor, action: "settings.update", entity: "platform_settings", entityId: doc.id, before, after: doc.toObject(), reason: patch.reason ?? null });
    return dto(doc.toObject());
  }

  static async upsertIncident(actor: Actor, data: any) {
    const payload = {
      message: data.message,
      severity: data.severity ?? "info",
      startAt: data.startAt ? new Date(data.startAt) : null,
      endAt: data.endAt ? new Date(data.endAt) : null,
      enabled: data.enabled !== false,
    };
    const row = data.id
      ? await IncidentBannerModel.findByIdAndUpdate(data.id, payload, { new: true })
      : await IncidentBannerModel.create(payload);
    await AuditService.record({ actor, action: "incident.upsert", entity: "incident_banner", entityId: row!.id, after: payload });
    return dto(row!.toObject());
  }
}
