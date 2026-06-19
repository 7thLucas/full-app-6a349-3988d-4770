import crypto from "node:crypto";
import { UserModel } from "./authentication.model";
import { UserRole } from "./authentication.types";
import type { PublicUser } from "./authentication.types";

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

function normalizePhone(raw: string): string {
  let p = (raw || "").replace(/[\s\-()]/g, "");
  if (p.startsWith("0")) p = "+62" + p.slice(1);
  else if (p.startsWith("62")) p = "+" + p;
  else if (!p.startsWith("+")) p = "+62" + p;
  return p;
}

function sha256(v: string): string {
  return crypto.createHash("sha256").update(v).digest("hex");
}

function genReferralCode(): string {
  return "TANG" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

function toPublicUser(user: any): PublicUser {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    email_verified: user.email_verified ?? false,
    profile: user.profile ?? {},
    createdAt: (user.createdAt as Date).toISOString(),
  };
}

export interface RequestOtpResult {
  // In production this is never returned. For the simulated flow we surface the
  // code so the user can complete the flow end-to-end without a live SMS gateway.
  devCode: string;
  channel: "sms" | "whatsapp";
  phone: string;
  isNewUser: boolean;
}

export class PhoneOtpService {
  static async requestOtp(rawPhone: string, channel: "sms" | "whatsapp"): Promise<RequestOtpResult> {
    const phone = normalizePhone(rawPhone);
    if (phone.replace(/\D/g, "").length < 10) {
      throw makeError("Please enter a valid phone number", 400);
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const codeHash = sha256(code);
    const expires = new Date(Date.now() + 5 * 60_000);

    let user = await UserModel.findOne({ phone });
    const isNewUser = !user;

    if (!user) {
      // Pre-create a shell user keyed by phone. Profile is completed after verify.
      const placeholderEmail = `${phone.replace(/\D/g, "")}@phone.hongtang.id`;
      user = await UserModel.create({
        username: `tang_${phone.replace(/\D/g, "")}`,
        email: placeholderEmail,
        password_hash: sha256(crypto.randomBytes(16).toString("hex")),
        role: UserRole.Authenticated,
        is_active: true,
        phone,
        phone_otp_token: codeHash,
        phone_otp_expires: expires,
        profile: { onboarded: false },
      });
    } else {
      user.phone_otp_token = codeHash;
      user.phone_otp_expires = expires;
      await user.save();
    }

    // Simulated delivery: log instead of calling a real SMS/WhatsApp provider.
    console.log(`[Hong Tang OTP] ${channel} → ${phone}: ${code}`);

    return { devCode: code, channel, phone, isNewUser };
  }

  static async verifyOtp(rawPhone: string, code: string): Promise<{ user: PublicUser; isNewUser: boolean }> {
    const phone = normalizePhone(rawPhone);
    const user = await UserModel.findOne({ phone });
    if (!user) throw makeError("Phone number not found. Request a new code.", 404);
    if (!user.phone_otp_token || !user.phone_otp_expires) {
      throw makeError("No active code. Request a new one.", 400);
    }
    if (new Date() > user.phone_otp_expires) {
      throw makeError("Code expired. Request a new one.", 400);
    }
    if (sha256(code.trim()) !== user.phone_otp_token) {
      throw makeError("Incorrect code. Please try again.", 400);
    }

    user.phone_otp_token = null;
    user.phone_otp_expires = null;
    const isNewUser = !user.profile?.onboarded;
    await user.save();

    return { user: toPublicUser(user), isNewUser };
  }

  static async completeProfile(
    userId: string,
    data: { name: string; birthday?: string | null; referredBy?: string | null },
  ): Promise<PublicUser> {
    const user = await UserModel.findById(userId);
    if (!user) throw makeError("User not found", 404);

    const profile = (user.profile ?? {}) as Record<string, any>;
    profile.name = data.name?.trim() || "Tang Member";
    profile.birthday = data.birthday || null;
    profile.onboarded = true;
    if (!profile.referralCode) profile.referralCode = genReferralCode();
    if (data.referredBy) profile.referredBy = data.referredBy;
    // Initialize loyalty snapshot
    if (typeof profile.crystals !== "number") profile.crystals = 0;
    if (typeof profile.bowls !== "number") profile.bowls = 0;

    user.profile = profile;
    user.markModified("profile");
    await user.save();

    return toPublicUser(user);
  }

  static normalizePhone = normalizePhone;
  static genReferralCode = genReferralCode;
}
