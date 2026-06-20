import { Router } from "express";
import {register,login,logout,refresh,getMe,resetPassword} from "../controllers/auth.controller.js";
import { registerValidator, loginValidator, resetPasswordValidator } from "../validations/authValidators.js";
import validateResults from "../validations/validateResults.js";
import authMW from "../middlewares/authMW.js";
import { uploadFields } from "../middlewares/uploadMW.js";

const router = Router();

router.post("/register", uploadFields, registerValidator, validateResults, register);
router.post("/login", loginValidator, validateResults, login);

router.post("/logout", logout);
router.post("/refresh", refresh);

router.get("/me", authMW, getMe);

router.patch("/reset-password", authMW, resetPasswordValidator, validateResults, resetPassword);


export default router;
