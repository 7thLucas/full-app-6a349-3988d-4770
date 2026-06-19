import { OutletModel } from "../models/outlet.model";
import { MenuItemModel } from "../models/menu-item.model";
import { CategoryModel } from "../models/category.model";
import { OutletService } from "./outlet.service";
import { CATEGORIES } from "~/lib/domain.types";

const outletDto = (o: any) => OutletService.toDto(o);

/**
 * Resolve the effective price for an item at an outlet/country (Sprint 13).
 * Picks the most-specific, currently-effective override; else base price.
 */
export function resolvePrice(m: any, outlet?: any): number {
  const overrides: any[] = Array.isArray(m.priceOverrides) ? m.priceOverrides : [];
  if (!overrides.length || !outlet) return m.basePrice;
  const now = Date.now();
  const applicable = overrides
    .filter((o) => !o.effectiveFrom || new Date(o.effectiveFrom).getTime() <= now)
    .filter((o) => (o.outletId ? o.outletId === outlet._id?.toString() : true))
    .filter((o) => (o.country ? o.country === outlet.country : true));
  if (!applicable.length) return m.basePrice;
  // Most specific first: outlet match beats country-only; then latest effective.
  applicable.sort((a, b) => {
    const spec = (x: any) => (x.outletId ? 2 : x.country ? 1 : 0);
    if (spec(b) !== spec(a)) return spec(b) - spec(a);
    return new Date(b.effectiveFrom ?? 0).getTime() - new Date(a.effectiveFrom ?? 0).getTime();
  });
  return Number(applicable[0].price);
}

function itemDto(m: any, soldOut = false, outlet?: any) {
  return {
    id: m._id.toString(),
    slug: m.slug,
    name: m.name,
    description: m.description,
    category: m.category,
    basePrice: resolvePrice(m, outlet),
    imageUrl: m.imageUrl,
    tags: m.tags ?? [],
    isSignature: m.isSignature ?? false,
    available: m.available ?? true,
    soldOut,
    calories: m.calories ?? null,
    allergens: m.allergens ?? [],
    optionGroups: m.optionGroups ?? [],
    sortOrder: m.sortOrder ?? 0,
  };
}

export class CatalogService {
  static async listOutlets() {
    const outlets = await OutletModel.find().sort({ distanceKm: 1 }).lean();
    return outlets.map(outletDto);
  }

  static async getOutlet(id: string) {
    const o = await OutletModel.findById(id).lean();
    return o ? outletDto(o) : null;
  }

  /**
   * Menu for an outlet (Sprint 4): merges item master with the outlet's
   * availability matrix. Globally-unavailable items are hidden; items the
   * outlet marked sold-out are flagged `soldOut` (UI dims + disables "+").
   * With no outletId, returns the full published catalog.
   */
  static async listMenu(outletId?: string) {
    const items = await MenuItemModel.find().sort({ sortOrder: 1 }).lean();
    let soldOutSet = new Set<string>();
    let outlet: any = null;
    if (outletId) {
      outlet = await OutletModel.findById(outletId).lean();
      soldOutSet = new Set((outlet?.soldOutItemIds ?? []).map(String));
    }
    return items
      .filter((m) => (m.available ?? true) && (m.published ?? true)) // drafts hidden from consumer
      .map((m) => itemDto(m, soldOutSet.has(m._id.toString()), outlet));
  }

  static async menuForOutlet(outletId: string) {
    return CatalogService.listMenu(outletId);
  }

  /** Categories in admin-defined order; falls back to the static set. */
  static async listCategories() {
    const cats = await CategoryModel.find().sort({ sortOrder: 1 }).lean();
    if (cats.length) return cats.map((c) => ({ key: c.key, name: c.name }));
    return CATEGORIES;
  }

  static async getItem(id: string) {
    const m = await MenuItemModel.findById(id).lean();
    return m ? itemDto(m) : null;
  }

  // ── Operations Console: menu CRUD ─────────────────────────────────────────
  static async createItem(data: any) {
    const created = await MenuItemModel.create({
      slug: data.slug || `item-${Date.now()}`,
      name: data.name,
      description: data.description ?? "",
      category: data.category,
      basePrice: Number(data.basePrice) || 0,
      imageUrl: data.imageUrl ?? "",
      tags: data.tags ?? [],
      isSignature: !!data.isSignature,
      available: data.available ?? true,
      published: data.published ?? true,
      calories: data.calories ?? null,
      allergens: data.allergens ?? [],
      optionGroups: data.optionGroups ?? [],
      sortOrder: Number(data.sortOrder) || 0,
    });
    return { ...itemDto(created.toObject()), published: created.published };
  }

  static async updateItem(id: string, data: any) {
    const update: any = {};
    for (const k of ["name", "description", "category", "imageUrl", "tags", "optionGroups"]) {
      if (data[k] !== undefined) update[k] = data[k];
    }
    if (data.basePrice !== undefined) update.basePrice = Number(data.basePrice);
    if (data.isSignature !== undefined) update.isSignature = !!data.isSignature;
    if (data.available !== undefined) update.available = !!data.available;
    if (data.sortOrder !== undefined) update.sortOrder = Number(data.sortOrder);
    const updated = await MenuItemModel.findByIdAndUpdate(id, update, { new: true }).lean();
    return updated ? itemDto(updated) : null;
  }

  static async deleteItem(id: string) {
    await MenuItemModel.findByIdAndDelete(id);
    return true;
  }

  // ── Operations Console: outlet management ─────────────────────────────────
  static async updateOutlet(id: string, data: any) {
    const update: any = {};
    for (const k of ["openTime", "closeTime", "lastOrderTime", "name", "address"]) {
      if (data[k] !== undefined) update[k] = data[k];
    }
    if (data.isOpen !== undefined) update.isOpen = !!data.isOpen;
    if (data.pickupEnabled !== undefined) update.pickupEnabled = !!data.pickupEnabled;
    if (data.prepMinutes !== undefined) update.prepMinutes = Number(data.prepMinutes);
    const updated = await OutletModel.findByIdAndUpdate(id, update, { new: true }).lean();
    return updated ? outletDto(updated) : null;
  }

  static async toggleSoldOut(outletId: string, itemId: string, soldOut: boolean) {
    const outlet = await OutletModel.findById(outletId);
    if (!outlet) return null;
    const set = new Set(outlet.soldOutItemIds ?? []);
    if (soldOut) set.add(itemId);
    else set.delete(itemId);
    outlet.soldOutItemIds = [...set];
    await outlet.save();
    return outletDto(outlet.toObject());
  }
}
