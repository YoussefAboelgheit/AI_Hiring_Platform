export const buildRegeneratePrompt = ({ job, existingQuestions, questionToReplace, difficulty, topic }) => {
  return `You are a senior technical interviewer. Generate a replacement question that is different from all existing questions.

JOB INFORMATION:
Title: ${job.title}
Skills: ${Array.isArray(job.skills) ? job.skills.join(", ") : job.skills}

EXISTING QUESTIONS (do NOT repeat these):
${existingQuestions.map((q, i) => `${i + 1}. "${q.question}" [Topic: ${q.topic}, Difficulty: ${q.difficulty}]`).join("\n")}

QUESTION TO REPLACE:
"${questionToReplace.question}"
Topic: ${topic || questionToReplace.topic}
Difficulty: ${difficulty || questionToReplace.difficulty}

Generate a new question on topic "${topic || questionToReplace.topic}" with ${difficulty || questionToReplace.difficulty} difficulty. It must be substantially different from all existing questions listed above.

Return a JSON object with exactly these fields:
{
  "question": "The new question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "One of the 4 options, exactly as written",
  "explanation": "Brief explanation of why this answer is correct",
  "topic": "${topic || questionToReplace.topic}",
  "difficulty": "${difficulty || questionToReplace.difficulty}"
}

Return ONLY the JSON object. No markdown, no code fences, no extra text.`;
};
