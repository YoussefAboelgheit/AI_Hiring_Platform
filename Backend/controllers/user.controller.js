import User from "../models/user.js";
import HTTPError from "../util/httpError.js";
import { uploadToSupabase, deleteFromSupabase } from "../util/supabaseClient.js";


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

    const userRole = role || "candidate";

    let companyLogoUrl = undefined;
    let profileImageUrl = undefined;
    let cvUrl = undefined;

    if (userRole === "hr") {
      if (req.files || req.files.company_logo) {
        const file = req.files.company_logo[0];
        companyLogoUrl = await uploadToSupabase(file.buffer, file.mimetype, "logos");
      }
    } else if (userRole === "candidate") {
      if (req.files && req.files.profile_image) {
        const imgFile = req.files.profile_image[0];
        profileImageUrl = await uploadToSupabase(imgFile.buffer, imgFile.mimetype, "avatars");
      }
      if (req.files && req.files.CV) {
        const cvFile = req.files.CV[0];
        cvUrl = await uploadToSupabase(cvFile.buffer, cvFile.mimetype, "cvs");
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      bio,
      company_logo: companyLogoUrl,
      profile_image: profileImageUrl,
      CV: cvUrl
    });

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

    if (req.user.role !== "admin" && req.user._id.toString() !== targetId) {
      return next(new HTTPError(403, "You are not authorized to update this user"));
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) return next(new HTTPError(404, "User not found"));

    const { name, email, bio } = req.body;

    const updateData = { name, email, bio };

    if (targetUser.role === "hr") {
      if (req.files && req.files.company_logo) {
        const file = req.files.company_logo[0];
        const newLogoUrl = await uploadToSupabase(file.buffer, file.mimetype, "logos");
        updateData.company_logo = newLogoUrl;
        if (targetUser.company_logo) {
          await deleteFromSupabase(targetUser.company_logo);
        }
      }
    } else if (targetUser.role === "candidate") {
      if (req.files && req.files.profile_image) {
        const imgFile = req.files.profile_image[0];
        const newProfileImageUrl = await uploadToSupabase(imgFile.buffer, imgFile.mimetype, "avatars");
        updateData.profile_image = newProfileImageUrl;
        if (targetUser.profile_image) {
          await deleteFromSupabase(targetUser.profile_image);
        }
      }
      if (req.files && req.files.CV) {
        const cvFile = req.files.CV[0];
        const newCvUrl = await uploadToSupabase(cvFile.buffer, cvFile.mimetype, "cvs");
        updateData.CV = newCvUrl;
        if (targetUser.CV) {
          await deleteFromSupabase(targetUser.CV);
        }
      }
    }

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

