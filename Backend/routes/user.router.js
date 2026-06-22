import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { createUserValidator, updateUserValidator } from "../validations/userValidators.js";
import { idParamValidator, paginationValidator } from "../validations/paramValidators.js";
import validateResults from "../validations/validateResults.js";
import authMW from "../middlewares/authMW.js";
import { authorize } from "../middlewares/authorizeMW.js";
import { uploadFields } from "../middlewares/uploadMW.js";

const router = Router();

// Require authentication for all user endpoints
router.use(authMW);

router.get("/", authorize("admin"), paginationValidator, validateResults, getAllUsers);
router.post("/", authorize("admin"), uploadFields, createUserValidator, validateResults, createUser);

router.get("/:id", idParamValidator, validateResults, getUserById);
router.patch("/:id", uploadFields, updateUserValidator, validateResults, updateUser);
router.delete("/:id", idParamValidator, validateResults, deleteUser);

export default router;
