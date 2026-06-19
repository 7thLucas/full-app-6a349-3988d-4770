import { UserModel } from "~/modules/authentication/authentication.model";
import { LoyaltyService } from "./loyalty.service";
import { NotificationService } from "./notification.service";
import { TIERS } from "~/lib/domain.types";
import { createLogger } from "~/lib/logger";

const logger = createLogger("LoyaltyJobs");

// Scheduled maintenance for the loyalty engine (Sprint 7). Wire to a real cron
// in production; exposed via an admin endpoint so it is runnable + testable.
export class LoyaltyJobs {
  /** Expire aged batches + fire a 7-day expiry reminder per member. */
  static async runExpirySweep() {
    const users = await UserModel.find({ "profile.crystalBatches": { $exists: true } });
    let expiredMembers = 0;
    let reminders = 0;
    for (const user of users) {
      const p = LoyaltyService.ensure((user.profile ?? {}) as Record<string, any>);
      const expired = LoyaltyService.expireSweep(p);
      const soon = LoyaltyService.expiringSoon(p);
      for (const b of soon) {
        NotificationService.emit(p, {
          type: "expiry_reminder",
          title: "Crystals expiring soon ⏳",
          body: `${b.remaining} Sugar Crystals expire on ${new Date(b.expiresAt).toLocaleDateString("id-ID")}.`,
          data: { batchId: b.id },
        });
        b.reminded = true;
        reminders++;
      }
      if (expired > 0) expiredMembers++;
      if (expired > 0 || soon.length > 0) {
        user.profile = p;
        user.markModified("profile");
        await user.save();
      }
    }
    logger.info(`Expiry sweep: ${expiredMembers} members expired crystals, ${reminders} reminders sent`);
    return { expiredMembers, reminders };
  }

  /** Month-end tier recalc — at most one-tier downgrade with advance notice. */
  static async runMonthEndRecalc() {
    const users = await UserModel.find({ "profile.tier": { $exists: true } });
    let downgraded = 0;
    for (const user of users) {
      const p = LoyaltyService.ensure((user.profile ?? {}) as Record<string, any>);
      const result = LoyaltyService.monthEndRecalc(p);
      if (result.downgraded) {
        const name = TIERS.find((t) => t.key === result.to)?.name ?? "a lower tier";
        NotificationService.emit(p, {
          type: "tier_up", // tier-change notice (reuses transactional channel)
          title: "Membership tier updated",
          body: `Your tier is now ${name}. Keep ordering to climb back up!`,
          data: { from: result.from, to: result.to },
        });
        downgraded++;
        user.profile = p;
        user.markModified("profile");
        await user.save();
      }
    }
    logger.info(`Month-end recalc: ${downgraded} members downgraded`);
    return { downgraded };
  }
}
