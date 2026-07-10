import Assessment from "../../../models/assessment.js";
import Question from "../../../models/question.js";
import CandidateAssessment from "../../../models/candidateAssessment.js";
import CandidateAnswer from "../../../models/candidateAnswer.js";
import Job from "../../../models/job.js";
import JobApplication from "../../../models/jobApplication.js";
import HTTPError from "../../../util/httpError.js";
import { REPOSITORY_MULTIPLIER } from "../../../config/assessment.js";
import { getProvider } from "../providers/providerFactory.js";
import { buildGeneratePrompt } from "../prompts/generateAssessment.prompt.js";
import { buildRegeneratePrompt } from "../prompts/regenerateQuestion.prompt.js";
import { validateQuestionBatch, validateSingleQuestion } from "../parser/jsonValidator.js";

const getEditableJob = async (jobId) => {
  const job = await Job.findById(jobId);
  if (!job) throw new HTTPError(404, "Job not found");
  if (job.status !== "Drafted" || (job.editableUntil && new Date() > job.editableUntil)) {
    throw new HTTPError(403, "Assessment can only be modified while the job is in Draft status and within the editable window");
  }
  return job;
};

const autoLockAssessment = async (assessment) => {
  if (assessment.status !== "Drafted") return assessment;

  const job = await Job.findById(assessment.job);
  if (!job || job.status !== "Drafted" || (job.editableUntil && new Date() > job.editableUntil)) {
    assessment.status = "Locked";
    await assessment.save();
  }
  return assessment;
};

export const updateAssessmentSettings = async ({ jobId, userId, type, questionCount, difficulty, topics, durationMinutes }) => {
  const job = await getEditableJob(jobId);

  let assessment = await Assessment.findOne({ job: jobId });

  if (!assessment) {
    assessment = await Assessment.create({
      job: jobId,
      type: type || "NONE",
      questionCount: questionCount || 0,
      repositorySize: questionCount ? questionCount * REPOSITORY_MULTIPLIER : 0,
      difficulty: difficulty || "Auto",
      topics: topics || "",
      durationMinutes,
      status: "Drafted",
      generatedBy: userId,
    });
  } else {
    assessment.type = type ?? assessment.type;
    assessment.difficulty = difficulty ?? assessment.difficulty;
    assessment.topics = topics ?? assessment.topics;
    if (durationMinutes !== undefined) {
      assessment.durationMinutes = durationMinutes;
    }

    if (questionCount !== undefined) {
      assessment.questionCount = questionCount;
      assessment.repositorySize = questionCount * REPOSITORY_MULTIPLIER;
    }

    await assessment.save();
  }

  if (assessment.type === "AI" && assessment.questionCount > 0) {
    const existingQuestions = await Question.countDocuments({ assessment: assessment._id });
    if (existingQuestions === 0) {
      const result = await generateAssessment({
        jobId,
        questionCount: assessment.questionCount,
        difficulty: assessment.difficulty === "Auto" ? undefined : assessment.difficulty,
        topics: assessment.topics || undefined,
        durationMinutes: assessment.durationMinutes,
        userId,
      });
      return result;
    }
  }

  const populated = await Assessment.findById(assessment._id).populate("job");
  return populated;
};

export const addManualQuestion = async (jobId, userId, questionData) => {
  const job = await getEditableJob(jobId);

  let assessment = await Assessment.findOne({ job: jobId });

  if (!assessment) {
    throw new HTTPError(400, "Please set assessment settings (including duration) before adding questions");
  }

  if (assessment.status !== "Drafted") {
    throw new HTTPError(403, "Assessment is locked and cannot be modified");
  }

  if (assessment.type === "NONE") {
    assessment.type = "MANUAL";
  }

  const question = await Question.create({
    assessment: assessment._id,
    question: questionData.question,
    options: questionData.options,
    correctAnswer: questionData.correctAnswer,
    explanation: questionData.explanation,
    topic: questionData.topic || "General",
    difficulty: questionData.difficulty || "Medium",
  });

  assessment.questionCount = (assessment.questionCount || 0) + 1;
  await assessment.save();

  return question;
};

