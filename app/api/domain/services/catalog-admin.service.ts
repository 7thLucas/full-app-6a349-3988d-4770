import { MenuItemModel } from "../models/menu-item.model";
import { CategoryModel } from "../models/category.model";
import { CatalogService } from "./catalog.service";
import { AuditService } from "./audit.service";
import { CATEGORIES } from "~/lib/domain.types";
import type { AdminIdentity } from "../admin/rbac";

type Actor = { id: string; admin?: AdminIdentity | null };

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

// ── CatalogAdminService (Sprint 13 §14.5) ────────────────────────────────────
// Writes the config the consumer CatalogService reads (DIP). All audited.
export class CatalogAdminService {
  static async listItems() {
    const items = await MenuItemModel.find().sort({ sortOrder: 1 }).lean();
    return items.map((m) => ({ ...m, id: m._id.toString() }));
  }

  static async createItem(data: any, actor: Actor) {
    const created = await CatalogService.createItem({ ...data, published: data.published ?? false });
    await AuditService.record({ actor, action: "catalog.item.create", entity: "menu_item", entityId: created.id, after: data });
    return created;
  }

  static async updateItem(id: string, patch: any, actor: Actor) {
    const before = await MenuItemModel.findById(id).lean();
    if (!before) throw makeError("Item not found", 404);
    const update: any = {};
    for (const k of ["name", "description", "category", "imageUrl", "tags", "optionGroups", "calories", "allergens"]) {
      if (patch[k] !== undefined) update[k] = patch[k];
    }
    if (patch.basePrice !== undefined) update.basePrice = Number(patch.basePrice);
    if (patch.isSignature !== undefined) update.isSignature = !!patch.isSignature;
    if (patch.available !== undefined) update.available = !!patch.available;
    if (patch.published !== undefined) update.published = !!patch.published;
    if (patch.sortOrder !== undefined) update.sortOrder = Number(patch.sortOrder);
    const after = await MenuItemModel.findByIdAndUpdate(id, update, { new: true }).lean();
    await AuditService.record({ actor, action: "catalog.item.update", entity: "menu_item", entityId: id, before, after });
    return { ...after, id };
  }

  static async publish(id: string, published: boolean, actor: Actor) {
    const before = await MenuItemModel.findById(id).lean();
    if (!before) throw makeError("Item not found", 404);
    const after = await MenuItemModel.findByIdAndUpdate(id, { published }, { new: true }).lean();
    await AuditService.record({
      actor, action: published ? "catalog.item.publish" : "catalog.item.unpublish",
      entity: "menu_item", entityId: id, before: { published: before.published }, after: { published },
    });
    return { ...after, id };
  }

  /** Add/replace an effective-dated per-outlet/country price override. */
  static async setPriceOverride(id: string, override: any, actor: Actor) {
    const item = await MenuItemModel.findById(id);
    if (!item) throw makeError("Item not found", 404);
    const before = [...(item.priceOverrides ?? [])];
    const entry = {
      outletId: override.outletId ?? null,
      country: override.country ?? null,
      price: Number(override.price),
      effectiveFrom: override.effectiveFrom ?? new Date().toISOString(),
    };
    item.priceOverrides = [...before, entry];
    await item.save();
    await AuditService.record({
      actor, action: "catalog.item.price_override", entity: "menu_item", entityId: id,
      before: { priceOverrides: before }, after: { priceOverrides: item.priceOverrides },
    });
    return { id, priceOverrides: item.priceOverrides };
  }

  static async deleteItem(id: string, actor: Actor) {
    const before = await MenuItemModel.findById(id).lean();
    if (!before) throw makeError("Item not found", 404);
    await MenuItemModel.findByIdAndDelete(id);
    await AuditService.record({ actor, action: "catalog.item.delete", entity: "menu_item", entityId: id, before });
    return { deleted: true };
  }

  // ── Categories ──────────────────────────────────────────────────────────────
  static async seedCategories() {
    if ((await CategoryModel.countDocuments()) > 0) return;
    await CategoryModel.insertMany(CATEGORIES.map((c, i) => ({ key: c.key, name: c.name, sortOrder: i })));
  }

  static async listCategories() {
    return CatalogService.listCategories();
  }

  static async createCategory(data: any, actor: Actor) {
    const count = await CategoryModel.countDocuments();
    const created = await CategoryModel.create({ key: data.key, name: data.name, sortOrder: data.sortOrder ?? count });
    await AuditService.record({ actor, action: "catalog.category.create", entity: "category", entityId: data.key, after: data });
    return created.toObject();
  }

  /** Reorder categories — drives the consumer Menu pill bar order. */
  static async reorderCategories(orderedKeys: string[], actor: Actor) {
    const before = await CategoryModel.find().sort({ sortOrder: 1 }).lean();
    await Promise.all(orderedKeys.map((key, i) => CategoryModel.updateOne({ key }, { sortOrder: i })));
    const after = await CategoryModel.find().sort({ sortOrder: 1 }).lean();
    await AuditService.record({
      actor, action: "catalog.category.reorder", entity: "category", entityId: null,
      before: before.map((c) => c.key), after: after.map((c) => c.key),
    });
    return after.map((c) => ({ key: c.key, name: c.name }));
  }
}
