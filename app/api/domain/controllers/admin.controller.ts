import type { Request, Response } from "express";
import { UserModel } from "~/modules/authentication/authentication.model";
import { DashboardService } from "../services/dashboard.service";
import { AdminOrderService } from "../services/admin-order.service";
import { AuditService } from "../services/audit.service";
import { CatalogAdminService } from "../services/catalog-admin.service";
import { OutletAdminService } from "../services/outlet-admin.service";
import { LoyaltyConfigService } from "../services/loyalty-config.service";
import { RewardAdminService } from "../services/reward-admin.service";
import { VoucherAdminService } from "../services/voucher-admin.service";
import { MarketingConfigService } from "../services/marketing-config.service";
import { MerchandisingService } from "../services/merchandising.service";
import { CampaignService } from "../services/campaign.service";
import { FinanceService, ReportingService } from "../services/finance.service";
import { PlatformAdminService } from "../services/platform-admin.service";

function ok(res: Response, data: any) {
  res.json({ success: true, data });
}
function fail(res: Response, error: any, fallback = "Request failed") {
  res.status(error?.statusCode ?? 500).json({ success: false, message: error?.message ?? fallback });
}
const actor = (req: Request) => ({ id: req.user!.id, admin: req.admin });
const filters = (req: Request) => ({
  from: req.query.from ? String(req.query.from) : undefined,
  to: req.query.to ? String(req.query.to) : undefined,
  outletId: req.query.outletId ? String(req.query.outletId) : undefined,
  channel: req.query.channel ? String(req.query.channel) : undefined,
});
const wrap = (fn: (req: Request, res: Response) => Promise<any>) => async (req: Request, res: Response) => {
  try { await fn(req, res); } catch (e) { fail(res, e); }
};

// ── Dashboard (Sprint 12) ─────────────────────────────────────────────────────
export const getDashboard = wrap(async (req, res) => ok(res, await DashboardService.overview(req.admin!, filters(req))));
export const exportDashboardCsv = wrap(async (req, res) => {
  const csv = await DashboardService.exportCsv(req.admin!, filters(req));
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=orders.csv");
  res.send(csv);
});

// ── Order management (Sprint 12) ───────────────────────────────────────────────
export const adminBoard = wrap(async (req, res) =>
  ok(res, await AdminOrderService.board(req.admin!, req.query.outletId ? String(req.query.outletId) : undefined)));
export const adminSearchOrders = wrap(async (req, res) =>
  ok(res, await AdminOrderService.search(req.admin!, {
    query: req.query.q ? String(req.query.q) : undefined,
    status: req.query.status ? String(req.query.status) : undefined,
    channel: req.query.channel ? String(req.query.channel) : undefined,
    outletId: req.query.outletId ? String(req.query.outletId) : undefined,
  })));
export const adminOverrideOrder = wrap(async (req, res) =>
  ok(res, await AdminOrderService.overrideState(req.admin!, req.user!.id, String(req.params.id), req.body?.status, req.body?.reason)));
export const adminCancelRefund = wrap(async (req, res) =>
  ok(res, await AdminOrderService.cancelRefund(req.admin!, req.user!.id, String(req.params.id), req.body?.reason)));

// ── Audit + RBAC (Sprint 12) ────────────────────────────────────────────────────
export const listAudit = wrap(async (req, res) =>
  ok(res, await AuditService.list({
    entity: req.query.entity ? String(req.query.entity) : undefined,
    entityId: req.query.entityId ? String(req.query.entityId) : undefined,
    action: req.query.action ? String(req.query.action) : undefined,
  })));
export const exportAuditCsv = wrap(async (req, res) => {
  const logs = await AuditService.list({
    entity: req.query.entity ? String(req.query.entity) : undefined,
    entityId: req.query.entityId ? String(req.query.entityId) : undefined,
    action: req.query.action ? String(req.query.action) : undefined,
    limit: 5000,
  });
  const header = "id,at,actorId,actorRole,action,entity,entityId,reason";
  const rows = logs.map((l) => [l.id, l.at, l.actorId, l.actorRole, l.action, l.entity, l.entityId ?? "", l.reason ?? ""].map((v) => JSON.stringify(String(v ?? ""))).join(","));
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=audit-log.csv");
  res.send([header, ...rows].join("\n"));
});
export const assignRole = wrap(async (req, res) => {
  const user = await UserModel.findById(String(req.params.id));
  if (!user) return fail(res, { statusCode: 404, message: "User not found" });
  const p = (user.profile ?? {}) as Record<string, any>;
  p.adminRole = req.body?.adminRole ?? null;
  p.outletScope = req.body?.outletScope ?? [];
  user.profile = p;
  if (req.body?.adminRole) user.role = "admin" as any;
  user.markModified("profile");
  await user.save();
  await AuditService.record({ actor: actor(req), action: "rbac.assign", entity: "user", entityId: user.id, after: { adminRole: p.adminRole, outletScope: p.outletScope } });
  ok(res, { adminRole: p.adminRole, outletScope: p.outletScope });
});

