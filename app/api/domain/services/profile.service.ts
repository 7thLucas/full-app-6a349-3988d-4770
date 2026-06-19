import crypto from "node:crypto";
import { UserModel } from "~/modules/authentication/authentication.model";
import { LoyaltyService } from "./loyalty.service";
import { NotificationService, MARKETING_CATEGORIES } from "./notification.service";
import { memberSnapshot } from "./member.service";

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

function loadProfile(user: any) {
  const p = LoyaltyService.ensure((user.profile ?? {}) as Record<string, any>);
  if (!Array.isArray(p.addresses)) p.addresses = [];
  if (!Array.isArray(p.paymentMethods)) p.paymentMethods = [];
  if (!p.notificationPreferences) p.notificationPreferences = NotificationService.defaultPreferences();
  return p;
}

async function save(user: any, p: Record<string, any>) {
  user.profile = p;
  user.markModified("profile");
  await user.save();
}

// ── ProfileService / PreferenceService / AccountDeletionService (Sprint 10) ──
export class ProfileService {
  /** Edit identity fields (name, birthday, gender, email, photo, contact). */
  static async updateProfile(
    userId: string,
    data: Partial<{ name: string; birthday: string | null; gender: string; email: string; photoUrl: string }>,
  ) {
    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);
    const p = loadProfile(user);
    if (data.name !== undefined) p.name = String(data.name).trim() || p.name;
    if (data.birthday !== undefined) p.birthday = data.birthday || null;
    if (data.gender !== undefined) p.gender = data.gender;
    if (data.photoUrl !== undefined) p.photoUrl = data.photoUrl;
    if (data.email !== undefined && data.email) {
      user.email = String(data.email).toLowerCase().trim();
    }
    await save(user, p);
    return memberSnapshot(user);
  }

  // ── Saved addresses ─────────────────────────────────────────────────────────
  static async addAddress(userId: string, address: any) {
    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);
    const p = loadProfile(user);
    const entry = {
      id: "addr-" + crypto.randomBytes(4).toString("hex"),
      label: address.label ?? "Address",
      line: address.line ?? "",
      notes: address.notes ?? "",
      lat: address.lat ?? null,
      lng: address.lng ?? null,
    };
    p.addresses.push(entry);
    await save(user, p);
    return p.addresses;
  }

  static async updateAddress(userId: string, addressId: string, patch: any) {
    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);
    const p = loadProfile(user);
    const a = p.addresses.find((x: any) => x.id === addressId);
    if (!a) throw makeError("Address not found", 404);
    Object.assign(a, { label: patch.label ?? a.label, line: patch.line ?? a.line, notes: patch.notes ?? a.notes });
    await save(user, p);
    return p.addresses;
  }

  static async deleteAddress(userId: string, addressId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);
    const p = loadProfile(user);
    p.addresses = p.addresses.filter((x: any) => x.id !== addressId);
    await save(user, p);
    return p.addresses;
  }

  // ── Payment methods (TOKENS ONLY — never store PAN) ─────────────────────────
  static async addPaymentMethod(userId: string, data: any) {
    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);
    const p = loadProfile(user);
    const pan = String(data.cardNumber ?? data.pan ?? "");
    const entry = {
      id: "pm-" + crypto.randomBytes(4).toString("hex"),
      brand: data.brand ?? "card",
      // Display last-4 only; the gateway returns an opaque token. No PAN stored.
      last4: pan ? pan.replace(/\D/g, "").slice(-4) : (data.last4 ?? "0000"),
      token: data.token ?? "tok_" + crypto.randomBytes(8).toString("hex"),
    };
    p.paymentMethods.push(entry);
    await save(user, p);
    return p.paymentMethods;
  }

  static async deletePaymentMethod(userId: string, methodId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);
    const p = loadProfile(user);
    p.paymentMethods = p.paymentMethods.filter((x: any) => x.id !== methodId);
    await save(user, p);
    return p.paymentMethods;
  }
}

export class PreferenceService {
  /** Toggle per-category marketing preferences (transactional unaffected). */
  static async update(userId: string, prefs: Record<string, boolean>) {
    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);
    const p = loadProfile(user);
    const next = { ...p.notificationPreferences };
    for (const cat of MARKETING_CATEGORIES) {
      if (typeof prefs[cat] === "boolean") next[cat] = prefs[cat];
    }
    p.notificationPreferences = next;
    await save(user, p);
    return next;
  }
}

export class AccountDeletionService {
  /** File a UU PDP deletion request (queued; consumed by admin Sprint 14). */
  static async request(userId: string, reason?: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);
    const p = loadProfile(user);
    p.deletionRequested = true;
    p.deletionRequestedAt = new Date().toISOString();
    p.deletionReason = reason ?? null;
    await save(user, p);
    return { requested: true, at: p.deletionRequestedAt };
  }
}
