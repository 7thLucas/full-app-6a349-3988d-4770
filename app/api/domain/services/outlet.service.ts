import { OutletModel } from "../models/outlet.model";

// OutletService (SRP) — open/closed + last-order logic and distance ranking,
// isolated so checkout (Sprint 5) and admin (Sprint 13) reuse one source of truth.

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

// Minutes since midnight for an "HH:MM" string.
function toMinutes(hhmm: string): number {
  const [h, m] = (hhmm || "0:0").split(":").map((n) => parseInt(n, 10) || 0);
  return h * 60 + m;
}

// Current wall-clock minutes in an outlet's timezone (defaults WIB / UTC+7).
function nowMinutesInTz(offsetHours: number, now: Date): number {
  const utcMin = now.getUTCHours() * 60 + now.getUTCMinutes();
  return (((utcMin + offsetHours * 60) % 1440) + 1440) % 1440;
}

// Indonesian region → UTC offset. WIB +7, WITA +8, WIT +9.
function tzOffset(o: any): number {
  switch ((o.timezone || o.region || "WIB").toUpperCase()) {
    case "WITA":
      return 8;
    case "WIT":
      return 9;
    default:
      return 7;
  }
}

export interface OpenState {
  isOpen: boolean; // within open–close hours right now
  acceptingOrders: boolean; // open AND pickup enabled AND before last-order cutoff
}

// Haversine distance in km between two lat/lng points.
function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

export class OutletService {
  /** Compute open/accepting state from hours + last-order cutoff for `now`. */
  static isOpenNow(o: any, now: Date = new Date()): OpenState {
    const cur = nowMinutesInTz(tzOffset(o), now);
    const open = toMinutes(o.openTime);
    let close = toMinutes(o.closeTime);
    if (close <= open) close += 1440; // past-midnight close
    const curAdj = cur < open ? cur + 1440 : cur;

    const isOpen = curAdj >= open && curAdj < close;
    const lastOrder = o.lastOrderTime ? toMinutes(o.lastOrderTime) : close;
    const lastOrderAdj = lastOrder <= open ? lastOrder + 1440 : lastOrder;
    const beforeCutoff = curAdj < lastOrderAdj;

    return {
      isOpen,
      acceptingOrders: isOpen && !!o.pickupEnabled && beforeCutoff,
    };
  }

  static toDto(o: any, opts: { lat?: number; lng?: number; now?: Date } = {}) {
    const state = OutletService.isOpenNow(o, opts.now ?? new Date());
    const distanceKm =
      opts.lat != null && opts.lng != null
        ? haversineKm(opts.lat, opts.lng, o.lat ?? 0, o.lng ?? 0)
        : o.distanceKm;
    return {
      id: o._id.toString(),
      slug: o.slug,
      name: o.name,
      mall: o.mall,
      city: o.city,
      address: o.address,
      distanceKm,
      openTime: o.openTime,
      closeTime: o.closeTime,
      lastOrderTime: o.lastOrderTime,
      prepMinutes: o.prepMinutes,
      isOpen: state.isOpen, // computed, not the stored manual flag
      acceptingOrders: state.acceptingOrders,
      pickupEnabled: o.pickupEnabled,
      lat: o.lat,
      lng: o.lng,
      soldOutItemIds: o.soldOutItemIds ?? [],
    };
  }

  /** List outlets, optionally scoped by country and ranked by distance. */
  static async list(opts: { country?: string; lat?: number; lng?: number } = {}) {
    const query: Record<string, any> = {};
    if (opts.country) query.country = opts.country;
    const outlets = await OutletModel.find(query).lean();
    const now = new Date();
    const dtos = outlets.map((o) => OutletService.toDto(o, { lat: opts.lat, lng: opts.lng, now }));
    dtos.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    return dtos;
  }

  static async getById(id: string) {
    const o = await OutletModel.findById(id).lean();
    return o ? OutletService.toDto(o) : null;
  }

  /** Throw if the outlet cannot accept a pickup order right now. */
  static async assertAcceptingOrders(id: string) {
    const o = await OutletModel.findById(id).lean();
    if (!o) throw makeError("Outlet not found", 404);
    const state = OutletService.isOpenNow(o);
    if (!o.pickupEnabled) throw makeError("This outlet is not accepting pickup orders", 409);
    if (!state.isOpen) throw makeError("This outlet is closed right now", 409);
    if (!state.acceptingOrders) throw makeError("Past last-order time for this outlet", 409);
    return o;
  }
}
