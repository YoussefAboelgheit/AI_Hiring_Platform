import HTTPError from "../../../util/httpError.js";

const VALID_DIFFICULTIES = ["Easy", "Medium", "Hard"];
const EXPECTED_FIELDS = ["question", "options", "correctAnswer", "explanation", "topic", "difficulty"];

export const validateQuestionObject = (question, index) => {
  const errors = [];

  if (!question || typeof question !== "object") {
    return [`Item ${index}: expected an object, got ${typeof question}`];
  }

  for (const field of EXPECTED_FIELDS) {
    if (question[field] === undefined || question[field] === null) {
      errors.push(`Question ${index}: missing field "${field}"`);
    }
  }

  if (errors.length > 0) return errors;

  if (typeof question.question !== "string" || question.question.trim().length === 0) {
    errors.push(`Question ${index}: "question" must be a non-empty string`);
  }

  if (!Array.isArray(question.options)) {
    errors.push(`Question ${index}: "options" must be an array`);
  } else if (question.options.length !== 4) {
    errors.push(`Question ${index}: "options" must have exactly 4 items, got ${question.options.length}`);
  } else {
    for (let i = 0; i < question.options.length; i++) {
      if (typeof question.options[i] !== "string" || question.options[i].trim().length === 0) {
        errors.push(`Question ${index}: options[${i}] must be a non-empty string`);
      }
    }
  }

  if (typeof question.correctAnswer !== "string" || question.correctAnswer.trim().length === 0) {
    errors.push(`Question ${index}: "correctAnswer" must be a non-empty string`);
  } else if (Array.isArray(question.options) && !question.options.includes(question.correctAnswer)) {
    errors.push(`Question ${index}: "correctAnswer" must exactly match one of the options`);
  }

  if (typeof question.explanation !== "string" || question.explanation.trim().length === 0) {
    errors.push(`Question ${index}: "explanation" must be a non-empty string`);
  }

  if (typeof question.topic !== "string" || question.topic.trim().length === 0) {
    errors.push(`Question ${index}: "topic" must be a non-empty string`);
  }

  if (!VALID_DIFFICULTIES.includes(question.difficulty)) {
    errors.push(`Question ${index}: "difficulty" must be one of ${VALID_DIFFICULTIES.join(", ")}, got "${question.difficulty}"`);
  }

  return errors;
};

export const validateQuestionBatch = (questions) => {
  if (!Array.isArray(questions)) {
    throw new HTTPError(500, `Gemini response is not an array, got ${typeof questions}`);
  }

  if (questions.length === 0) {
    throw new HTTPError(500, "Gemini returned an empty question array");
  }

  const allErrors = [];
  questions.forEach((q, i) => {
    allErrors.push(...validateQuestionObject(q, i));
  });

  if (allErrors.length > 0) {
    throw new HTTPError(500, `Question validation failed (${allErrors.length} errors): ${allErrors.join(" | ")}`);
  }

  return questions;
};

export const validateSingleQuestion = (question) => {
  const errors = validateQuestionObject(question, 0);
  if (errors.length > 0) {
    throw new HTTPError(500, `Generated question validation failed: ${errors.join(" | ")}`);
  }
  return question;
};
