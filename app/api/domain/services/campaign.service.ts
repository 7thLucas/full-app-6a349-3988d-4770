import crypto from "node:crypto";
import { UserModel } from "~/modules/authentication/authentication.model";
import { NotificationService } from "./notification.service";
import { LoyaltyService } from "./loyalty.service";
import { AuditService } from "./audit.service";
import type { AdminIdentity } from "../admin/rbac";

type Actor = { id: string; admin?: AdminIdentity | null };

// ── CampaignService (Sprint 11 §11.2) ────────────────────────────────────────
// Marketing campaigns over NotificationService. ConsentGate + throttling are
// built in: NotificationService.emit() already suppresses marketing for opted-out
// categories; we additionally throttle so a campaign sends at most once per user.
export class CampaignService {
  /**
   * Send a marketing campaign to a segment. Returns counts of sent vs skipped
   * (opted-out or already-received). Transactional pushes are never touched.
   */
  static async send(
    actor: Actor,
    args: { campaignId?: string; category: string; title: string; body: string; segment?: { tier?: string } },
  ) {
    const campaignId = args.campaignId || "camp-" + crypto.randomBytes(4).toString("hex");
    const users = await UserModel.find({ phone: { $ne: null }, "profile.onboarded": true });

    let sent = 0;
    let skippedConsent = 0;
    let skippedThrottle = 0;

    for (const user of users) {
      const p = LoyaltyService.ensure((user.profile ?? {}) as Record<string, any>);

      // Segment filter (e.g., target a tier).
      if (args.segment?.tier && LoyaltyService.effectiveTier(p) !== args.segment.tier) continue;

      // Throttle: skip if this user already received this campaign.
      const seen: string[] = Array.isArray(p.campaignsSeen) ? p.campaignsSeen : [];
      if (seen.includes(campaignId)) {
        skippedThrottle++;
        continue;
      }

      const record = NotificationService.emit(p, {
        type: "marketing",
        category: args.category,
        title: args.title,
        body: args.body,
        data: { campaignId },
      });

      if (!record) {
        skippedConsent++; // consent gate suppressed it
        continue;
      }
      p.campaignsSeen = [...seen, campaignId].slice(-100);
      user.profile = p;
      user.markModified("profile");
      await user.save();
      sent++;
    }

    await AuditService.record({
      actor, action: "campaign.send", entity: "campaign", entityId: campaignId,
      after: { sent, skippedConsent, skippedThrottle, segment: args.segment },
    });
    return { campaignId, sent, skippedConsent, skippedThrottle, audience: users.length };
  }
}
