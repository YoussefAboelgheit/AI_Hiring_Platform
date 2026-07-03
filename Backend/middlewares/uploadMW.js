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

export const uploadCV = (req, res, next) => {
  const handler = upload.fields([
    { name: "CV", maxCount: 1 },
    { name: "cv", maxCount: 1 },
  ]);
  handler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(400).json({
        status: "error",
        message: `File upload error: ${err.message}`,
      });
    }
    if (err) return next(err);

    // Normalize field name: if "cv" was used but not "CV", copy it over
    if (!req.files?.CV?.[0] && req.files?.cv?.[0]) {
      req.files.CV = req.files.cv;
    }

    next();
  });
};
