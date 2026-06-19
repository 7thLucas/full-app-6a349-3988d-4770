import type { Request, Response } from "express";
import { CatalogService } from "../services/catalog.service";
import { OutletService } from "../services/outlet.service";
import { MemberService } from "../services/member.service";
import { OrderService } from "../services/order.service";
import { RewardsService } from "../services/rewards.service";
import { LoyaltyJobs } from "../services/loyalty.jobs";
import { ReferralService } from "../services/referral.service";
import { NotificationService } from "../services/notification.service";
import { ProfileService, PreferenceService, AccountDeletionService } from "../services/profile.service";
import { MerchandisingService } from "../services/merchandising.service";

function ok(res: Response, data: any) {
  res.json({ success: true, data });
}
function fail(res: Response, error: any, fallback = "Request failed") {
  res.status(error?.statusCode ?? 500).json({ success: false, message: error?.message ?? fallback });
}

// ── Catalog (public) ─────────────────────────────────────────────────────────
export async function listOutlets(req: Request, res: Response) {
  try {
    const country = req.query.country ? String(req.query.country) : undefined;
    let lat: number | undefined;
    let lng: number | undefined;
    if (req.query.near) {
      const [la, ln] = String(req.query.near).split(",").map((n) => parseFloat(n));
      if (Number.isFinite(la) && Number.isFinite(ln)) {
        lat = la;
        lng = ln;
      }
    }
    ok(res, await OutletService.list({ country, lat, lng }));
  } catch (e) {
    fail(res, e);
  }
}
export async function getOutlet(req: Request, res: Response) {
  try {
    const outlet = await OutletService.getById(String(req.params.id));
    if (!outlet) return fail(res, { statusCode: 404, message: "Outlet not found" });
    ok(res, outlet);
  } catch (e) {
    fail(res, e);
  }
}
export async function listMenu(req: Request, res: Response) {
  try {
    const outletId = req.query.outletId ? String(req.query.outletId) : undefined;
    ok(res, await CatalogService.listMenu(outletId));
  } catch (e) {
    fail(res, e);
  }
}
export async function listCategories(_req: Request, res: Response) {
  try {
    ok(res, await CatalogService.listCategories());
  } catch (e) {
    fail(res, e);
  }
}
export async function getHome(req: Request, res: Response) {
  try {
    const country = req.query.country ? String(req.query.country) : "ID";
    ok(res, await MerchandisingService.home(req.user?.id ?? null, country));
  } catch (e) {
    fail(res, e);
  }
}
export async function listRewards(_req: Request, res: Response) {
  try {
    ok(res, await RewardsService.catalog());
  } catch (e) {
    fail(res, e);
  }
}

// ── Member (auth) ─────────────────────────────────────────────────────────────
export async function getMember(req: Request, res: Response) {
  try {
    ok(res, await MemberService.getMember(req.user!.id));
  } catch (e) {
    fail(res, e);
  }
}
export async function toggleFavorite(req: Request, res: Response) {
  try {
    ok(res, await MemberService.toggleFavorite(req.user!.id, String(req.body?.itemId ?? "")));
  } catch (e) {
    fail(res, e);
  }
}
export async function redeemReward(req: Request, res: Response) {
  try {
    ok(
      res,
      await MemberService.redeemReward(
        req.user!.id,
        String(req.body?.rewardId ?? ""),
        req.body?.idempotencyKey ? String(req.body.idempotencyKey) : undefined,
      ),
    );
  } catch (e) {
    fail(res, e);
  }
}

