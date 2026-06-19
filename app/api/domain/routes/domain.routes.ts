import { Router } from "express";
import { requireAuth, requireAdmin, optionalAuth } from "~/modules/authentication/authentication.middleware";
import { permissionGuard } from "../admin/permission.guard";
import * as c from "../controllers/domain.controller";
import * as a from "../controllers/admin.controller";

const router = Router();

// ── Public catalog ───────────────────────────────────────────────────────────
router.get("/outlets", c.listOutlets);
router.get("/outlets/:id", c.getOutlet);
router.get("/menu", c.listMenu);
router.get("/categories", c.listCategories);
router.get("/rewards", c.listRewards);
router.get("/home", optionalAuth, c.getHome); // Sprint 11 — personalized when authed

// ── Member (auth) ──────────────────────────────────────────────────────────────
router.get("/member/me", requireAuth, c.getMember);
router.patch("/member/me", requireAuth, c.updateProfile);
router.post("/member/favorites", requireAuth, c.toggleFavorite);
router.post("/member/redeem", requireAuth, c.redeemReward);
router.get("/member/rewards", requireAuth, c.listMemberRewards);
router.get("/member/crystals", requireAuth, c.getCrystalHistory);
router.get("/member/vouchers", requireAuth, c.listVouchers);

// Loyalty notifications + push device tokens (Sprint 6)
router.get("/member/notifications", requireAuth, c.listNotifications);
router.post("/member/notifications/read", requireAuth, c.readNotifications);
router.post("/member/device-token", requireAuth, c.registerDevice);

// Referral (Sprint 9)
router.get("/member/referral", requireAuth, c.getReferral);
// Authed: the referee has a session post-OTP, so we can block self-referral inline.
router.post("/referral/validate", requireAuth, c.validateReferral);

// Profile / settings (Sprint 10)
router.post("/member/addresses", requireAuth, c.addAddress);
router.put("/member/addresses/:id", requireAuth, c.updateAddress);
router.delete("/member/addresses/:id", requireAuth, c.deleteAddress);
router.post("/member/payment-methods", requireAuth, c.addPaymentMethod);
router.delete("/member/payment-methods/:id", requireAuth, c.deletePaymentMethod);
router.patch("/member/preferences", requireAuth, c.updatePreferences);
router.post("/member/deletion-request", requireAuth, c.requestDeletion);

// ── Orders (auth) ───────────────────────────────────────────────────────────────
router.post("/orders/validate-voucher", requireAuth, c.validateVoucher);
router.post("/orders/checkout", requireAuth, c.checkout);
router.get("/orders", requireAuth, c.listOrders);
router.get("/orders/:id", requireAuth, c.getOrder);
router.post("/orders/:id/advance", requireAuth, c.advanceOrder);
router.post("/orders/:id/cancel", requireAuth, c.cancelOrder);

// ── Operations Console (legacy scaffold endpoints) ────────────────────────────
router.get("/admin/outlets/:id/orders", requireAdmin, c.adminListOutletOrders);
router.post("/admin/orders/:id/advance", requireAdmin, c.adminAdvanceOrder);
router.post("/admin/jobs/loyalty", permissionGuard("loyalty.manage"), c.runLoyaltyJob);

// ── Admin Console — RBAC + Dashboard + Orders (Sprint 12) ─────────────────────
router.get("/admin/dashboard", permissionGuard("dashboard.view"), a.getDashboard);
router.get("/admin/dashboard/export", permissionGuard("dashboard.view"), a.exportDashboardCsv);
router.get("/admin/orders/board", permissionGuard("orders.view"), a.adminBoard);
router.get("/admin/orders/search", permissionGuard("orders.view"), a.adminSearchOrders);
router.post("/admin/orders/:id/override", permissionGuard("orders.manage"), a.adminOverrideOrder);
router.post("/admin/orders/:id/cancel-refund", permissionGuard("orders.manage"), a.adminCancelRefund);
router.get("/admin/audit", permissionGuard("audit.view"), a.listAudit);
router.get("/admin/audit/export", permissionGuard("audit.view"), a.exportAuditCsv);
router.post("/admin/users/:id/role", permissionGuard("rbac.manage"), a.assignRole);

// ── Admin Console — Catalog + Outlets (Sprint 13) ─────────────────────────────
router.get("/admin/catalog/items", permissionGuard("catalog.manage"), a.adminListItems);
router.post("/admin/catalog/items", permissionGuard("catalog.manage"), a.adminCreateItem);
router.put("/admin/catalog/items/:id", permissionGuard("catalog.manage"), a.adminUpdateItem);
router.post("/admin/catalog/items/:id/publish", permissionGuard("catalog.manage"), a.adminPublishItem);
router.post("/admin/catalog/items/:id/price-override", permissionGuard("catalog.manage"), a.adminPriceOverride);
router.delete("/admin/catalog/items/:id", permissionGuard("catalog.manage"), a.adminDeleteItem);
router.get("/admin/catalog/categories", permissionGuard("catalog.manage"), a.adminListCategories);
router.post("/admin/catalog/categories", permissionGuard("catalog.manage"), a.adminCreateCategory);
router.post("/admin/catalog/categories/reorder", permissionGuard("catalog.manage"), a.adminReorderCategories);
router.get("/admin/outlets", permissionGuard("outlets.manage"), a.adminListOutlets);
router.post("/admin/outlets", permissionGuard("outlets.manage"), a.adminCreateOutlet);
router.put("/admin/outlets/:id", permissionGuard("outlets.manage"), a.adminUpdateOutlet);
router.post("/admin/outlets/:id/sold-out", permissionGuard("outlets.manage"), a.adminToggleSoldOut);

