import { TransactionModel } from "../models/transaction.model";
import { ReconciliationModel } from "../models/reconciliation.model";
import { SavedReportModel } from "../models/saved-report.model";
import { OrderModel } from "../models/order.model";
import { UserModel } from "~/modules/authentication/authentication.model";
import { AuditService } from "./audit.service";
import { LoyaltyService } from "./loyalty.service";
import { paymentGateway } from "./payment.gateway";
import { inScope, type AdminIdentity } from "../admin/rbac";

type Actor = { id: string; admin?: AdminIdentity | null };

interface LedgerFilters {
  status?: string;
  method?: string;
  outletId?: string;
  from?: string;
  to?: string;
}

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

function scopedMatch(identity: AdminIdentity, f: LedgerFilters = {}) {
  const match: Record<string, any> = {};
  if (identity.outletScope.length > 0) match.outletId = { $in: identity.outletScope };
  if (f.outletId) {
    if (!inScope(identity, f.outletId)) throw makeError("Outlet not in your scope", 403);
    match.outletId = f.outletId;
  }
  if (f.status) match.status = f.status;
  if (f.method) match.method = f.method;
  if (f.from || f.to) {
    match.createdAt = {};
    if (f.from) match.createdAt.$gte = new Date(f.from);
    if (f.to) match.createdAt.$lte = new Date(f.to);
  }
  return match;
}

function txnDto(t: any, order?: any) {
  return {
    id: t._id.toString(),
    orderId: t.orderId,
    outletId: t.outletId,
    outletName: order?.outletName ?? "",
    pickupCode: order?.pickupCode ?? "",
    method: t.method,
    amount: t.amount,
    status: t.status,
    gatewayRef: t.gatewayRef,
    refundStatus: t.refundStatus ?? "none",
    refundReason: t.refundReason ?? null,
    refundRequestedBy: t.refundRequestedBy ?? null,
    refundApprovedBy: t.refundApprovedBy ?? null,
    createdAt: (t.createdAt as Date)?.toISOString?.() ?? new Date().toISOString(),
  };
}

export class FinanceService {
  static async ledger(identity: AdminIdentity, f: LedgerFilters) {
    const txns = await TransactionModel.find(scopedMatch(identity, f)).sort({ createdAt: -1 }).limit(250).lean();
    const orders = await OrderModel.find({ _id: { $in: txns.map((t) => t.orderId) } }).lean();
    const byId = new Map(orders.map((o) => [o._id.toString(), o]));
    return txns.map((t) => txnDto(t, byId.get(t.orderId)));
  }

  static async detail(identity: AdminIdentity, id: string) {
    const txn = await TransactionModel.findById(id).lean();
    if (!txn) throw makeError("Transaction not found", 404);
    if (!inScope(identity, txn.outletId)) throw makeError("Outlet not in your scope", 403);
    const order = await OrderModel.findById(txn.orderId).lean();
    return { ...txnDto(txn, order), order };
  }

  static async requestRefund(actor: Actor, id: string, reason: string) {
    const txn = await TransactionModel.findById(id);
    if (!txn) throw makeError("Transaction not found", 404);
    if (!inScope(actor.admin ?? null, txn.outletId)) throw makeError("Outlet not in your scope", 403);
    if (txn.status !== "paid") throw makeError("Only paid transactions can be refunded", 409);
    if (!reason?.trim()) throw makeError("Refund reason is required", 400);

    const before = txn.toObject();
    txn.refundStatus = "pending";
    txn.refundReason = reason.trim();
    txn.refundRequestedBy = actor.id;
    await txn.save();
    await AuditService.record({ actor, action: "refund.request", entity: "transaction", entityId: txn.id, before, after: txn.toObject(), reason });
    return txnDto(txn.toObject());
  }

  static async approveRefund(actor: Actor, id: string, approve: boolean) {
    const txn = await TransactionModel.findById(id);
    if (!txn) throw makeError("Transaction not found", 404);
    if (!inScope(actor.admin ?? null, txn.outletId)) throw makeError("Outlet not in your scope", 403);
    if (txn.refundStatus !== "pending") throw makeError("Refund is not pending approval", 409);
    if (txn.refundRequestedBy === actor.id) throw makeError("Refund requires a second approver", 409);

    const before = txn.toObject();
    txn.refundStatus = approve ? "approved" : "rejected";
    txn.refundApprovedBy = actor.id;
    if (approve) {
      await paymentGateway.refund(txn.gatewayRef ?? "", txn.amount);
      txn.status = "refunded";
      await OrderModel.findByIdAndUpdate(txn.orderId, { paymentStatus: "refunded" });
    }
    await txn.save();
    await AuditService.record({
      actor,
      action: approve ? "refund.approve" : "refund.reject",
      entity: "transaction",
      entityId: txn.id,
      before,
      after: txn.toObject(),
      reason: txn.refundReason,
    });
    return txnDto(txn.toObject());
  }

