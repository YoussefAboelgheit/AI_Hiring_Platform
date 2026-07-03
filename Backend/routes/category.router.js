import { Router } from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdParamValidator,
} from "../validations/categoryValidators.js";
import validateResults from "../validations/validateResults.js";
import authMW from "../middlewares/authMW.js";
import { authorize } from "../middlewares/authorizeMW.js";

const router = Router();


router.get("/", getAllCategories);
router.get("/:id", categoryIdParamValidator, validateResults, getCategoryById);


router.post("/", authMW, authorize("admin"), createCategoryValidator, validateResults, createCategory);
router.patch(
  "/:id",
  authMW,
  authorize("admin"),
  categoryIdParamValidator,
  updateCategoryValidator,
  validateResults,
  updateCategory
);
router.delete("/:id", authMW, authorize("admin"), categoryIdParamValidator, validateResults, deleteCategory);

export default router;