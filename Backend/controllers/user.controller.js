import User from "../models/user.js";
import Job from "../models/job.js";
import JobApplication, { JOB_DELETED_APPLICATION_STATUS } from "../models/jobApplication.js";
import HTTPError from "../util/httpError.js";
import { uploadToSupabase, deleteFromSupabase } from "../util/supabaseClient.js";

function createJobSnapshot(job) {
  const jobObject = typeof job.toObject === "function" ? job.toObject() : job;
  const { __v, ...snapshot } = jobObject;
  return snapshot;
}

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

    let companyLogoUrl  = "";
    let profileImageUrl = "";
    let cvUrl           = "";

    if (userRole === "hr") {
      if (req.files?.company_logo?.[0]) {
        const file = req.files.company_logo[0];
        companyLogoUrl = await uploadToSupabase(file.buffer, file.mimetype, "logos");
      }
    } else if (userRole === "candidate") {
      if (req.files?.profile_image?.[0]) {
        const imgFile   = req.files.profile_image[0];
        profileImageUrl = await uploadToSupabase(imgFile.buffer, imgFile.mimetype, "avatars");
      }
      if (req.files?.CV?.[0]) {
        const cvFile = req.files.CV[0];
        cvUrl        = await uploadToSupabase(cvFile.buffer, cvFile.mimetype, "cvs");
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role:          userRole,
      bio,
      company_logo:  companyLogoUrl,
      profile_image: profileImageUrl,
      CV:            cvUrl,
      isVerified:    true, // admin-created users skip email verification
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
      if (req.files?.company_logo?.[0]) {
        const file        = req.files.company_logo[0];
        const newLogoUrl  = await uploadToSupabase(file.buffer, file.mimetype, "logos");
        updateData.company_logo = newLogoUrl;
        if (targetUser.company_logo) {
          await deleteFromSupabase(targetUser.company_logo);
        }
      }
    } else if (targetUser.role === "candidate") {
      if (req.files?.profile_image?.[0]) {
        const imgFile           = req.files.profile_image[0];
        const newProfileImageUrl = await uploadToSupabase(imgFile.buffer, imgFile.mimetype, "avatars");
        updateData.profile_image = newProfileImageUrl;
        if (targetUser.profile_image) {
          await deleteFromSupabase(targetUser.profile_image);
        }
      }
      if (req.files?.CV?.[0]) {
        const cvFile   = req.files.CV[0];
        const newCvUrl = await uploadToSupabase(cvFile.buffer, cvFile.mimetype, "cvs");
        updateData.CV  = newCvUrl;
        if (targetUser.CV) {
          await deleteFromSupabase(targetUser.CV);
        }
      }
    }

    if (req.body.role) {
  if (req.user.role !== "admin") {
    return next(new HTTPError(403, "You cannot update your role. Please contact an admin."));
  }
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
    const targetId = req.params.id;

    // only admin or the user themselves can delete
    if (req.user.role !== "admin" && req.user._id.toString() !== targetId) {
      return next(new HTTPError(403, "You are not authorized to delete this user"));
    }

    const user = await User.findById(targetId);
    if (!user) return next(new HTTPError(404, "User not found"));

    // delete files from Supabase
    if (user.company_logo)  await deleteFromSupabase(user.company_logo);
    if (user.profile_image) await deleteFromSupabase(user.profile_image);
    if (user.CV)            await deleteFromSupabase(user.CV);

    if (user.role === "hr") {
      const jobs = await Job.find({ recruiter: user._id })
        .populate({ path: "recruiter", select: "name email role company_logo profile_image" })
        .populate({ path: "category", select: "name" });
      const jobIds = jobs.map((job) => job._id);

      if (jobIds.length > 0) {
        await Promise.all(
          jobs.map((job) =>
            JobApplication.updateMany(
              { job: job._id },
              {
                status: JOB_DELETED_APPLICATION_STATUS,
                jobSnapshot: createJobSnapshot(job),
              }
            )
          )
        );
        await Job.deleteMany({ _id: { $in: jobIds } });
      }
    }

    await User.findByIdAndDelete(targetId);

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};
