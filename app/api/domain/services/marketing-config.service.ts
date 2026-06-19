import { MarketingConfigModel } from "../models/marketing-config.model";

// Defaults mirror the original hardcoded welcome/referral behaviour so existing
// flows are unchanged until an admin edits them.
const DEFAULT_WELCOME = [
  {
    title: "Welcome Treat — Rp 15.000 Off",
    description: "A warm welcome to Loyal-Tang. Rp 15.000 off your first order.",
    discountType: "fixed",
    discountValue: 15000,
    minSpend: 30000,
    validDays: 30,
    source: "welcome",
  },
];

const DEFAULT_REFERRAL = {
  refereeReward: {
    title: "Referred Friend — 20% Off",
    description: "Welcome via a friend! 20% off your first order.",
    discountType: "percent",
    discountValue: 20,
    minSpend: 35000,
    validDays: 30,
    source: "referral",
  },
  referrerReward: {
    title: "Thanks for Sharing — Free Dessert",
    description: "Your friend joined Hong Tang. Enjoy a free signature dessert.",
    discountType: "fixed",
    discountValue: 42000,
    minSpend: 42000,
    validDays: 45,
    source: "referral",
  },
  perUserRewardCap: 20,
  dailyVelocityCap: 5,
  selfReferralBlock: true,
};

export class MarketingConfigService {
  static async ensure() {
    let doc = await MarketingConfigModel.findOne({ key: "default" });
    if (!doc) {
      doc = await MarketingConfigModel.create({
        key: "default",
        welcomeOffer: DEFAULT_WELCOME,
        referral: DEFAULT_REFERRAL,
      });
    }
    return doc;
  }

  static async welcomeOffer() {
    const doc = await MarketingConfigService.ensure();
    return doc.welcomeOffer ?? DEFAULT_WELCOME;
  }

  static async referral() {
    const doc = await MarketingConfigService.ensure();
    return doc.referral ?? DEFAULT_REFERRAL;
  }

  static async updateWelcome(offer: any[], actorId: string) {
    const doc = await MarketingConfigService.ensure();
    const before = doc.welcomeOffer;
    doc.versions = [...(doc.versions ?? []), { at: new Date().toISOString(), by: actorId, welcomeOffer: before }].slice(-50);
    doc.welcomeOffer = offer;
    await doc.save();
    return { before, after: offer };
  }

  static async updateReferral(patch: any, actorId: string) {
    const doc = await MarketingConfigService.ensure();
    const before = doc.referral;
    doc.versions = [...(doc.versions ?? []), { at: new Date().toISOString(), by: actorId, referral: before }].slice(-50);
    doc.referral = { ...(before ?? DEFAULT_REFERRAL), ...patch };
    await doc.save();
    return { before, after: doc.referral };
  }
}
