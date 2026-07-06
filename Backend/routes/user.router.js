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

const parseFormDataArrays = (req, res, next) => {
  const fields = ["skills", "education", "attachments"];
  for (const field of fields) {
    if (req.body[field] && typeof req.body[field] === "string") {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch {
        // leave as is, validator will catch it
      }
    }
  }
  next();
};

router.use(authMW);

router.get("/", authorize("admin"), paginationValidator, validateResults, getAllUsers);
router.post("/", authorize("admin"), uploadFields, parseFormDataArrays, createUserValidator, validateResults, createUser);
router.get("/:id", idParamValidator, validateResults, getUserById);
router.patch("/:id", uploadFields, parseFormDataArrays, idParamValidator, updateUserValidator, validateResults, updateUser);
router.delete("/:id", idParamValidator, validateResults, deleteUser);

export default router;