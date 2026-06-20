import { body } from "express-validator";

function getMimeFromBuffer(buffer) {
  const hex = buffer.toString("hex", 0, 12).toLowerCase();
  if (hex.startsWith("25504446")) return "application/pdf";
  if (hex.startsWith("89504e47")) return "image/png";
  if (hex.startsWith("ffd8ff")) return "image/jpeg";
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

export const registerValidator = [
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
    .isIn(["candidate", "hr"])
    .withMessage("Role must be candidate or hr"),

  body("company_logo")
    .custom((value, { req }) => {
      const role = req.body.role || "candidate";
      if (role === "hr") {
        if (!req.files || !req.files.company_logo) {
          throw new Error("Company logo is required for HR");
        }
        const file = req.files.company_logo[0];
        const validation = validateUploadedFile(file, ["image/png", "image/jpeg", "image/jpg"]);
        if (!validation.isValid) {
          throw new Error(validation.reason);
        }
      }
      return true;
    }),

  body("profile_image")
    .custom((value, { req }) => {
      const role = req.body.role || "candidate";
      if (role === "candidate") {
        if (!req.files || !req.files.profile_image) {
          throw new Error("Profile image is required for Candidate");
        }
        const file = req.files.profile_image[0];
        const validation = validateUploadedFile(file, ["image/png", "image/jpeg", "image/jpg"]);
        if (!validation.isValid) {
          throw new Error(validation.reason);
        }
      }
      return true;
    }),

  body("CV")
    .custom((value, { req }) => {
      const role = req.body.role || "candidate";
      if (role === "candidate") {
        if (!req.files || !req.files.CV) {
          throw new Error("CV file is required for Candidate");
        }
        const file = req.files.CV[0];
        const validation = validateUploadedFile(file, ["application/pdf"]);
        if (!validation.isValid) {
          throw new Error(validation.reason);
        }
      }
      return true;
    }),
];


export const loginValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),
];

export const resetPasswordValidator = [
  body("currentPassword")
    .notEmpty().withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 8 }).withMessage("New password must be at least 8 characters")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword)
        throw new Error("New password must be different from current password");
      return true;
    }),
];

export const forgotPasswordValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),
];

export const confirmForgotPasswordValidator = [
  body("token")
    .notEmpty().withMessage("Token is required"),

  body("newPassword")
    .isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
];