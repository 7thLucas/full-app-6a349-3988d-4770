import { OrderModel } from "../models/order.model";
import { UserModel } from "~/modules/authentication/authentication.model";
import { inScope, type AdminIdentity } from "../admin/rbac";

interface Filters {
  from?: string;
  to?: string;
  outletId?: string;
  channel?: string;
}

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

function buildMatch(identity: AdminIdentity, f: Filters): Record<string, any> {
  const m: Record<string, any> = {};
  if (identity.outletScope.length > 0) m.outletId = { $in: identity.outletScope };
  if (f.outletId) {
    if (!inScope(identity, f.outletId)) throw makeError("Outlet not in your scope", 403);
    m.outletId = f.outletId;
  }
  if (f.channel) m.channel = f.channel;
  if (f.from || f.to) {
    m.createdAt = {};
    if (f.from) m.createdAt.$gte = new Date(f.from);
    if (f.to) m.createdAt.$lte = new Date(f.to);
  }
  return m;
}

async function kpisFor(match: Record<string, any>) {
  const orders = await OrderModel.find(match).lean();
  const paid = orders.filter((o) => o.status !== "cancelled");
  const appOrders = paid.filter((o) => (o.channel ?? "app") === "app");
  const thirdParty = paid.filter((o) => (o.channel ?? "app") === "third-party");
  const revenue = paid.reduce((s, o) => s + (o.total ?? 0), 0);
  const orderCount = paid.length;
  return {
    orders: orderCount,
    revenue,
    aov: orderCount ? Math.round(revenue / orderCount) : 0,
    appOrders: appOrders.length,
    thirdPartyOrders: thirdParty.length,
    appShare: orderCount ? Math.round((appOrders.length / orderCount) * 100) : 0,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    crystalsIssued: paid.reduce((s, o) => s + (o.crystalsEarned ?? 0), 0),
  };
}

// Shift a date window back by its own length for compare-to-prior.
function priorWindow(f: Filters): Filters | null {
  if (!f.from || !f.to) return null;
  const from = new Date(f.from).getTime();
  const to = new Date(f.to).getTime();
  const span = to - from;
  return { ...f, from: new Date(from - span).toISOString(), to: new Date(from).toISOString() };
}

export class DashboardService {
  static async overview(identity: AdminIdentity, f: Filters) {
    const match = buildMatch(identity, f);
    const current = await kpisFor(match);

    // Registered users + MAU (active in last 30 days by order).
    const registeredUsers = await UserModel.countDocuments({ phone: { $ne: null } });
    const since = new Date(Date.now() - 30 * 86400_000);
    const mauIds = await OrderModel.distinct("userId", { createdAt: { $gte: since } });

    let compare = null;
    const prior = priorWindow(f);
    if (prior) compare = await kpisFor(buildMatch(identity, prior));

    return {
      kpis: { ...current, registeredUsers, mau: mauIds.length },
      compare,
      funnel: {
        registered: registeredUsers,
        ordered: await OrderModel.distinct("userId", match).then((a) => a.length),
        repeat: await DashboardService.repeatBuyers(match),
      },
      filters: f,
    };
  }

  private static async repeatBuyers(match: Record<string, any>): Promise<number> {
    const rows = await OrderModel.aggregate([
      { $match: match },
      { $group: { _id: "$userId", n: { $sum: 1 } } },
      { $match: { n: { $gt: 1 } } },
      { $count: "repeat" },
    ]);
    return rows[0]?.repeat ?? 0;
  }

  /** CSV export of orders for the filtered window (drill-down source). */
  static async exportCsv(identity: AdminIdentity, f: Filters): Promise<string> {
    const match = buildMatch(identity, f);
    const orders = await OrderModel.find(match).sort({ createdAt: -1 }).limit(5000).lean();
    const header = "id,createdAt,outlet,status,channel,total,crystalsEarned,paymentMethod";
    const rows = orders.map((o) =>
      [
        o._id.toString(),
        new Date(o.createdAt ?? Date.now()).toISOString(),
        JSON.stringify(o.outletName ?? ""),
        o.status,
        o.channel ?? "app",
        o.total ?? 0,
        o.crystalsEarned ?? 0,
        o.paymentMethod ?? "",
      ].join(","),
    );
    return [header, ...rows].join("\n");
  }
}