export const generateAssessment = async ({ jobId, questionCount, difficulty, topics, durationMinutes, userId }) => {
  const job = await getEditableJob(jobId);

  const repositorySize = questionCount * REPOSITORY_MULTIPLIER;

  const provider = getProvider("gemini");
  const prompt = buildGeneratePrompt({
    job,
    questionCount,
    repositorySize,
    difficulty: difficulty || "Auto",
    topics,
  });

  const rawQuestions = await provider.generateContent(prompt, {
    temperature: 0.2,
    model: "gemini-2.5-flash-lite",
  });

  const validatedQuestions = validateQuestionBatch(rawQuestions);

  const trimmedQuestions = validatedQuestions.slice(0, repositorySize);

  let assessment = await Assessment.findOne({ job: jobId });
  if (assessment) {
    await Question.deleteMany({ assessment: assessment._id });
    assessment.type = "AI";
    assessment.questionCount = questionCount;
    assessment.repositorySize = repositorySize;
    assessment.difficulty = difficulty || "Auto";
    assessment.topics = topics || "";
    assessment.durationMinutes = durationMinutes;
    assessment.status = "Drafted";
    assessment.generatedBy = userId;
    await assessment.save();
  } else {
    assessment = await Assessment.create({
      job: jobId,
      type: "AI",
      questionCount,
      repositorySize,
      difficulty: difficulty || "Auto",
      topics: topics || "",
      durationMinutes,
      status: "Drafted",
      generatedBy: userId,
    });
  }

  const questionDocs = trimmedQuestions.map((q) => ({
    assessment: assessment._id,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    topic: q.topic,
    difficulty: q.difficulty,
  }));

  await Question.insertMany(questionDocs);

  const populated = await Assessment.findById(assessment._id).populate("job");
  return populated;
};

export const getAssessmentWithQuestions = async (jobId, userId, isHr) => {
  const assessment = await Assessment.findOne({ job: jobId });
  if (!assessment) throw new HTTPError(404, "Assessment not found");

  if (isHr) {
    await autoLockAssessment(assessment);
  } else {
    if (assessment.status !== "Locked") throw new HTTPError(404, "Assessment not found");
  }

  const selectFields = isHr ? "" : "-correctAnswer";
  const questions = await Question.find({ assessment: assessment._id }).select(selectFields);

  return { assessment, questions };
};

export const updateQuestion = async (questionId, updates) => {
  const question = await Question.findById(questionId).populate({
    path: "assessment",
    select: "job",
  });

  if (!question) throw new HTTPError(404, "Question not found");

  await getEditableJob(question.assessment.job);

  const allowed = ["question", "options", "correctAnswer", "explanation", "topic", "difficulty"];
  for (const field of allowed) {
    if (updates[field] !== undefined) {
      question[field] = updates[field];
    }
  }

  await question.save();
  return question;
};

export const deleteQuestion = async (questionId) => {
  const question = await Question.findById(questionId).populate({
    path: "assessment",
    select: "job",
  });

  if (!question) throw new HTTPError(404, "Question not found");

  await getEditableJob(question.assessment.job);

  await Question.findByIdAndDelete(questionId);
};

export const regenerateQuestion = async (questionId) => {
  const question = await Question.findById(questionId).populate({
    path: "assessment",
    select: "job",
  });

  if (!question) throw new HTTPError(404, "Question not found");

  const job = await getEditableJob(question.assessment.job);

  const existingQuestions = await Question.find({ assessment: question.assessment._id });

  const provider = getProvider("gemini");
  const prompt = buildRegeneratePrompt({
    job,
    existingQuestions: existingQuestions.filter((q) => q._id.toString() !== questionId),
    questionToReplace: question,
    difficulty: question.difficulty,
    topic: question.topic,
  });

  const newQuestionData = await provider.generateContent(prompt, {
    temperature: 0.3,
    model: "gemini-2.5-flash-lite",
  });

  const validated = validateSingleQuestion(newQuestionData);

  question.question = validated.question;
  question.options = validated.options;
  question.correctAnswer = validated.correctAnswer;
  question.explanation = validated.explanation;
  question.topic = validated.topic;
  question.difficulty = validated.difficulty;
  await question.save();

  return question;
};

export const regenerateRepository = async (jobId, userId) => {
  const assessment = await Assessment.findOne({ job: jobId });
  if (!assessment) throw new HTTPError(404, "Assessment not found");

  return generateAssessment({
    jobId,
    questionCount: assessment.questionCount,
    difficulty: assessment.difficulty === "Auto" ? undefined : assessment.difficulty,
    topics: assessment.topics || undefined,
    durationMinutes: assessment.durationMinutes,
    userId,
  });
};