// ── Loyalty / vouchers / notifications / referral / profile ───────────────────
export async function getCrystalHistory(req: Request, res: Response) {
  try {
    ok(res, await MemberService.crystalHistory(req.user!.id));
  } catch (e) {
    fail(res, e);
  }
}
export async function listMemberRewards(req: Request, res: Response) {
  try {
    ok(res, await RewardsService.listForMember(req.user!.id));
  } catch (e) {
    fail(res, e);
  }
}
export async function listVouchers(req: Request, res: Response) {
  try {
    const member = await MemberService.getMember(req.user!.id);
    ok(res, member.vouchers);
  } catch (e) {
    fail(res, e);
  }
}
export async function listNotifications(req: Request, res: Response) {
  try {
    ok(res, await NotificationService.list(req.user!.id));
  } catch (e) {
    fail(res, e);
  }
}
export async function readNotifications(req: Request, res: Response) {
  try {
    ok(res, await NotificationService.markAllRead(req.user!.id));
  } catch (e) {
    fail(res, e);
  }
}
export async function registerDevice(req: Request, res: Response) {
  try {
    ok(res, await NotificationService.registerDevice(req.user!.id, String(req.body?.token ?? ""), req.body?.platform));
  } catch (e) {
    fail(res, e);
  }
}
export async function getReferral(req: Request, res: Response) {
  try {
    ok(res, await ReferralService.stats(req.user!.id));
  } catch (e) {
    fail(res, e);
  }
}
export async function validateReferral(req: Request, res: Response) {
  try {
    ok(res, await ReferralService.validateCode(String(req.body?.code ?? ""), req.user?.id));
  } catch (e) {
    fail(res, e);
  }
}
export async function updateProfile(req: Request, res: Response) {
  try {
    ok(res, await ProfileService.updateProfile(req.user!.id, req.body ?? {}));
  } catch (e) {
    fail(res, e);
  }
}
export async function addAddress(req: Request, res: Response) {
  try {
    ok(res, await ProfileService.addAddress(req.user!.id, req.body ?? {}));
  } catch (e) {
    fail(res, e);
  }
}
export async function updateAddress(req: Request, res: Response) {
  try {
    ok(res, await ProfileService.updateAddress(req.user!.id, String(req.params.id), req.body ?? {}));
  } catch (e) {
    fail(res, e);
  }
}
export async function deleteAddress(req: Request, res: Response) {
  try {
    ok(res, await ProfileService.deleteAddress(req.user!.id, String(req.params.id)));
  } catch (e) {
    fail(res, e);
  }
}
export async function addPaymentMethod(req: Request, res: Response) {
  try {
    ok(res, await ProfileService.addPaymentMethod(req.user!.id, req.body ?? {}));
  } catch (e) {
    fail(res, e);
  }
}
export async function deletePaymentMethod(req: Request, res: Response) {
  try {
    ok(res, await ProfileService.deletePaymentMethod(req.user!.id, String(req.params.id)));
  } catch (e) {
    fail(res, e);
  }
}
export async function updatePreferences(req: Request, res: Response) {
  try {
    ok(res, await PreferenceService.update(req.user!.id, req.body ?? {}));
  } catch (e) {
    fail(res, e);
  }
}
export async function requestDeletion(req: Request, res: Response) {
  try {
    ok(res, await AccountDeletionService.request(req.user!.id, req.body?.reason));
  } catch (e) {
    fail(res, e);
  }
}
export async function runLoyaltyJob(req: Request, res: Response) {
  try {
    const job = String(req.body?.job ?? "");
    if (job === "expiry") return ok(res, await LoyaltyJobs.runExpirySweep());
    if (job === "recalc") return ok(res, await LoyaltyJobs.runMonthEndRecalc());
    return fail(res, { statusCode: 400, message: "Unknown job (use 'expiry' or 'recalc')" });
  } catch (e) {
    fail(res, e);
  }
}

// ── Orders (auth) ────────────────────────────────────────────────────────────
export async function validateVoucher(req: Request, res: Response) {
  try {
    const voucher = await OrderService.validateVoucher(
      req.user!.id,
      String(req.body?.code ?? ""),
      req.body?.lines ?? [],
    );
    ok(res, voucher);
  } catch (e) {
    fail(res, e);
  }
}
export async function checkout(req: Request, res: Response) {
  try {
    ok(res, await OrderService.checkout(req.user!.id, req.body));
  } catch (e) {
    fail(res, e);
  }
}
export async function listOrders(req: Request, res: Response) {
  try {
    ok(res, await OrderService.listOrders(req.user!.id));
  } catch (e) {
    fail(res, e);
  }
}
export async function getOrder(req: Request, res: Response) {
  try {
    const order = await OrderService.getOrder(req.user!.id, String(req.params.id));
    if (!order) return fail(res, { statusCode: 404, message: "Order not found" });
    ok(res, order);
  } catch (e) {
    fail(res, e);
  }
}
export async function advanceOrder(req: Request, res: Response) {
  try {
    // Member-facing simulated progression (one step).
    const order = await OrderService.getOrder(req.user!.id, String(req.params.id));
    if (!order) return fail(res, { statusCode: 404, message: "Order not found" });
    ok(res, await OrderService.advanceStatus(String(req.params.id)));
  } catch (e) {
    fail(res, e);
  }
}
export async function cancelOrder(req: Request, res: Response) {
  try {
    ok(res, await OrderService.cancelOrder(req.user!.id, String(req.params.id), req.body?.reason));
  } catch (e) {
    fail(res, e);
  }
}

// ── Operations Console (admin) ───────────────────────────────────────────────
export async function adminCreateItem(req: Request, res: Response) {
  try {
    ok(res, await CatalogService.createItem(req.body));
  } catch (e) {
    fail(res, e);
  }
}
export async function adminUpdateItem(req: Request, res: Response) {
  try {
    ok(res, await CatalogService.updateItem(String(req.params.id), req.body));
  } catch (e) {
    fail(res, e);
  }
}
export async function adminDeleteItem(req: Request, res: Response) {
  try {
    await CatalogService.deleteItem(String(req.params.id));
    ok(res, { deleted: true });
  } catch (e) {
    fail(res, e);
  }
}
export async function adminUpdateOutlet(req: Request, res: Response) {
  try {
    ok(res, await CatalogService.updateOutlet(String(req.params.id), req.body));
  } catch (e) {
    fail(res, e);
  }
}
export async function adminToggleSoldOut(req: Request, res: Response) {
  try {
    ok(
      res,
      await CatalogService.toggleSoldOut(String(req.params.id), String(req.body?.itemId ?? ""), !!req.body?.soldOut),
    );
  } catch (e) {
    fail(res, e);
  }
}
export async function adminListOutletOrders(req: Request, res: Response) {
  try {
    ok(res, await OrderService.listOutletOrders(String(req.params.id)));
  } catch (e) {
    fail(res, e);
  }
}
export async function adminAdvanceOrder(req: Request, res: Response) {
  try {
    ok(res, await OrderService.advanceStatus(String(req.params.id), req.body?.status));
  } catch (e) {
    fail(res, e);
  }
}
