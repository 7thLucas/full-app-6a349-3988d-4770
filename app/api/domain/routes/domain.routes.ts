import { Router } from "express";
import { requireAuth, requireAdmin } from "~/modules/authentication/authentication.middleware";
import * as c from "../controllers/domain.controller";

const router = Router();

// ── Public catalog ───────────────────────────────────────────────────────────
router.get("/outlets", c.listOutlets);
router.get("/outlets/:id", c.getOutlet);
router.get("/menu", c.listMenu);
router.get("/rewards", c.listRewards);

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

// ── Operations Console (admin) ───────────────────────────────────────────────────
router.post("/admin/menu", requireAdmin, c.adminCreateItem);
router.put("/admin/menu/:id", requireAdmin, c.adminUpdateItem);
router.delete("/admin/menu/:id", requireAdmin, c.adminDeleteItem);
router.put("/admin/outlets/:id", requireAdmin, c.adminUpdateOutlet);
router.post("/admin/outlets/:id/sold-out", requireAdmin, c.adminToggleSoldOut);
router.get("/admin/outlets/:id/orders", requireAdmin, c.adminListOutletOrders);
router.post("/admin/orders/:id/advance", requireAdmin, c.adminAdvanceOrder);
router.post("/admin/jobs/loyalty", requireAdmin, c.runLoyaltyJob);

export default router;
