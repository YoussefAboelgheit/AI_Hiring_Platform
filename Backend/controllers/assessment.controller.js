import * as assessmentService from "../services/ai/assessment/assessment.service.js";

export const updateAssessmentSettings = async (req, res, next) => {
  try {
    const { type, questionCount, difficulty, topics, durationMinutes } = req.body;
    const assessment = await assessmentService.updateAssessmentSettings({
      jobId: req.params.jobId,
      userId: req.user._id,
      type,
      questionCount,
      difficulty,
      topics,
      durationMinutes,
    });
    return res.status(200).json({ message: "Assessment settings updated successfully.", assessment });
  } catch (err) {
    next(err);
  }
};

export const addManualQuestion = async (req, res, next) => {
  try {
    const question = await assessmentService.addManualQuestion(
      req.params.jobId,
      req.user._id,
      req.body,
    );
    return res.status(201).json({ message: "Question added successfully.", question });
  } catch (err) {
    next(err);
  }
};

export const generateAssessment = async (req, res, next) => {
  try {
    const { questionCount, difficulty, topics, durationMinutes } = req.body;
    const assessment = await assessmentService.generateAssessment({
      jobId: req.params.jobId,
      questionCount,
      difficulty,
      topics,
      durationMinutes,
      userId: req.user._id,
    });
    return res.status(201).json({ message: "Assessment generated successfully.", assessment });
  } catch (err) {
    next(err);
  }
};

export const getAssessment = async (req, res, next) => {
  try {
    const isHr = req.user.role === "hr" || req.user.role === "admin";
    const result = await assessmentService.getAssessmentWithQuestions(
      req.params.jobId,
      req.user._id,
      isHr,
    );
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const question = await assessmentService.updateQuestion(
      req.params.questionId,
      req.body,
    );
    return res.status(200).json({ message: "Question updated successfully.", question });
  } catch (err) {
    next(err);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    await assessmentService.deleteQuestion(req.params.questionId);
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const regenerateQuestion = async (req, res, next) => {
  try {
    const question = await assessmentService.regenerateQuestion(req.params.questionId);
    return res.status(200).json({ message: "Question regenerated successfully.", question });
  } catch (err) {
    next(err);
  }
};

export const regenerateRepository = async (req, res, next) => {
  try {
    const assessment = await assessmentService.regenerateRepository(
      req.params.jobId,
      req.user._id,
    );
    return res.status(200).json({ message: "Repository regenerated successfully.", assessment });
  } catch (err) {
    next(err);
  }
};

export const startAssessment = async (req, res, next) => {
  try {
    const result = await assessmentService.startAssessment(
      req.params.jobId,
      req.user._id,
    );
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const saveAnswer = async (req, res, next) => {
  try {
    const { questionId, selectedAnswer } = req.body;
    const answer = await assessmentService.saveAnswer(
      req.params.jobId,
      req.user._id,
      questionId,
      selectedAnswer,
    );
    return res.status(200).json({ message: "Answer saved.", answer });
  } catch (err) {
    next(err);
  }
};

export const submitAssessment = async (req, res, next) => {
  try {
    const result = await assessmentService.submitAssessment(
      req.params.jobId,
      req.user._id,
    );
    return res.status(200).json({ message: "Assessment submitted successfully.", result });
  } catch (err) {
    next(err);
  }
};

export const reportViolation = async (req, res, next) => {
  try {
    const { type } = req.body;
    const result = await assessmentService.reportViolation(
      req.params.jobId,
      req.user._id,
      type,
    );
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getViolations = async (req, res, next) => {
  try {
    const result = await assessmentService.getAssessmentViolations(
      req.params.jobId,
    );
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
