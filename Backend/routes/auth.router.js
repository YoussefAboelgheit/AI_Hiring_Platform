import { Router } from "express";
import {
  register, login, logout, refresh, getMe, resetPassword,
  forgotPassword, confirmForgotPassword, verifyEmail,
  resendVerificationEmail
} from "../controllers/auth.controller.js";
import {
  registerValidator, loginValidator, resetPasswordValidator,
  forgotPasswordValidator, confirmForgotPasswordValidator,
  verifyEmailValidator, resendVerificationEmailValidator
} from "../validations/authValidators.js";
import validateResults from "../validations/validateResults.js";
import authMW from "../middlewares/authMW.js";
import { uploadFields } from "../middlewares/uploadMW.js";

const router = Router();

router.post("/register", uploadFields, registerValidator, validateResults, register);
router.post("/login", loginValidator, validateResults, login);

router.post("/logout", authMW, logout);
router.post("/refresh", refresh);

router.get("/me", authMW, getMe);

router.patch("/reset-password", authMW, resetPasswordValidator, validateResults, resetPassword);

router.post("/forgot-password", forgotPasswordValidator, validateResults, forgotPassword);
router.post("/confirm-forgot-password", confirmForgotPasswordValidator, validateResults, confirmForgotPassword);

router.post("/verify-email", verifyEmailValidator, validateResults, verifyEmail);
router.post("/resend-verification-email", resendVerificationEmailValidator, validateResults, resendVerificationEmail);

export default router;