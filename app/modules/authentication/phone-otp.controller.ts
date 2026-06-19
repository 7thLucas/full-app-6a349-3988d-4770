import type { Request, Response } from "express";
import { PhoneOtpService } from "./phone-otp.service";
import { signJwt, buildAuthCookie } from "./authentication.server";
import { ReferralService } from "~/api/domain/services/referral.service";
import { createLogger } from "~/lib/logger";

const logger = createLogger("PhoneOtp");

function jwtPayload(user: { id: string; role: any; username: string; email: string; email_verified: boolean }) {
  return {
    sub: user.id,
    role: user.role,
    username: user.username,
    email: user.email,
    email_verified: user.email_verified,
  };
}

export async function requestOtp(req: Request, res: Response): Promise<void> {
  try {
    const { phone, channel } = req.body ?? {};
    const result = await PhoneOtpService.requestOtp(String(phone ?? ""), channel === "whatsapp" ? "whatsapp" : "sms");
    res.json({
      success: true,
      message: `Code sent via ${result.channel === "whatsapp" ? "WhatsApp" : "SMS"}`,
      data: { phone: result.phone, isNewUser: result.isNewUser, devCode: result.devCode },
    });
  } catch (error: any) {
    res.status(error.statusCode ?? 500).json({ success: false, message: error.message ?? "Failed to send code" });
  }
}

export async function verifyOtp(req: Request, res: Response): Promise<void> {
  try {
    const { phone, code } = req.body ?? {};
    const { user, isNewUser } = await PhoneOtpService.verifyOtp(String(phone ?? ""), String(code ?? ""));
    const token = signJwt(jwtPayload(user));
    res.setHeader("Set-Cookie", buildAuthCookie(token, req.hostname));
    res.json({ success: true, data: { user, isNewUser } });
  } catch (error: any) {
    res.status(error.statusCode ?? 500).json({ success: false, message: error.message ?? "Verification failed" });
  }
}

export async function completeProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }
    const { name, birthday, referredBy } = req.body ?? {};

    // Attribute referral BEFORE onboarding flips (attribute requires first-timer).
    let referralWarning: string | null = null;
    if (referredBy && String(referredBy).trim()) {
      try {
        await ReferralService.attribute(req.user.id, String(referredBy).trim());
      } catch (e: any) {
        // Invalid/duplicate code must not block sign-up — surface as a warning.
        referralWarning = e?.message ?? "Referral code could not be applied";
        logger.warn(`Referral attribution skipped: ${referralWarning}`);
      }
    }

    const user = await PhoneOtpService.completeProfile(req.user.id, { name, birthday });
    res.json({ success: true, data: { user, referralWarning } });
  } catch (error: any) {
    res.status(error.statusCode ?? 500).json({ success: false, message: error.message ?? "Failed to save profile" });
  }
}
