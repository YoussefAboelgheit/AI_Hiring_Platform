import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit
  },
});

export const uploadFields = upload.fields([
  { name: "company_logo", maxCount: 1 },
  { name: "profile_image", maxCount: 1 },
  { name: "CV", maxCount: 1 },
]);
