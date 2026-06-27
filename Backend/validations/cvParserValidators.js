import { body } from "express-validator";

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const validateCvFile = (file) => {
  if (!file) {
    throw new Error("A CV file is required under the field name 'CV'.");
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error("Allowed file formats are PDF and DOCX.");
  }

  return true;
};

export const parseCvValidator = [
  body("CV").custom((_, { req }) => {
    const file = req.files?.CV?.[0];
    return validateCvFile(file);
  }),
];
