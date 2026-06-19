import User from "../models/user.js";
import Enrollment from "../models/enrollment.js";
import HTTPError from "../util/httpError.js";


export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password")
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments();
    const pages = Math.ceil(total / limit);

    return res.status(200).json({
      total,
      page,
      pages,
      users,
    });
  } catch (err) {
    next(err);
  }
};


export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return next(new HTTPError(404, "User not found"));

    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};


export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, bio } = req.body;

    const user = await User.create({ name, email, password, role, bio });

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({
      message: "User created successfully",
      user: userObj,
    });
  } catch (err) {
    next(err);
  }
};


export const updateUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const { name, email, bio } = req.body;

    const updateData = { name, email, bio };
    if (req.user.role === "admin" && req.body.role) {
      updateData.role = req.body.role;
    }

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const user = await User.findByIdAndUpdate(
      targetId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return next(new HTTPError(404, "User not found"));

    return res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
};


export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new HTTPError(404, "User not found"));

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};


export const getUserEnrollments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const enrollments = await Enrollment.find({ student: req.params.id })
      .populate("course", "title description category thumbnail averageRating instructor")
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Enrollment.countDocuments({ student: req.params.id });
    const pages = Math.ceil(total / limit);

    return res.status(200).json({ total, page, pages, enrollments });
  } catch (err) {
    next(err);
  }
};
