import crypto from "node:crypto";
import { UserModel } from "~/modules/authentication/authentication.model";
import { createLogger } from "~/lib/logger";

// ── NotificationService (Sprint 6) ───────────────────────────────────────────
// Status logic emits domain events; this service turns them into in-app records
// + a push via a PushProvider seam (Open/Closed: new types need no status-logic
// changes). Marketing categories honor per-user preferences (Sprint 10);
// transactional notifications always deliver (follow OS permission).

const logger = createLogger("Notifications");

export type NotificationType =
  | "order_received"
  | "order_preparing"
  | "order_ready"
  | "order_collected"
  | "order_cancelled"
  | "crystals_earned"
  | "tier_up"
  | "referral_reward"
  | "expiry_reminder"
  | "marketing";

// Marketing categories gated by preferences; everything else is transactional.
const MARKETING_TYPES: NotificationType[] = ["marketing"];

export interface PushPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface PushProvider {
  send(token: string, payload: PushPayload): Promise<void>;
}

// APNs/FCM stand-in: logs the delivery. Swap for a real provider in prod.
class LogPushProvider implements PushProvider {
  async send(token: string, payload: PushPayload): Promise<void> {
    logger.info(`[push] → ${token.slice(0, 12)}… ${payload.type}: ${payload.title}`);
  }
}

export const pushProvider: PushProvider = new LogPushProvider();

interface DeviceToken {
  token: string;
  platform: string;
  registeredAt: string;
}

export interface StoredNotification extends PushPayload {
  id: string;
  at: string;
  read: boolean;
}

// Default marketing categories (all on at signup; transactional unaffected).
export const MARKETING_CATEGORIES = ["new_launches", "promotions", "loyalty_news"] as const;

export class NotificationService {
  static defaultPreferences(): Record<string, boolean> {
    return Object.fromEntries(MARKETING_CATEGORIES.map((c) => [c, true]));
  }

  static async registerDevice(userId: string, token: string, platform = "unknown") {
    const user = await UserModel.findById(userId);
    if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
    const profile = (user.profile ?? {}) as Record<string, any>;
    const tokens: DeviceToken[] = Array.isArray(profile.deviceTokens) ? profile.deviceTokens : [];
    if (!tokens.some((t) => t.token === token)) {
      tokens.push({ token, platform, registeredAt: new Date().toISOString() });
    }
    profile.deviceTokens = tokens;
    user.profile = profile;
    user.markModified("profile");
    await user.save();
    return { registered: true };
  }

  static isAllowed(profile: Record<string, any>, type: NotificationType, category?: string): boolean {
    if (!MARKETING_TYPES.includes(type)) return true; // transactional always
    const prefs = (profile.notificationPreferences ?? {}) as Record<string, boolean>;
    if (category && prefs[category] === false) return false;
    // Marketing with no specific category: blocked only if all categories off.
    return Object.values(prefs).some((v) => v !== false) || Object.keys(prefs).length === 0;
  }

  /**
   * Record + push a notification for a loaded user doc. Mutates profile; the
   * caller persists (so it composes inside a single save). Returns the record
   * or null if suppressed by preferences.
   */
  static emit(
    profile: Record<string, any>,
    payload: PushPayload & { category?: string },
  ): StoredNotification | null {
    if (!NotificationService.isAllowed(profile, payload.type, payload.category)) return null;

    const record: StoredNotification = {
      id: "ntf-" + crypto.randomBytes(5).toString("hex"),
      type: payload.type,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      at: new Date().toISOString(),
      read: false,
    };
    const list: StoredNotification[] = Array.isArray(profile.notifications) ? profile.notifications : [];
    list.unshift(record);
    profile.notifications = list.slice(0, 100); // cap stored history

    // Fan out to registered devices (fire-and-forget).
    const tokens: DeviceToken[] = Array.isArray(profile.deviceTokens) ? profile.deviceTokens : [];
    for (const t of tokens) void pushProvider.send(t.token, payload);

    return record;
  }

  static async list(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
    const profile = (user.profile ?? {}) as Record<string, any>;
    return (profile.notifications as StoredNotification[]) ?? [];
  }

  static async markAllRead(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
    const profile = (user.profile ?? {}) as Record<string, any>;
    const list: StoredNotification[] = Array.isArray(profile.notifications) ? profile.notifications : [];
    for (const n of list) n.read = true;
    profile.notifications = list;
    user.profile = profile;
    user.markModified("profile");
    await user.save();
    return { updated: list.length };
  }
}
