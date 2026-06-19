import { BannerModel } from "../models/banner.model";
import { OutletModel } from "../models/outlet.model";
import { OrderModel } from "../models/order.model";
import { UserModel } from "~/modules/authentication/authentication.model";
import { AuditService } from "./audit.service";
import { LoyaltyService } from "./loyalty.service";
import type { AdminIdentity } from "../admin/rbac";

type Actor = { id: string; admin?: AdminIdentity | null };

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

function bannerDto(b: any) {
  return {
    id: b._id.toString(),
    title: b.title,
    imageUrl: b.imageUrl,
    caption: b.caption,
    deepLink: b.deepLink,
    priority: b.priority,
  };
}

function greeting(now: Date): string {
  const h = (now.getUTCHours() + 7) % 24; // WIB
  if (h < 11) return "Good morning";
  if (h < 15) return "Good afternoon";
  if (h < 19) return "Good evening";
  return "Good night";
}

// ── MerchandisingService (Sprint 11) ─────────────────────────────────────────
export class MerchandisingService {
  /** Active banners: within schedule window, country-scoped, priority-ordered. */
  static async activeBanners(country?: string, now: Date = new Date()) {
    const banners = await BannerModel.find({ enabled: true }).sort({ priority: -1 }).lean();
    return banners
      .filter((b) => !b.startAt || new Date(b.startAt) <= now)
      .filter((b) => !b.endAt || new Date(b.endAt) >= now)
      .filter((b) => !b.country || !country || b.country === country)
      .map(bannerDto);
  }

  /** Home payload: greeting + banners + core actions + personalized strip. */
  static async home(userId: string | null, country = "ID") {
    const now = new Date();
    const banners = await MerchandisingService.activeBanners(country, now);

    const deliveryOutlets = await OutletModel.countDocuments({ deliveryEnabled: true });
    const coreActions = {
      pickup: true,
      delivery: deliveryOutlets > 0, // Home collapses to pickup-only when false
    };

    let personalized: { recentItems: any[]; loyalty: any } = { recentItems: [], loyalty: null };
    let firstRun = true;
    if (userId) {
      const user = await UserModel.findById(userId);
      if (user) {
        const p = LoyaltyService.ensure((user.profile ?? {}) as Record<string, any>);
        const recent = await OrderModel.find({ userId }).sort({ createdAt: -1 }).limit(5).lean();
        firstRun = recent.length === 0;
        // Most-recent lines as reorder chips (with last-used customization).
        const seen = new Set<string>();
        const recentItems: any[] = [];
        for (const o of recent) {
          for (const l of o.lines ?? []) {
            if (seen.has(l.itemId)) continue;
            seen.add(l.itemId);
            recentItems.push({ itemId: l.itemId, name: l.name, imageUrl: l.imageUrl, unitPrice: l.unitPrice, options: l.options });
          }
        }
        personalized = {
          recentItems: recentItems.slice(0, 8),
          loyalty: { crystals: LoyaltyService.balance(p), bowls: LoyaltyService.bowlsWindow(p), tier: LoyaltyService.effectiveTier(p) },
        };
      }
    }

    return {
      greeting: greeting(now),
      banners,
      coreActions,
      personalized,
      firstRun,
      promoRows: [{ key: "bestsellers", title: "Bestsellers" }, { key: "new", title: "New & Seasonal" }],
    };
  }

  // ── Admin banner CMS ────────────────────────────────────────────────────────
  static async list() {
    const banners = await BannerModel.find().sort({ priority: -1 }).lean();
    return banners.map((b) => ({ ...b, id: b._id.toString() }));
  }

  static async create(data: any, actor: Actor) {
    const created = await BannerModel.create({
      title: data.title,
      imageUrl: data.imageUrl ?? "",
      caption: data.caption ?? "",
      deepLink: data.deepLink ?? "",
      priority: Number(data.priority) || 0,
      startAt: data.startAt ? new Date(data.startAt) : null,
      endAt: data.endAt ? new Date(data.endAt) : null,
      country: data.country ?? null,
      enabled: data.enabled ?? true,
    });
    await AuditService.record({ actor, action: "banner.create", entity: "banner", entityId: created.id, after: data });
    return { ...created.toObject(), id: created.id };
  }

  static async update(id: string, patch: any, actor: Actor) {
    const before = await BannerModel.findById(id).lean();
    if (!before) throw makeError("Banner not found", 404);
    const update: any = {};
    for (const k of ["title", "imageUrl", "caption", "deepLink", "country"]) if (patch[k] !== undefined) update[k] = patch[k];
    if (patch.priority !== undefined) update.priority = Number(patch.priority);
    if (patch.startAt !== undefined) update.startAt = patch.startAt ? new Date(patch.startAt) : null;
    if (patch.endAt !== undefined) update.endAt = patch.endAt ? new Date(patch.endAt) : null;
    if (patch.enabled !== undefined) update.enabled = !!patch.enabled;
    const after = await BannerModel.findByIdAndUpdate(id, update, { new: true }).lean();
    await AuditService.record({ actor, action: "banner.update", entity: "banner", entityId: id, before, after });
    return { ...after, id };
  }

  static async remove(id: string, actor: Actor) {
    const before = await BannerModel.findById(id).lean();
    if (!before) throw makeError("Banner not found", 404);
    await BannerModel.findByIdAndDelete(id);
    await AuditService.record({ actor, action: "banner.delete", entity: "banner", entityId: id, before });
    return { deleted: true };
  }
}