export const startAssessment = async (jobId, userId) => {
  const job = await Job.findById(jobId);
  if (!job || job.status !== "Open") throw new HTTPError(403, "Job is not open for assessments");

  const assessment = await Assessment.findOne({ job: jobId });
  if (!assessment || assessment.status !== "Locked") throw new HTTPError(404, "No active assessment found for this job");

  let candidateAssessment = await CandidateAssessment.findOne({ candidate: userId, job: jobId });
  if (candidateAssessment) {
    if (candidateAssessment.status === "completed") {
      throw new HTTPError(400, "You have already completed this assessment");
    }

    // Check if the pending attempt has expired
    if (candidateAssessment.expiresAt && new Date() > candidateAssessment.expiresAt) {
      candidateAssessment.score = 0;
      candidateAssessment.submittedAt = new Date();
      candidateAssessment.status = "completed";
      await candidateAssessment.save();

      await JobApplication.updateOne(
        { candidate: userId, job: jobId },
        { assessmentScore: 0, assessmentStatus: "completed" },
      );

      throw new HTTPError(410, "Time is up. Assessment has been automatically submitted.");
    }

    const questions = await Question.find({
      _id: { $in: candidateAssessment.selectedQuestionIds },
    }).select("-correctAnswer -__v");

    return {
      candidateAssessment,
      questions,
      timer: {
        startedAt: candidateAssessment.startedAt,
        expiresAt: candidateAssessment.expiresAt,
        durationMinutes: assessment.durationMinutes,
      },
    };
  }

  const allQuestions = await Question.find({ assessment: assessment._id });
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, assessment.questionCount);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + assessment.durationMinutes * 60 * 1000);

  candidateAssessment = await CandidateAssessment.create({
    candidate: userId,
    job: jobId,
    assessment: assessment._id,
    selectedQuestionIds: selected.map((q) => q._id),
    status: "pending",
    startedAt: now,
    expiresAt: expiresAt,
  });

  const questions = selected.map((q) => ({
    _id: q._id,
    question: q.question,
    options: q.options,
    explanation: q.explanation,
    topic: q.topic,
    difficulty: q.difficulty,
  }));

  return {
    candidateAssessment,
    questions,
    timer: {
      startedAt: now,
      expiresAt: expiresAt,
      durationMinutes: assessment.durationMinutes,
    },
  };
};

export const saveAnswer = async (jobId, userId, questionId, selectedAnswer) => {
  const candidateAssessment = await CandidateAssessment.findOne({
    candidate: userId,
    job: jobId,
    status: "pending",
  });

  if (!candidateAssessment) throw new HTTPError(404, "No pending assessment found");

  if (candidateAssessment.expiresAt && new Date() > candidateAssessment.expiresAt) {
    candidateAssessment.score = 0;
    candidateAssessment.submittedAt = new Date();
    candidateAssessment.status = "completed";
    await candidateAssessment.save();

    await JobApplication.updateOne(
      { candidate: userId, job: jobId },
      { assessmentScore: 0, assessmentStatus: "completed" },
    );

    throw new HTTPError(410, "Time is up. Assessment has been automatically submitted.");
  }

  const questionIds = candidateAssessment.selectedQuestionIds.map((id) => id.toString());
  if (!questionIds.includes(questionId)) {
    throw new HTTPError(400, `Question ${questionId} is not part of this assessment`);
  }

  const existing = await CandidateAnswer.findOne({
    candidateAssessment: candidateAssessment._id,
    question: questionId,
  });

  if (existing) {
    existing.selectedAnswer = selectedAnswer;
    await existing.save();
    return existing;
  }

  const answer = await CandidateAnswer.create({
    candidateAssessment: candidateAssessment._id,
    question: questionId,
    selectedAnswer,
    isCorrect: false,
  });

  return answer;
};

export const submitAssessment = async (jobId, userId) => {
  const candidateAssessment = await CandidateAssessment.findOne({
    candidate: userId,
    job: jobId,
    status: "pending",
  });

  if (!candidateAssessment) throw new HTTPError(404, "No pending assessment found");

  const isExpired = candidateAssessment.expiresAt && new Date() > candidateAssessment.expiresAt;

  const questionIds = candidateAssessment.selectedQuestionIds.map((id) => id.toString());

  let score = 0;
  let total = questionIds.length;

  if (!isExpired) {
    const savedAnswers = await CandidateAnswer.find({
      candidateAssessment: candidateAssessment._id,
    });

    const questions = await Question.find({
      _id: { $in: candidateAssessment.selectedQuestionIds },
    });

    const questionMap = {};
    for (const q of questions) {
      questionMap[q._id.toString()] = q;
    }

    for (const savedAnswer of savedAnswers) {
      const question = questionMap[savedAnswer.question.toString()];
      if (question) {
        savedAnswer.isCorrect = question.correctAnswer === savedAnswer.selectedAnswer;
        if (savedAnswer.isCorrect) score++;
        await savedAnswer.save();
      }
    }
  }

  candidateAssessment.score = score;
  candidateAssessment.submittedAt = new Date();
  candidateAssessment.status = "completed";
  await candidateAssessment.save();

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  await JobApplication.updateOne(
    { candidate: userId, job: jobId },
    { assessmentScore: percentage, assessmentStatus: "completed" },
  );

  if (isExpired) {
    return { score, total, percentage, expired: true, message: "Time is up. Assessment has been automatically submitted." };
  }

  return { score, total, percentage, expired: false };
};