// ── Catalog admin (Sprint 13) ─────────────────────────────────────────────────
export const adminListItems = wrap(async (_req, res) => ok(res, await CatalogAdminService.listItems()));
export const adminCreateItem = wrap(async (req, res) => ok(res, await CatalogAdminService.createItem(req.body, actor(req))));
export const adminUpdateItem = wrap(async (req, res) => ok(res, await CatalogAdminService.updateItem(String(req.params.id), req.body, actor(req))));
export const adminPublishItem = wrap(async (req, res) => ok(res, await CatalogAdminService.publish(String(req.params.id), !!req.body?.published, actor(req))));
export const adminPriceOverride = wrap(async (req, res) => ok(res, await CatalogAdminService.setPriceOverride(String(req.params.id), req.body, actor(req))));
export const adminDeleteItem = wrap(async (req, res) => ok(res, await CatalogAdminService.deleteItem(String(req.params.id), actor(req))));
export const adminListCategories = wrap(async (_req, res) => ok(res, await CatalogAdminService.listCategories()));
export const adminCreateCategory = wrap(async (req, res) => ok(res, await CatalogAdminService.createCategory(req.body, actor(req))));
export const adminReorderCategories = wrap(async (req, res) => ok(res, await CatalogAdminService.reorderCategories(req.body?.order ?? [], actor(req))));

// ── Outlet admin (Sprint 13) ────────────────────────────────────────────────────
export const adminListOutlets = wrap(async (req, res) => ok(res, await OutletAdminService.list(actor(req))));
export const adminCreateOutlet = wrap(async (req, res) => ok(res, await OutletAdminService.create(req.body, actor(req))));
export const adminUpdateOutlet = wrap(async (req, res) => ok(res, await OutletAdminService.update(String(req.params.id), req.body, actor(req))));
export const adminToggleSoldOut = wrap(async (req, res) =>
  ok(res, await OutletAdminService.toggleSoldOut(String(req.params.id), String(req.body?.itemId ?? ""), !!req.body?.soldOut, actor(req))));

// ── Loyalty config + rewards admin (Sprint 14) ──────────────────────────────────
export const getLoyaltyConfig = wrap(async (_req, res) => ok(res, await LoyaltyConfigService.get()));
export const updateLoyaltyConfig = wrap(async (req, res) => {
  const result = await LoyaltyConfigService.update(req.body ?? {}, req.user!.id);
  await AuditService.record({ actor: actor(req), action: "loyalty.config.update", entity: "loyalty_config", before: result.before, after: result.after });
  ok(res, result.after);
});
export const getLoyaltyVersions = wrap(async (_req, res) => ok(res, await LoyaltyConfigService.versions()));
export const revertLoyaltyConfig = wrap(async (req, res) => {
  const result = await LoyaltyConfigService.revert(Number(req.body?.versionIndex), req.user!.id);
  await AuditService.record({ actor: actor(req), action: "loyalty.config.revert", entity: "loyalty_config", before: result.before, after: result.after });
  ok(res, result.after);
});
export const adminListRewards = wrap(async (_req, res) => ok(res, await RewardAdminService.list()));
export const adminCreateReward = wrap(async (req, res) => ok(res, await RewardAdminService.create(req.body, actor(req))));
export const adminUpdateReward = wrap(async (req, res) => ok(res, await RewardAdminService.update(String(req.params.slug), req.body, actor(req))));
export const adminDeleteReward = wrap(async (req, res) => ok(res, await RewardAdminService.remove(String(req.params.slug), actor(req))));
export const rewardMonitor = wrap(async (_req, res) => ok(res, await RewardAdminService.monitor()));

// ── Vouchers / promos / config (Sprint 15) ──────────────────────────────────────
export const adminListVouchers = wrap(async (_req, res) => ok(res, await VoucherAdminService.list()));
export const adminCreateVoucher = wrap(async (req, res) => ok(res, await VoucherAdminService.create(req.body, actor(req))));
export const approveVoucher = wrap(async (req, res) => ok(res, await VoucherAdminService.approve(String(req.params.code), actor(req))));
export const generateBatch = wrap(async (req, res) => ok(res, await VoucherAdminService.generateBatch(req.body?.template ?? {}, Number(req.body?.count) || 1, actor(req))));
export const previewVoucher = wrap(async (req, res) => ok(res, await VoucherAdminService.preview(req.body?.voucher ?? {}, req.body?.cart ?? [])));
export const voucherPerformance = wrap(async (req, res) => ok(res, await VoucherAdminService.performance(String(req.params.code))));
export const getWelcomeOffer = wrap(async (_req, res) => ok(res, await MarketingConfigService.welcomeOffer()));
export const updateWelcomeOffer = wrap(async (req, res) => {
  const r = await MarketingConfigService.updateWelcome(req.body?.offer ?? [], req.user!.id);
  await AuditService.record({ actor: actor(req), action: "welcome_offer.update", entity: "marketing_config", before: r.before, after: r.after });
  ok(res, r.after);
});
export const getReferralConfig = wrap(async (_req, res) => ok(res, await MarketingConfigService.referral()));
export const updateReferralConfig = wrap(async (req, res) => {
  const r = await MarketingConfigService.updateReferral(req.body ?? {}, req.user!.id);
  await AuditService.record({ actor: actor(req), action: "referral_config.update", entity: "marketing_config", before: r.before, after: r.after });
  ok(res, r.after);
});

