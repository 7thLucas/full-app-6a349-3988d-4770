import crypto from "node:crypto";
import { PromoCodeModel } from "../models/promo-code.model";
import { VoucherEngine } from "./voucher.engine";
import { AuditService } from "./audit.service";
import type { AdminIdentity } from "../admin/rbac";
import type { Voucher, CartLine } from "~/lib/domain.types";

type Actor = { id: string; admin?: AdminIdentity | null };

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

// Convert a stored promo doc into a wallet-style Voucher for engine evaluation.
export function promoToVoucher(p: any): Voucher {
  return {
    id: p._id?.toString() ?? p.code,
    code: p.code,
    title: p.title,
    description: p.description,
    discountType: p.discountType,
    discountValue: p.discountValue,
    minSpend: p.minSpend,
    eligibleItemIds: p.eligibleItemIds?.length ? p.eligibleItemIds : undefined,
    eligibleCategories: p.eligibleCategories?.length ? p.eligibleCategories : undefined,
    fulfillmentModes: p.fulfillmentModes?.length ? p.fulfillmentModes : undefined,
    expiresAt: (p.validUntil ? new Date(p.validUntil) : new Date(Date.now() + 365 * 86400_000)).toISOString(),
    used: false,
    source: "promo",
  };
}

// ── VoucherAdminService (Sprint 15 §14.10) ───────────────────────────────────
export class VoucherAdminService {
  static async list() {
    const codes = await PromoCodeModel.find().sort({ createdAt: -1 }).limit(500).lean();
    return codes.map((c) => ({ ...c, id: c._id.toString() }));
  }

  /** Create a voucher/promo. Global/high-value routes to dual-approval. */
  static async create(data: any, actor: Actor) {
    const code = (data.code || "PROMO" + crypto.randomBytes(3).toString("hex")).toUpperCase();
    if (await PromoCodeModel.findOne({ code })) throw makeError("Code already exists", 409);
    const isGlobal = !!data.isGlobal || data.usageCapGlobal == null;
    const highValue = (data.discountType === "fixed" && data.discountValue >= 50000) ||
      (data.discountType === "percent" && data.discountValue >= 50);
    const needsApproval = isGlobal || highValue;
    const created = await PromoCodeModel.create({
      code,
      title: data.title ?? code,
      description: data.description ?? "",
      discountType: data.discountType ?? "fixed",
      discountValue: Number(data.discountValue) || 0,
      minSpend: Number(data.minSpend) || 0,
      eligibleItemIds: data.eligibleItemIds ?? [],
      eligibleCategories: data.eligibleCategories ?? [],
      fulfillmentModes: data.fulfillmentModes ?? [],
      validFrom: data.validFrom ? new Date(data.validFrom) : null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      usageCapGlobal: data.usageCapGlobal != null ? Number(data.usageCapGlobal) : null,
      usageCapPerUser: data.usageCapPerUser != null ? Number(data.usageCapPerUser) : null,
      isGlobal,
      status: needsApproval ? "pending_approval" : "active",
    });
    await AuditService.record({
      actor, action: "voucher.create", entity: "promo_code", entityId: code,
      after: { ...data, status: created.status },
    });
    return { ...created.toObject(), id: created._id.toString() };
  }

  /** Approve a pending (global/high-value) voucher → active. */
  static async approve(code: string, actor: Actor) {
    const promo = await PromoCodeModel.findOne({ code: code.toUpperCase() });
    if (!promo) throw makeError("Code not found", 404);
    if (promo.status !== "pending_approval") throw makeError("Not pending approval", 409);
    promo.status = "active";
    promo.approvedBy = actor.id;
    await promo.save();
    await AuditService.record({ actor, action: "voucher.approve", entity: "promo_code", entityId: code, after: { status: "active" } });
    return { ...promo.toObject(), id: promo._id.toString() };
  }

  /** Generate a batch of unique single-template codes. */
  static async generateBatch(template: any, count: number, actor: Actor) {
    const batchId = "batch-" + crypto.randomBytes(4).toString("hex");
    const n = Math.min(Math.max(1, Number(count) || 0), 1000);
    const docs = Array.from({ length: n }, () => ({
      code: (template.prefix ?? "HT") + crypto.randomBytes(4).toString("hex").toUpperCase(),
      title: template.title ?? "Promo",
      description: template.description ?? "",
      discountType: template.discountType ?? "fixed",
      discountValue: Number(template.discountValue) || 0,
      minSpend: Number(template.minSpend) || 0,
      usageCapPerUser: template.usageCapPerUser != null ? Number(template.usageCapPerUser) : 1,
      usageCapGlobal: 1, // unique single-use codes
      validUntil: template.validUntil ? new Date(template.validUntil) : null,
      status: "active",
      batchId,
    }));
    await PromoCodeModel.insertMany(docs);
    await AuditService.record({ actor, action: "voucher.batch_generate", entity: "promo_code", entityId: batchId, after: { count: n } });
    return { batchId, count: n, codes: docs.map((d) => d.code) };
  }

  /** Preview a voucher against a sample cart — same engine as consumer checkout. */
  static async preview(voucherData: any, sampleCart: CartLine[]) {
    const voucher = voucherData.code
      ? promoToVoucher(await PromoCodeModel.findOne({ code: voucherData.code.toUpperCase() }).lean() ?? voucherData)
      : promoToVoucher({ ...voucherData, _id: { toString: () => "preview" } });
    try {
      const breakdown = VoucherEngine.preview(voucher, { lines: sampleCart, fulfillmentMode: voucherData.fulfillmentMode });
      return { applicable: true, breakdown };
    } catch (e: any) {
      return { applicable: false, reason: e.message };
    }
  }

  /** Per-voucher performance (issued/applied/revenue proxy). */
  static async performance(code: string) {
    const promo = await PromoCodeModel.findOne({ code: code.toUpperCase() }).lean();
    if (!promo) throw makeError("Code not found", 404);
    return {
      code: promo.code,
      status: promo.status,
      usedGlobal: promo.usedGlobal,
      usageCapGlobal: promo.usageCapGlobal,
      uniqueUsers: Object.keys(promo.usedByUser ?? {}).length,
    };
  }
}
