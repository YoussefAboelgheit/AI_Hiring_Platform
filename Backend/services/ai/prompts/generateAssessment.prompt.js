export const buildGeneratePrompt = ({ job, questionCount, repositorySize, difficulty, topics }) => {
  const difficultyInstruction = !difficulty || difficulty === "Auto"
    ? "Determine the appropriate difficulty mix based on the job level and seniority."
    : difficulty === "Mixed"
      ? "Generate a balanced mix of Easy, Medium, and Hard questions."
      : `All questions must be ${difficulty} difficulty.`;

  const topicsInstruction = topics
    ? `Focus specifically on these topics: ${topics}`
    : "Analyze the job information below and determine the most important topics automatically.";

  return `You are a senior technical interviewer. Generate exactly ${repositorySize} unique multiple-choice questions for the following job.

JOB INFORMATION:
Title: ${job.title}
Description: ${job.description}
${job.responsibilities ? `Responsibilities: ${job.responsibilities}` : ""}
${job.requirements ? `Requirements: ${job.requirements}` : ""}
Skills: ${Array.isArray(job.skills) ? job.skills.join(", ") : job.skills}
${job.experience ? `Experience: ${job.experience}` : ""}

${topicsInstruction}

${difficultyInstruction}

You will generate ${repositorySize} questions. Only ${questionCount} will be shown to each candidate, so every question must be standalone, distinct, and non-overlapping.

Return a JSON array of objects. Each object MUST have exactly these fields:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "One of the 4 options, exactly as written",
  "explanation": "Brief explanation of why this answer is correct",
  "topic": "The topic this question belongs to",
  "difficulty": "Easy" | "Medium" | "Hard"
}

Return ONLY the JSON array. No markdown, no code fences, no extra text.`;
};
