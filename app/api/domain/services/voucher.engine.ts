import { breakdown } from "~/lib/price";
import type { Voucher } from "~/lib/domain.types";

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

// Minimal priced-line shape the engine needs (CartLine and server ResolvedLine
// both satisfy it). category is optional — used for category-eligible vouchers.
export interface VoucherLine {
  itemId: string;
  unitPrice: number;
  quantity: number;
  category?: string;
}

// ── VoucherEngine (Sprint 8) — single source for voucher validation + math ────
// Enforces expiry, min spend, fulfillment mode, and item/category eligibility.
// One voucher per order (no stacking) is enforced by the caller replacing the
// applied voucher. Reused by checkout and admin preview (Sprint 13).

export interface CartContext {
  lines: VoucherLine[];
  fulfillmentMode?: "pickup" | "delivery";
}

export class VoucherEngine {
  /** Subtotal of lines this voucher is eligible against (for min-spend + discount). */
  static eligibleSubtotal(voucher: Voucher, lines: VoucherLine[]): number {
    const items = voucher.eligibleItemIds ?? [];
    const cats = voucher.eligibleCategories ?? [];
    if (items.length === 0 && cats.length === 0) {
      return lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    }
    return lines
      .filter((l) => items.includes(l.itemId) || (!!l.category && cats.includes(l.category as any)))
      .reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  }

  /** Throw with a human reason if the voucher cannot apply to this cart. */
  static assertApplicable(voucher: Voucher, ctx: CartContext): void {
    if (voucher.used) throw makeError("This voucher has already been used", 400);
    if (new Date(voucher.expiresAt) < new Date()) throw makeError("This code has expired", 400);

    if (voucher.fulfillmentModes?.length && ctx.fulfillmentMode) {
      if (!voucher.fulfillmentModes.includes(ctx.fulfillmentMode)) {
        throw makeError(`Not valid for ${ctx.fulfillmentMode} orders`, 400);
      }
    }

    const eligible = VoucherEngine.eligibleSubtotal(voucher, ctx.lines);
    if (eligible <= 0) throw makeError("No eligible items for this voucher", 400);
    if (eligible < voucher.minSpend) {
      throw makeError(`Minimum spend Rp ${voucher.minSpend.toLocaleString("id-ID")} required`, 400);
    }
  }

  /** Discount amount this voucher yields against the cart. */
  static discount(voucher: Voucher, lines: VoucherLine[]): number {
    const eligible = VoucherEngine.eligibleSubtotal(voucher, lines);
    if (eligible < voucher.minSpend) return 0;
    if (voucher.discountType === "percent") return Math.round((eligible * voucher.discountValue) / 100);
    if (voucher.discountType === "fixed") return Math.min(voucher.discountValue, eligible);
    if (voucher.discountType === "bogo") {
      const pool = lines.filter((l) => {
        const items = voucher.eligibleItemIds ?? [];
        const cats = voucher.eligibleCategories ?? [];
        return items.length + cats.length === 0 || items.includes(l.itemId) || (!!l.category && cats.includes(l.category as any));
      });
      return pool.length ? Math.min(...pool.map((l) => l.unitPrice)) : 0;
    }
    return 0;
  }

  /** Full price breakdown with the voucher applied (preview/use). */
  static preview(voucher: Voucher | null, ctx: CartContext) {
    const subtotal = ctx.lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    if (!voucher) return breakdown(subtotal, 0);
    VoucherEngine.assertApplicable(voucher, ctx);
    return breakdown(subtotal, VoucherEngine.discount(voucher, ctx.lines));
  }
}
