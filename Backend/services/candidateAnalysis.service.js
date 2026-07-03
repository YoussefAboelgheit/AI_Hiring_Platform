import Job from "../models/job.js";
import JobApplication from "../models/jobApplication.js";
import HTTPError from "../util/httpError.js";
import { callGemini } from "./ai/geminiClient.js";

const parseJson = (text) => {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new HTTPError(500, "AI analysis response did not contain valid JSON.");
  }

  return JSON.parse(text.slice(first, last + 1));
};

const normalizeArray = (value) =>
  Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];

const normalizeAnalysis = (raw) => ({
  strengths: normalizeArray(raw.strengths).slice(0, 5),
  weaknesses: normalizeArray(raw.weaknesses).slice(0, 5),
  summary: typeof raw.summary === "string" ? raw.summary.trim() : "",
  recommendation:
    typeof raw.recommendation === "string" ? raw.recommendation.trim() : "",
  generatedAt: new Date(),
});

const buildCandidateAnalysisPrompt = ({ job, application }) => `
You are helping an HR team compare a candidate against a job.
Return ONLY valid JSON matching this schema:

{
  "strengths": [],
  "weaknesses": [],
  "summary": "",
  "recommendation": ""
}

Rules:
- Use concise, practical HR language.
- Base the analysis only on the provided job and resume data.
- Do not invent experience, skills, education, or achievements.
- Mention weaknesses as gaps or risks, not insults.
- Keep summary under 70 words.

Job:
${JSON.stringify(job.parsedJob || job, null, 2)}

Candidate resume:
${JSON.stringify(application.parsedResume?.parsedData || {}, null, 2)}

Match score:
${application.matchScore}
`;

const analyzeApplication = async ({ job, application }) => {
  if (
    application.aiEvaluation?.generatedAt &&
    application.aiEvaluation?.summary
  ) {
    return application;
  }

  const prompt = buildCandidateAnalysisPrompt({ job, application });
  const rawText = await callGemini(prompt);
  const analysis = normalizeAnalysis(parseJson(rawText));

  return await JobApplication.findByIdAndUpdate(
    application._id,
    { aiEvaluation: analysis },
    { new: true },
  )
    .populate({ path: "candidate", select: "name email role profile_image CV bio" })
    .populate("parsedResume");
};

export const analyzeJobApplication = async ({ jobId, applicationId }) => {
  const job = await Job.findById(jobId);
  if (!job) throw new HTTPError(404, "Job not found");

  const application = await JobApplication.findOne({
    _id: applicationId,
    job: jobId,
    matchingStatus: "completed",
    matchScore: { $ne: null },
  })
    .populate({ path: "candidate", select: "name email role profile_image CV bio" })
    .populate("parsedResume");

  if (!application) {
    throw new HTTPError(
      404,
      "Completed application match not found for this job",
    );
  }

  return await analyzeApplication({ job, application });
};

export const analyzeTopCandidatesForJob = async (jobId, limit = 3) => {
  const job = await Job.findById(jobId);
  if (!job) throw new HTTPError(404, "Job not found");

  const applications = await JobApplication.find({
    job: jobId,
    matchingStatus: "completed",
    matchScore: { $ne: null },
  })
    .populate({ path: "candidate", select: "name email role profile_image CV bio" })
    .populate("parsedResume")
    .sort({ matchScore: -1, createdAt: 1 })
    .limit(limit);

  const analyzedApplications = [];

  for (const application of applications) {
    analyzedApplications.push(await analyzeApplication({ job, application }));
  }

  return analyzedApplications;
};
