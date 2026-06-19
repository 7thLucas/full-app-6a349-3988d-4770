// PriceCalculator + TaxCalculator — single source of truth for money math.
// Pure, client-safe (no mongoose/typegoose). Reused by:
//  - product detail live CTA (Sprint 4)
//  - cart/checkout totals (Sprint 5)
//  - loyalty net-spend accrual (Sprint 7)
// Server-side checkout re-derives unit prices from the catalog using this module
// so client-sent totals are never trusted (PRD §10.6 / Sprint 5 verification).

import type { OptionGroup, SelectedOption } from "./domain.types";

export const PB1_RATE = 0.1; // Indonesian restaurant tax (PB1) 10%

/** Sum of surcharges for a set of selected options. */
export function optionsSurcharge(options: { priceDelta: number }[]): number {
  return options.reduce((s, o) => s + (Number(o.priceDelta) || 0), 0);
}

/** Unit price = base + sum(option surcharges). Never negative. */
export function unitPrice(basePrice: number, options: { priceDelta: number }[]): number {
  return Math.max(0, Math.round((Number(basePrice) || 0) + optionsSurcharge(options)));
}

/** Line total = unitPrice × quantity. */
export function lineTotal(
  basePrice: number,
  options: { priceDelta: number }[],
  quantity: number,
): number {
  const qty = Math.max(0, Math.floor(Number(quantity) || 0));
  return unitPrice(basePrice, options) * qty;
}

/** PB1 tax over a (post-discount) net amount, rounded to whole IDR. */
export function pb1Tax(netAmount: number): number {
  return Math.round(Math.max(0, netAmount) * PB1_RATE);
}

export interface PriceBreakdown {
  subtotal: number;
  discount: number;
  netSpend: number; // subtotal − discount, pre-tax; basis for Crystal accrual
  tax: number;
  total: number;
}

/** Compose a full breakdown from a subtotal + already-resolved discount. */
export function breakdown(subtotal: number, discount: number): PriceBreakdown {
  const sub = Math.max(0, Math.round(subtotal));
  const disc = Math.min(Math.max(0, Math.round(discount)), sub);
  const netSpend = sub - disc;
  const tax = pb1Tax(netSpend);
  return { subtotal: sub, discount: disc, netSpend, tax, total: netSpend + tax };
}

/**
 * Resolve the authoritative surcharge for client-selected options against the
 * item's real option groups. Validates required/min/max and rejects unknown
 * choices — the server uses this so a tampered priceDelta cannot stick.
 * Returns the canonical SelectedOption[] (with server-side priceDelta/labels).
 */
export function resolveOptions(
  optionGroups: OptionGroup[],
  selected: { groupId: string; choiceId: string }[],
): SelectedOption[] {
  const groups = Array.isArray(optionGroups) ? optionGroups : [];
  const resolved: SelectedOption[] = [];

  for (const group of groups) {
    const picks = selected.filter((s) => s.groupId === group.id);
    if (group.required && picks.length < Math.max(1, group.min ?? 1)) {
      throw priceError(`Please choose ${group.name}`);
    }
    if (group.max && picks.length > group.max) {
      throw priceError(`Select at most ${group.max} for ${group.name}`);
    }
    for (const pick of picks) {
      const choice = group.choices.find((c) => c.id === pick.choiceId);
      if (!choice) throw priceError(`Invalid option for ${group.name}`);
      resolved.push({
        groupId: group.id,
        groupName: group.name,
        choiceId: choice.id,
        choiceLabel: choice.label,
        priceDelta: choice.priceDelta,
      });
    }
  }
  return resolved;
}

function priceError(message: string): Error {
  return Object.assign(new Error(message), { statusCode: 400 });
}
