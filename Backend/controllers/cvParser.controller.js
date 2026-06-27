import HTTPError from "../util/httpError.js";
import ParsedResume from "../models/parsedResume.js";
import {
  extractTextFromDocument,
  buildResumePrompt,
  callGemini,
  validateParsedResume,
} from "../services/ai/resumeParserService.js";

export const parseCv = async (req, res, next) => {
  try {
    const file = req.files?.CV?.[0];
    if (!file) {
      return next(
        new HTTPError(
          400,
          "A CV file must be uploaded under the field name 'CV'.",
        ),
      );
    }

    const extractedText = await extractTextFromDocument(
      file.buffer,
      file.mimetype,
    );
    if (!extractedText || !extractedText.trim()) {
      return next(
        new HTTPError(400, "Unable to extract text from the uploaded CV."),
      );
    }

    const prompt = buildResumePrompt(extractedText);
    const parsedObject = await callGemini(prompt);

    const { data: parsedData, errors } = validateParsedResume(parsedObject);
    if (errors.length > 0) {
      const validationError = new HTTPError(
        422,
        "Parsed resume JSON failed validation.",
      );
      validationError.errors = errors.map((message) => ({ message }));
      return next(validationError);
    }

    const parsedResume = await ParsedResume.create({
      originalFileName: file.originalname,
      contentType: file.mimetype,
      size: file.size,
      parsedData,
      isValid: true,
      validationErrors: [],
    });

    return res.status(201).json({
      message: "CV parsed successfully",
      parsedResume: {
        id: parsedResume._id,
        originalFileName: parsedResume.originalFileName,
        contentType: parsedResume.contentType,
        size: parsedResume.size,
        parsedData: parsedResume.parsedData,
        createdAt: parsedResume.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};
