import { OutletModel } from "../models/outlet.model";
import { OutletService } from "./outlet.service";
import { AuditService } from "./audit.service";
import { inScope, type AdminIdentity } from "../admin/rbac";

type Actor = { id: string; admin?: AdminIdentity | null };

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

// ── OutletAdminService (Sprint 13 §14.6) ─────────────────────────────────────
// Writes outlet master data the consumer OutletService reads (DIP). Regional
// managers are scoped to their own outlet(s) for availability/hours edits.
export class OutletAdminService {
  static async list(actor: Actor) {
    const q: Record<string, any> = {};
    if (actor.admin && actor.admin.outletScope.length > 0) q._id = { $in: actor.admin.outletScope };
    const outlets = await OutletModel.find(q).lean();
    return outlets.map((o) => OutletService.toDto(o));
  }

  static async create(data: any, actor: Actor) {
    const created = await OutletModel.create({
      slug: data.slug || "outlet-" + Date.now(),
      name: data.name,
      mall: data.mall ?? data.name,
      city: data.city ?? "",
      country: data.country ?? "ID",
      region: data.region ?? "WIB",
      address: data.address ?? "",
      lat: Number(data.lat) || 0,
      lng: Number(data.lng) || 0,
      openTime: data.openTime ?? "10:00",
      closeTime: data.closeTime ?? "22:00",
      lastOrderTime: data.lastOrderTime ?? "21:30",
      prepMinutes: Number(data.prepMinutes) || 15,
      pickupEnabled: data.pickupEnabled ?? true,
    });
    await AuditService.record({ actor, action: "outlet.create", entity: "outlet", entityId: created.id, after: data });
    return OutletService.toDto(created.toObject());
  }

  static async update(id: string, patch: any, actor: Actor) {
    if (actor.admin && !inScope(actor.admin, id)) throw makeError("Outlet not in your scope", 403);
    const before = await OutletModel.findById(id).lean();
    if (!before) throw makeError("Outlet not found", 404);
    const update: any = {};
    for (const k of ["name", "mall", "city", "country", "region", "address", "openTime", "closeTime", "lastOrderTime"]) {
      if (patch[k] !== undefined) update[k] = patch[k];
    }
    if (patch.lat !== undefined) update.lat = Number(patch.lat);
    if (patch.lng !== undefined) update.lng = Number(patch.lng);
    if (patch.prepMinutes !== undefined) update.prepMinutes = Number(patch.prepMinutes);
    if (patch.pickupEnabled !== undefined) update.pickupEnabled = !!patch.pickupEnabled;
    const after = await OutletModel.findByIdAndUpdate(id, update, { new: true }).lean();
    await AuditService.record({ actor, action: "outlet.update", entity: "outlet", entityId: id, before, after });
    return OutletService.toDto(after);
  }

  /** Per-outlet sold-out ("Habis") toggle — scoped + audited. */
  static async toggleSoldOut(id: string, itemId: string, soldOut: boolean, actor: Actor) {
    if (actor.admin && !inScope(actor.admin, id)) throw makeError("Outlet not in your scope", 403);
    const outlet = await OutletModel.findById(id);
    if (!outlet) throw makeError("Outlet not found", 404);
    const before = [...(outlet.soldOutItemIds ?? [])];
    const set = new Set(before);
    if (soldOut) set.add(itemId);
    else set.delete(itemId);
    outlet.soldOutItemIds = [...set];
    await outlet.save();
    await AuditService.record({
      actor, action: "outlet.sold_out", entity: "outlet", entityId: id,
      before: { soldOutItemIds: before }, after: { soldOutItemIds: outlet.soldOutItemIds },
      reason: `${soldOut ? "Mark" : "Clear"} sold-out: ${itemId}`,
    });
    return OutletService.toDto(outlet.toObject());
  }
}
