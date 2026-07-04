import { body, param } from "express-validator";
import { JOB_STATUSES, JOB_TYPES, WORKPLACES } from "../models/job.js";
import Category from "../models/category.js";
import { DIFFICULTY_LEVELS, MIN_QUESTIONS, MAX_QUESTIONS } from "../config/assessment.js";

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

const optionalString = (field, label) =>
  body(field)
    .optional({ nullable: true })
    .isString().withMessage(`${label} must be a string`)
    .trim();

export const categoryNameParamValidator = [
  param("category")
    .trim()
    .notEmpty().withMessage("Category is required"),
];


//@desc update caregory to be required
export const createJobValidator = [
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Category must be a valid MongoDB ObjectId")
    .bail()
    .custom(async (categoryId) => {
      const category = await Category.findById(categoryId);
      if (!category) throw new Error("Category not found");
      return true;
    }),
  
  
  
  body("title").trim().notEmpty().withMessage("Title is required"),

  body("description").trim().notEmpty().withMessage("Description is required"),

  body("workplace")
    .notEmpty()
    .withMessage("Workplace is required")
    .isIn(WORKPLACES)
    .withMessage("Workplace must be Onsite, Hybrid, or Remote"),

  body("jobType")
    .notEmpty()
    .withMessage("Job type is required")
    .isIn(JOB_TYPES)
    .withMessage("Job type must be Intern, Full Time, or Part Time"),

  body("skills")
    .isArray({ min: 1 })
    .withMessage("Skills must be a non-empty array"),

  body("skills.*")
    .isString()
    .withMessage("Each skill must be a string")
    .trim()
    .notEmpty()
    .withMessage("Skill cannot be empty"),

  optionalString("requirements", "Requirements"),
  optionalString("location", "Location"),

  body("applicationEnd")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Application end must be a valid date")
    .toDate(),

  body("assessmentQuestionCount")
    .optional({ nullable: true })
    .isInt({ min: MIN_QUESTIONS, max: MAX_QUESTIONS })
    .withMessage(`Assessment question count must be between ${MIN_QUESTIONS} and ${MAX_QUESTIONS}`)
    .toInt(),

  body("assessmentDifficulty")
    .optional({ nullable: true })
    .isIn(DIFFICULTY_LEVELS)
    .withMessage(`Difficulty must be one of: ${DIFFICULTY_LEVELS.join(", ")}`),

  body("assessmentTopics")
    .optional({ nullable: true })
    .isString()
    .withMessage("Topics must be a string")
    .trim(),
];

export const updateJobValidator = [
  body("category")
    .optional({ nullable: true })
    .isMongoId().withMessage("Category must be a valid MongoDB ObjectId")
    .bail()
    .custom(async (categoryId) => {
      if (!categoryId) return true;
      const category = await Category.findById(categoryId);
      if (!category) throw new Error("Category not found");
      return true;
    }),

  body("title")
    .optional()
    .trim()
    .notEmpty().withMessage("Title cannot be empty"),

  body("description")
    .optional()
    .trim()
    .notEmpty().withMessage("Description cannot be empty"),

  body("workplace")
    .optional()
    .isIn(WORKPLACES).withMessage("Workplace must be Onsite, Hybrid, or Remote"),

  body("jobType")
    .optional()
    .isIn(JOB_TYPES).withMessage("Job type must be Intern, Full Time, or Part Time"),

  body("skills")
    .optional()
    .isArray({ min: 1 }).withMessage("Skills must be a non-empty array"),

  body("skills.*")
    .optional()
    .isString().withMessage("Each skill must be a string")
    .trim()
    .notEmpty().withMessage("Skill cannot be empty"),

  optionalString("requirements", "Requirements"),
  optionalString("location", "Location"),

  body("applicationEnd")
    .optional({ nullable: true })
    .isISO8601().withMessage("Application end must be a valid date")
    .toDate(),
];

export const applyToJobValidator = [
  body("CV")
    .custom((value, { req }) => {
      const uploadedCV = req.files?.CV?.[0] || req.files?.cv?.[0];

      if (!uploadedCV && !req.user?.CV?.trim()) {
        throw new Error("Please upload a CV to apply for this job");
      }

      if (uploadedCV) {
        const validation = validateUploadedFile(uploadedCV, ["application/pdf"]);
        if (!validation.isValid) throw new Error(validation.reason);
      }

      return true;
    }),
];

//job status

export const updateJobStatusValidator = [
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(JOB_STATUSES).withMessage("Status must be Open, Closed, or Drafted"),
];

// jobapplicaton status 

export const updateApplicationStatusValidator = [
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["Reviewed", "Accepted", "Rejected"])
    .withMessage("Status must be Reviewed, Accepted, or Rejected"),
];
