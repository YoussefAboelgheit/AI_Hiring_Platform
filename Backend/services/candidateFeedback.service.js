import Job from "../models/job.js";
import JobApplication from "../models/jobApplication.js";
import CandidateAssessment from "../models/candidateAssessment.js";
import CandidateAnswer from "../models/candidateAnswer.js";
import HTTPError from "../util/httpError.js";
import { callGemini } from "./ai/geminiClient.js";

const parseJson = (text) => {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new HTTPError(500, "AI feedback response did not contain valid JSON.");
  }
  return JSON.parse(text.slice(first, last + 1));
};

const normalizeArray = (value) =>
  Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];

const normalizeFeedback = (raw) => ({
  strengths: normalizeArray(raw.strengths).slice(0, 5),
  weaknesses: normalizeArray(raw.weaknesses).slice(0, 5),
  summary: typeof raw.summary === "string" ? raw.summary.trim() : "",
  howToImprove: typeof raw.howToImprove === "string" ? raw.howToImprove.trim() : "",
});

export const generateCandidateFeedback = async ({ applicationId, candidateId }) => {
  const application = await JobApplication.findOne({
    _id: applicationId,
    candidate: candidateId,
  });

  if (!application) {
    throw new HTTPError(404, "Application not found");
  }

  if (application.status !== "Rejected") {
    throw new HTTPError(403, "Feedback is only available for rejected applications");
  }

  if (application.candidateFeedback?.generatedAt && application.candidateFeedback?.summary) {
    return application.candidateFeedback;
  }

  const job = await Job.findById(application.job);
  if (!job) {
    throw new HTTPError(404, "Job not found");
  }

  await application.populate("parsedResume");

  let basedOnAssessment = false;
  let assessmentSection = "";

  const candidateAssessment = await CandidateAssessment.findOne({
    candidate: candidateId,
    job: application.job,
    status: "completed",
  });

  if (candidateAssessment) {
    const answers = await CandidateAnswer.find({
      candidateAssessment: candidateAssessment._id,
    }).populate("question");

    if (answers.length > 0) {
      basedOnAssessment = true;
      const questionAnswerPairs = answers.map((a) => ({
        question: a.question?.question || "Unknown question",
        selectedAnswer: a.selectedAnswer,
        isCorrect: a.isCorrect,
        correctAnswer: a.question?.correctAnswer || "",
      }));

      assessmentSection = `
Assessment score: ${candidateAssessment.score ?? "N/A"}%

Assessment answers:
${JSON.stringify(questionAnswerPairs, null, 2)}
`;
    }
  }

  const prompt = `You are a helpful career coach providing constructive feedback to a job candidate who was not selected for a role. Your goal is to help them improve.
Return ONLY valid JSON matching this schema:

{
  "strengths": [],
  "weaknesses": [],
  "summary": "",
  "howToImprove": ""
}

Rules:
- strengths: 3-5 bullet points highlighting what the candidate did well (based on their CV and assessment if provided).
- weaknesses: 3-5 bullet points about gaps or areas that didn't match the job requirements. Be constructive, not discouraging.
- summary: A 2-3 sentence overview of the evaluation. Be honest but kind.
- howToImprove: Actionable, specific advice (2-4 sentences) on what the candidate should do to improve their chances for similar roles in the future.
- Use encouraging, candidate-friendly language. This is NOT an HR report — it's feedback for the candidate.
- Base the analysis ONLY on the provided data. Do not invent skills or experience.

Job:
${JSON.stringify(job.parsedJob || job, null, 2)}

Candidate resume:
${JSON.stringify(application.parsedResume?.parsedData || {}, null, 2)}
${assessmentSection}`;

  const rawText = await callGemini(prompt);
  const raw = parseJson(rawText);
  const feedback = normalizeFeedback(raw);

  application.candidateFeedback = {
    ...feedback,
    basedOnAssessment,
    generatedAt: new Date(),
  };

  await application.save();

  return application.candidateFeedback;
};