  static async reconciliations(identity: AdminIdentity, date?: string, outletId?: string) {
    const q: Record<string, any> = {};
    if (identity.outletScope.length > 0) q.outletId = { $in: identity.outletScope };
    if (date) q.settlementDate = date;
    if (outletId) {
      if (!inScope(identity, outletId)) throw makeError("Outlet not in your scope", 403);
      q.outletId = outletId;
    }
    const rows = await ReconciliationModel.find(q).sort({ settlementDate: -1, createdAt: -1 }).limit(100).lean();
    return rows.map((r) => ({ ...r, id: r._id.toString() }));
  }

  static async runReconciliation(actor: Actor, args: { settlementDate: string; outletId?: string; posTotal?: number; gatewayTotal?: number }) {
    if (!args.settlementDate) throw makeError("Settlement date is required", 400);
    if (!inScope(actor.admin ?? null, args.outletId ?? null)) throw makeError("Outlet not in your scope", 403);
    const dayStart = new Date(`${args.settlementDate}T00:00:00.000Z`);
    const dayEnd = new Date(`${args.settlementDate}T23:59:59.999Z`);
    const match: Record<string, any> = { status: { $in: ["paid", "refunded"] }, createdAt: { $gte: dayStart, $lte: dayEnd } };
    if (args.outletId) match.outletId = args.outletId;
    const txns = await TransactionModel.find(match).lean();
    const appTotal = txns.reduce((s, t) => s + (t.status === "refunded" ? 0 : t.amount ?? 0), 0);
    const posTotal = Number(args.posTotal ?? appTotal);
    const gatewayTotal = Number(args.gatewayTotal ?? appTotal);
    const mismatchFlags = [
      Math.abs(appTotal - posTotal) > 1 ? "APP_POS_AMOUNT" : null,
      Math.abs(appTotal - gatewayTotal) > 1 ? "APP_GATEWAY_AMOUNT" : null,
      txns.some((t) => !t.gatewayRef) ? "MISSING_GATEWAY_REF" : null,
    ].filter(Boolean) as string[];
    const status = mismatchFlags.length ? "mismatch" : "matched";
    const row = await ReconciliationModel.findOneAndUpdate(
      { settlementDate: args.settlementDate, outletId: args.outletId ?? null },
      { settlementDate: args.settlementDate, outletId: args.outletId ?? null, appTotal, posTotal, gatewayTotal, mismatchFlags, status },
      { upsert: true, new: true },
    );
    await AuditService.record({ actor, action: "reconciliation.run", entity: "reconciliation", entityId: row.id, after: row.toObject() });
    return { ...row.toObject(), id: row.id };
  }

  static async resolveReconciliation(actor: Actor, id: string) {
    const row = await ReconciliationModel.findById(id);
    if (!row) throw makeError("Reconciliation not found", 404);
    if (!inScope(actor.admin ?? null, row.outletId)) throw makeError("Outlet not in your scope", 403);
    const before = row.toObject();
    row.status = "resolved";
    row.resolvedBy = actor.id;
    await row.save();
    await AuditService.record({ actor, action: "reconciliation.resolve", entity: "reconciliation", entityId: row.id, before, after: row.toObject() });
    return { ...row.toObject(), id: row.id };
  }
}

const REPORTS = [
  { key: "sales", name: "Sales Revenue", description: "Revenue, PB1 tax, discounts, and order count by outlet." },
  { key: "product-performance", name: "Product Performance", description: "Units and gross sales by menu item." },
  { key: "loyalty-liability", name: "Sugar Crystals Liability", description: "Outstanding Sugar Crystal balances valued as liability." },
  { key: "voucher-roi", name: "Voucher / Promo ROI", description: "Discount cost and revenue attached to voucher codes." },
  { key: "retention-cohort", name: "Retention Cohort", description: "Repeat ordering and active member retention." },
  { key: "operational-sla", name: "Operational SLA", description: "Prep time and completion status by outlet." },
];

export class ReportingService {
  static definitions() {
    return REPORTS;
  }

