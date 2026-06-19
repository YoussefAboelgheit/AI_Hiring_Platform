export const feedbackReport = {
  candidateName: "Alex Thompson",
  jobTitle: "Senior Product Designer",
  matchScore: 92,
  strengths: [
    { title: "Visual Design Hierarchy", desc: "Portfolio demonstrates exceptional grasp of spacing and visual weight." },
    { title: "Strategic Thinking", desc: "Successfully articulated how design decisions directly impact business KPIs." },
    { title: "Communication", desc: "Explained complex technical constraints clearly during the case study." },
    { title: "Technical Stack", desc: "Deep knowledge of modern CSS, Tailwind, and React architectures." },
  ],
  weaknesses: [
    { title: "Quantitative Metrics", desc: "Try to anchor more results in hard data (e.g., % reduction in task time)." },
    { title: "Developer Handoff", desc: "Clarify your process for documenting edge cases for engineering teams." },
  ],
  recommendations: [
    "Expand on experience with Design Tokens; the team is migrating to a token-based system.",
    "Highlight more cross-functional leadership moments.",
    "Review SaaS accessibility standards (WCAG 2.1) for the final interview round.",
  ],
  aiRecommendation: {
    text: "Alex is a strong candidate. Their portfolio and assessment performance place them in the top 5% of applicants. We recommend proceeding to the final interview round.",
    confidence: 87,
  },
  sentiment: [
    ["Confidence", 92],
    ["Clarity", 85],
    ["Concision", 74],
  ],
  missingSkills: ["Docker", "AWS", "CI/CD"],
  evaluationSummary: "While your frontend expertise is impressive, the current role requires a more balanced full-stack profile. Your technical interview revealed gaps in backend architecture and cloud infrastructure that are critical for this position.",
};

export const recruiterFeedbackReport = {
  candidateName: "Jordan Smith",
  jobTitle: "Senior Product Designer",
  matchScore: 94,
  executiveSummary: "Jordan demonstrates an exceptional grasp of user-centric design principles, particularly in complex SaaS environments. Their portfolio shows a rare balance between high-fidelity aesthetic execution and deep architectural thinking. The analysis suggests a slight over-reliance on established design systems which may hinder radical innovation in blue-sky projects.",
  metrics: [
    ["Culture Fit", "High"],
    ["Leadership", "A-"],
    ["Communication", "Very Strong"],
  ],
  strengths: ["Data-Driven Methodology", "Multi-Platform Mastery", "Cross-Functional Advocacy"],
  growthAreas: ["Creative Spontaneity", "Rapid Prototyping Speed", "Public Speaking"],
  interviewQuestions: [
    { type: "TECHNICAL", focus: "Process", q: "Can you describe a time when data suggested one design path, but your intuition suggested another?" },
    { type: "BEHAVIORAL", focus: "Stakeholders", q: "Tell us about a design critique that was particularly difficult. How did you handle the feedback?" },
    { type: "CREATIVE", focus: "Innovation", q: "If you were tasked with redesigning a fundamental UX pattern, how would you push boundaries while maintaining usability?" },
    { type: "CULTURE", focus: "Teamwork", q: "How do you mentor junior designers on your team today, and what is one lesson you hope they take away?" },
  ],
};
