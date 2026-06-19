import type { Request, Response } from "express";
import { CatalogService } from "../services/catalog.service";
import { MemberService } from "../services/member.service";
import { OrderService } from "../services/order.service";
import { REWARDS } from "../rewards.catalog";

function ok(res: Response, data: any) {
  res.json({ success: true, data });
}
function fail(res: Response, error: any, fallback = "Request failed") {
  res.status(error?.statusCode ?? 500).json({ success: false, message: error?.message ?? fallback });
}

// ── Catalog (public) ─────────────────────────────────────────────────────────
export async function listOutlets(_req: Request, res: Response) {
  try {
    ok(res, await CatalogService.listOutlets());
  } catch (e) {
    fail(res, e);
  }
}
export async function listMenu(_req: Request, res: Response) {
  try {
    ok(res, await CatalogService.listMenu());
  } catch (e) {
    fail(res, e);
  }
}
export async function listRewards(_req: Request, res: Response) {
  ok(res, REWARDS);
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
    ok(res, await MemberService.redeemReward(req.user!.id, String(req.body?.rewardId ?? "")));
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
    ok(res, await OrderService.cancelOrder(req.user!.id, String(req.params.id)));
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