  static async run(identity: AdminIdentity, key: string, filters: LedgerFilters = {}) {
    const orderMatch: Record<string, any> = {};
    if (identity.outletScope.length > 0) orderMatch.outletId = { $in: identity.outletScope };
    if (filters.outletId) {
      if (!inScope(identity, filters.outletId)) throw makeError("Outlet not in your scope", 403);
      orderMatch.outletId = filters.outletId;
    }
    if (filters.from || filters.to) {
      orderMatch.createdAt = {};
      if (filters.from) orderMatch.createdAt.$gte = new Date(filters.from);
      if (filters.to) orderMatch.createdAt.$lte = new Date(filters.to);
    }

    if (key === "loyalty-liability") {
      const users = await UserModel.find({ phone: { $ne: null } }).lean();
      const rows = users.map((u) => {
        const p = LoyaltyService.ensure((u.profile ?? {}) as Record<string, any>);
        const outstanding = LoyaltyService.balance(p);
        return { memberId: u._id.toString(), phone: u.phone, tier: LoyaltyService.effectiveTier(p), outstanding, liabilityIdr: outstanding * 100 };
      }).filter((r) => r.outstanding > 0);
      return { key, rows, totals: { outstanding: rows.reduce((s, r) => s + r.outstanding, 0), liabilityIdr: rows.reduce((s, r) => s + r.liabilityIdr, 0) } };
    }

    const orders = await OrderModel.find(orderMatch).sort({ createdAt: -1 }).limit(5000).lean();
    if (key === "product-performance") {
      const byItem = new Map<string, any>();
      for (const o of orders) for (const l of o.lines ?? []) {
        const row = byItem.get(l.itemId) ?? { itemId: l.itemId, name: l.name, units: 0, gross: 0 };
        row.units += l.quantity ?? 0;
        row.gross += (l.unitPrice ?? 0) * (l.quantity ?? 0);
        byItem.set(l.itemId, row);
      }
      return { key, rows: [...byItem.values()].sort((a, b) => b.gross - a.gross) };
    }
    if (key === "voucher-roi") {
      const byCode = new Map<string, any>();
      for (const o of orders.filter((o) => o.voucherCode)) {
        const code = String(o.voucherCode);
        const row = byCode.get(code) ?? { code, orders: 0, revenue: 0, discount: 0 };
        row.orders += 1;
        row.revenue += o.total ?? 0;
        row.discount += o.discount ?? 0;
        byCode.set(code, row);
      }
      return { key, rows: [...byCode.values()].sort((a, b) => b.revenue - a.revenue) };
    }
    if (key === "retention-cohort") {
      const counts = new Map<string, number>();
      for (const o of orders) counts.set(o.userId, (counts.get(o.userId) ?? 0) + 1);
      const repeat = [...counts.values()].filter((n) => n > 1).length;
      return { key, rows: [{ members: counts.size, repeatMembers: repeat, repeatRate: counts.size ? Math.round((repeat / counts.size) * 100) : 0 }] };
    }
    if (key === "operational-sla") {
      return { key, rows: orders.map((o) => ({ orderId: o._id.toString(), outlet: o.outletName, status: o.status, etaMinutes: o.etaMinutes, createdAt: o.createdAt })) };
    }
    const rows = orders.map((o) => ({ id: o._id.toString(), outlet: o.outletName, status: o.status, subtotal: o.subtotal, discount: o.discount, tax: o.tax, total: o.total, paymentMethod: o.paymentMethod, createdAt: o.createdAt }));
    return { key: "sales", rows, totals: { revenue: rows.reduce((s, r) => s + (r.total ?? 0), 0), tax: rows.reduce((s, r) => s + (r.tax ?? 0), 0), discounts: rows.reduce((s, r) => s + (r.discount ?? 0), 0), orders: rows.length } };
  }

  static async save(actor: Actor, data: { name: string; reportKey: string; filters?: any; schedule?: string | null; deliverTo?: string | null }) {
    const saved = await SavedReportModel.create({
      name: data.name,
      reportKey: data.reportKey,
      filters: data.filters ?? {},
      schedule: data.schedule ?? null,
      deliverTo: data.deliverTo ?? null,
    });
    await AuditService.record({ actor, action: "report.save", entity: "saved_report", entityId: saved.id, after: data });
    return { ...saved.toObject(), id: saved.id };
  }

  static async saved() {
    const rows = await SavedReportModel.find().sort({ createdAt: -1 }).lean();
    return rows.map((r) => ({ ...r, id: r._id.toString() }));
  }

  static toCsv(result: any) {
    const rows = result.rows ?? [];
    const cols = [...new Set<string>(rows.flatMap((r: any) => Object.keys(r)))];
    const esc = (v: any) => JSON.stringify(v == null ? "" : String(v));
    return [cols.join(","), ...rows.map((r: any) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  }
}