// ── Admin Console — Loyalty + Rewards config (Sprint 14) ──────────────────────
router.get("/admin/loyalty/config", permissionGuard("loyalty.manage"), a.getLoyaltyConfig);
router.put("/admin/loyalty/config", permissionGuard("loyalty.manage"), a.updateLoyaltyConfig);
router.get("/admin/loyalty/config/versions", permissionGuard("loyalty.manage"), a.getLoyaltyVersions);
router.post("/admin/loyalty/config/revert", permissionGuard("loyalty.manage"), a.revertLoyaltyConfig);
router.get("/admin/rewards", permissionGuard("rewards.manage"), a.adminListRewards);
router.post("/admin/rewards", permissionGuard("rewards.manage"), a.adminCreateReward);
router.put("/admin/rewards/:slug", permissionGuard("rewards.manage"), a.adminUpdateReward);
router.delete("/admin/rewards/:slug", permissionGuard("rewards.manage"), a.adminDeleteReward);
router.get("/admin/rewards-monitor", permissionGuard("rewards.manage"), a.rewardMonitor);

// ── Admin Console — Vouchers / Promos / Referral config (Sprint 15) ───────────
router.get("/admin/vouchers", permissionGuard("vouchers.manage"), a.adminListVouchers);
router.post("/admin/vouchers", permissionGuard("vouchers.manage"), a.adminCreateVoucher);
router.post("/admin/vouchers/:code/approve", permissionGuard("vouchers.manage"), a.approveVoucher);
router.post("/admin/vouchers/batch", permissionGuard("vouchers.manage"), a.generateBatch);
router.post("/admin/vouchers/preview", permissionGuard("vouchers.manage"), a.previewVoucher);
router.get("/admin/vouchers/:code/performance", permissionGuard("vouchers.manage"), a.voucherPerformance);
router.get("/admin/welcome-offer", permissionGuard("vouchers.manage"), a.getWelcomeOffer);
router.put("/admin/welcome-offer", permissionGuard("vouchers.manage"), a.updateWelcomeOffer);
router.get("/admin/referral-config", permissionGuard("referral.manage"), a.getReferralConfig);
router.put("/admin/referral-config", permissionGuard("referral.manage"), a.updateReferralConfig);

// ── Admin Console — Banners + Campaigns (Sprint 11) ───────────────────────────
router.get("/admin/banners", permissionGuard("banners.manage"), a.adminListBanners);
router.post("/admin/banners", permissionGuard("banners.manage"), a.adminCreateBanner);
router.put("/admin/banners/:id", permissionGuard("banners.manage"), a.adminUpdateBanner);
router.delete("/admin/banners/:id", permissionGuard("banners.manage"), a.adminDeleteBanner);
router.post("/admin/campaigns/send", permissionGuard("campaigns.manage"), a.sendCampaign);

// ── Admin Console — Payments / Finance + Reports (Sprint 17) ────────────────
router.get("/admin/finance/transactions", permissionGuard("finance.view"), a.financeLedger);
router.get("/admin/finance/transactions/:id", permissionGuard("finance.view"), a.financeTransaction);
router.post("/admin/finance/transactions/:id/refund", permissionGuard("finance.manage"), a.requestRefund);
router.post("/admin/finance/transactions/:id/refund/approval", permissionGuard("finance.manage"), a.approveRefund);
router.get("/admin/finance/reconciliations", permissionGuard("finance.view"), a.listReconciliations);
router.post("/admin/finance/reconciliations/run", permissionGuard("finance.manage"), a.runReconciliation);
router.post("/admin/finance/reconciliations/:id/resolve", permissionGuard("finance.manage"), a.resolveReconciliation);
router.get("/admin/reports/definitions", permissionGuard("reports.view"), a.reportDefinitions);
router.post("/admin/reports/:key/run", permissionGuard("reports.view"), a.runReport);
router.get("/admin/reports/:key/export", permissionGuard("reports.view"), a.exportReportCsv);
router.get("/admin/reports/saved/list", permissionGuard("reports.view"), a.savedReports);
router.post("/admin/reports/saved", permissionGuard("reports.manage"), a.saveReport);

// ── Admin Console — Compliance, CMS, notifications, settings (Sprint 18) ────
router.get("/admin/platform", permissionGuard("campaigns.manage"), a.adminPlatformOverview);
router.put("/admin/platform/content/:key", permissionGuard("banners.manage"), a.upsertContent);
router.put("/admin/platform/templates/:key", permissionGuard("campaigns.manage"), a.upsertTemplate);
router.post("/admin/platform/campaigns", permissionGuard("campaigns.manage"), a.createAdminCampaign);
router.post("/admin/platform/campaigns/:id/send", permissionGuard("campaigns.manage"), a.sendAdminCampaign);
router.get("/admin/platform/compliance", permissionGuard("compliance.manage"), a.complianceQueue);
router.post("/admin/platform/compliance", permissionGuard("compliance.manage"), a.createComplianceRequest);
router.post("/admin/platform/compliance/:id/process", permissionGuard("compliance.manage"), a.processCompliance);
router.put("/admin/platform/settings", permissionGuard("settings.manage"), a.updatePlatformSettings);
router.post("/admin/platform/incidents", permissionGuard("settings.manage"), a.upsertIncident);

export default router;
