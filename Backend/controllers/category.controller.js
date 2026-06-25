import Category from "../models/category.js";
import Job from "../models/job.js";
import HTTPError from "../util/httpError.js";

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.status(200).json({ categories });
  } catch (err) {
    next(err);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new HTTPError(404, "Category not found"));

    return res.status(200).json({ category });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create({ name: req.body.name });

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true, runValidators: true }
    );

    if (!category) return next(new HTTPError(404, "Category not found"));

    return res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new HTTPError(404, "Category not found"));

   
    await Job.updateMany({ category: category._id }, { $set: { category: null } });

    await category.deleteOne();

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    next(err);
  }
};