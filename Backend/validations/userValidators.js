import { body } from "express-validator";
import User from "../models/user.js";

function getMimeFromBuffer(buffer) {
  const hex = buffer.toString("hex", 0, 12).toLowerCase();
  if (hex.startsWith("25504446")) return "application/pdf";
  if (hex.startsWith("89504e47")) return "image/png";
  if (hex.startsWith("ffd8ff"))   return "image/jpeg";
  return null;
}

function validateUploadedFile(file, allowedMimes) {
  if (!file || !file.buffer || file.buffer.length === 0) {
    return { isValid: false, reason: "File is empty or corrupted" };
  }

  const isImage = allowedMimes.includes("image/png") || allowedMimes.includes("image/jpeg") || allowedMimes.includes("image/jpg");
  const allowedFormatsMsg = isImage
    ? "Allowed formats are png, jpg, jpeg."
    : "Allowed format is pdf.";

  const detectedMime = getMimeFromBuffer(file.buffer);
  if (!detectedMime) {
    return { isValid: false, reason: `Invalid file format. ${allowedFormatsMsg}` };
  }

  if (file.mimetype && file.mimetype !== detectedMime) {
    const isJpgJpeg = (file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") &&
                      (detectedMime === "image/jpg" || detectedMime === "image/jpeg");
    if (!isJpgJpeg) {
      return { isValid: false, reason: `File content does not match the file type. ${allowedFormatsMsg}` };
    }
  }

  if (!allowedMimes.includes(detectedMime)) {
    return { isValid: false, reason: `File type not allowed. ${allowedFormatsMsg}` };
  }

  return { isValid: true };
}


export const createUserValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 3, max: 50 }).withMessage("Name must be between 3 and 50 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),

  body("role")
    .optional()
    .isIn(["candidate", "hr", "admin"])
    .withMessage("Role must be candidate, hr, or admin"),

  body("bio")
    .optional()
    .isString().withMessage("Bio must be a string")
    .isLength({ max: 300 }).withMessage("Bio cannot exceed 300 characters")
    .trim(),

  body("company_logo")
    .custom((value, { req }) => {
      const role = req.body.role || "candidate";
      if (role === "hr" && req.files?.company_logo?.[0]) {
        const file = req.files.company_logo[0];
        const validation = validateUploadedFile(file, ["image/png", "image/jpeg", "image/jpg"]);
        if (!validation.isValid) throw new Error(validation.reason);
      }
      return true;
    }),

  body("profile_image")
    .custom((value, { req }) => {
      if (req.files?.profile_image?.[0]) {
        const file = req.files.profile_image[0];
        const validation = validateUploadedFile(file, ["image/png", "image/jpeg", "image/jpg"]);
        if (!validation.isValid) throw new Error(validation.reason);
      }
      return true;
    }),

  body("CV")
    .custom((value, { req }) => {
      if (req.files?.CV?.[0]) {
        const file = req.files.CV[0];
        const validation = validateUploadedFile(file, ["application/pdf"]);
        if (!validation.isValid) throw new Error(validation.reason);
      }
      return true;
    }),
];


export const updateUserValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty().withMessage("Name cannot be empty")
    .isLength({ min: 3, max: 50 }).withMessage("Name must be between 3 and 50 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("bio")
    .optional()
    .isString().withMessage("Bio must be a string")
    .isLength({ max: 300 }).withMessage("Bio cannot exceed 300 characters")
    .trim(),

  body("role")
    .optional()
    .isIn(["candidate", "hr", "admin"])
    .withMessage("Role must be candidate, hr, or admin"),

  body("company_logo")
    .custom(async (value, { req }) => {
      if (req.files?.company_logo?.[0]) {
        const targetId = req.params.id;
        const user = await User.findById(targetId);
        if (!user) throw new Error("User not found");
        if (user.role !== "hr") throw new Error("Company logo can only be set for HR");
        const file = req.files.company_logo[0];
        const validation = validateUploadedFile(file, ["image/png", "image/jpeg", "image/jpg"]);
        if (!validation.isValid) throw new Error(validation.reason);
      }
      return true;
    }),

  body("profile_image")
    .custom(async (value, { req }) => {
      if (req.files?.profile_image?.[0]) {
        const targetId = req.params.id;
        const user = await User.findById(targetId);
        if (!user) throw new Error("User not found");
        if (user.role !== "candidate") throw new Error("Profile image can only be set for Candidates");
        const file = req.files.profile_image[0];
        const validation = validateUploadedFile(file, ["image/png", "image/jpeg", "image/jpg"]);
        if (!validation.isValid) throw new Error(validation.reason);
      }
      return true;
    }),

  body("CV")
    .custom(async (value, { req }) => {
      if (req.files?.CV?.[0]) {
        const targetId = req.params.id;
        const user = await User.findById(targetId);
        if (!user) throw new Error("User not found");
        if (user.role !== "candidate") throw new Error("CV can only be set for Candidates");
        const file = req.files.CV[0];
        const validation = validateUploadedFile(file, ["application/pdf"]);
        if (!validation.isValid) throw new Error(validation.reason);
      }
      return true;
    }),
];