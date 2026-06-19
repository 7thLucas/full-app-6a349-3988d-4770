import { Router } from "express";
import {
  register,
  login,
  logout,
  me,
  sendVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "./authentication.controller";
import { requireAuth } from "./authentication.middleware";
import { requestOtp, verifyOtp, completeProfile } from "./phone-otp.controller";

const router = Router();

// ── Phone-OTP (Hong Tang consumer app) ──────────────────────────────────────
router.post("/auth/otp/request", requestOtp);
router.post("/auth/otp/verify", verifyOtp);
router.post("/auth/otp/complete-profile", requireAuth, completeProfile);

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.get("/auth/me", requireAuth, me);
router.post("/auth/send-verification", requireAuth, sendVerification);
router.post("/auth/verify-email", requireAuth, verifyEmail);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);

export default router;
