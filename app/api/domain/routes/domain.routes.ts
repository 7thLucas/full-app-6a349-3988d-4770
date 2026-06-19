import { Router } from "express";
import { requireAuth, requireAdmin } from "~/modules/authentication/authentication.middleware";
import * as c from "../controllers/domain.controller";

const router = Router();

// ── Public catalog ───────────────────────────────────────────────────────────
router.get("/outlets", c.listOutlets);
router.get("/menu", c.listMenu);
router.get("/rewards", c.listRewards);

// ── Member (auth) ──────────────────────────────────────────────────────────────
router.get("/member/me", requireAuth, c.getMember);
router.post("/member/favorites", requireAuth, c.toggleFavorite);
router.post("/member/redeem", requireAuth, c.redeemReward);

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

export default router;
