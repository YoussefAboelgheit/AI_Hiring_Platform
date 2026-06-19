import { Router } from "express";
import {register,login,logout,refresh,getMe,} from "../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../validations/authValidators.js";
import validateResults from "../validations/validateResults.js";
import authMW from "../middlewares/authMW.js";

const router = Router();

router.post("/register", registerValidator, validateResults, register);
router.post("/login", loginValidator, validateResults, login);

router.post("/logout", logout);
router.post("/refresh", refresh);

router.get("/me", authMW, getMe);


export default router;