// ── Banners + campaigns (Sprint 11) ─────────────────────────────────────────────
export const adminListBanners = wrap(async (_req, res) => ok(res, await MerchandisingService.list()));
export const adminCreateBanner = wrap(async (req, res) => ok(res, await MerchandisingService.create(req.body, actor(req))));
export const adminUpdateBanner = wrap(async (req, res) => ok(res, await MerchandisingService.update(String(req.params.id), req.body, actor(req))));
export const adminDeleteBanner = wrap(async (req, res) => ok(res, await MerchandisingService.remove(String(req.params.id), actor(req))));
export const sendCampaign = wrap(async (req, res) => ok(res, await CampaignService.send(actor(req), req.body ?? {})));

// ── Payments / finance + reports (Sprint 17) ─────────────────────────────────
export const financeLedger = wrap(async (req, res) =>
  ok(res, await FinanceService.ledger(req.admin!, {
    status: req.query.status ? String(req.query.status) : undefined,
    method: req.query.method ? String(req.query.method) : undefined,
    outletId: req.query.outletId ? String(req.query.outletId) : undefined,
    from: req.query.from ? String(req.query.from) : undefined,
    to: req.query.to ? String(req.query.to) : undefined,
  })));
export const financeTransaction = wrap(async (req, res) => ok(res, await FinanceService.detail(req.admin!, String(req.params.id))));
export const requestRefund = wrap(async (req, res) =>
  ok(res, await FinanceService.requestRefund(actor(req), String(req.params.id), String(req.body?.reason ?? ""))));
export const approveRefund = wrap(async (req, res) =>
  ok(res, await FinanceService.approveRefund(actor(req), String(req.params.id), req.body?.approve !== false)));
export const listReconciliations = wrap(async (req, res) =>
  ok(res, await FinanceService.reconciliations(req.admin!, req.query.date ? String(req.query.date) : undefined, req.query.outletId ? String(req.query.outletId) : undefined)));
export const runReconciliation = wrap(async (req, res) => ok(res, await FinanceService.runReconciliation(actor(req), req.body ?? {})));
export const resolveReconciliation = wrap(async (req, res) => ok(res, await FinanceService.resolveReconciliation(actor(req), String(req.params.id))));
export const reportDefinitions = wrap(async (_req, res) => ok(res, ReportingService.definitions()));
export const runReport = wrap(async (req, res) => ok(res, await ReportingService.run(req.admin!, String(req.params.key), req.body?.filters ?? req.query ?? {})));
export const exportReportCsv = wrap(async (req, res) => {
  const result = await ReportingService.run(req.admin!, String(req.params.key), req.query ?? {});
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${String(req.params.key)}.csv`);
  res.send(ReportingService.toCsv(result));
});
export const saveReport = wrap(async (req, res) => ok(res, await ReportingService.save(actor(req), req.body ?? {})));
export const savedReports = wrap(async (_req, res) => ok(res, await ReportingService.saved()));

// ── Compliance, CMS, notifications, settings (Sprint 18) ─────────────────────
export const adminPlatformOverview = wrap(async (_req, res) => ok(res, await PlatformAdminService.overview()));
export const upsertContent = wrap(async (req, res) => ok(res, await PlatformAdminService.upsertContent(actor(req), String(req.params.key), req.body ?? {})));
export const upsertTemplate = wrap(async (req, res) => ok(res, await PlatformAdminService.upsertTemplate(actor(req), String(req.params.key), req.body ?? {})));
export const createAdminCampaign = wrap(async (req, res) => ok(res, await PlatformAdminService.createCampaign(actor(req), req.body ?? {})));
export const sendAdminCampaign = wrap(async (req, res) => ok(res, await PlatformAdminService.sendCampaign(actor(req), String(req.params.id))));
export const complianceQueue = wrap(async (_req, res) => ok(res, await PlatformAdminService.complianceQueue()));
export const createComplianceRequest = wrap(async (req, res) => ok(res, await PlatformAdminService.createComplianceRequest(actor(req), req.body ?? {})));
export const processCompliance = wrap(async (req, res) => ok(res, await PlatformAdminService.processCompliance(actor(req), String(req.params.id))));
export const updatePlatformSettings = wrap(async (req, res) => ok(res, await PlatformAdminService.updateSettings(actor(req), req.body ?? {})));
export const upsertIncident = wrap(async (req, res) => ok(res, await PlatformAdminService.upsertIncident(actor(req), req.body ?? {})));
