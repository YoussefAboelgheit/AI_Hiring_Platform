export const myApplications = [
  { id: "a1", jobId: "j1", jobTitle: "Senior Product Designer", company: "Stellar Systems", logo: "https://i.pravatar.cc/40?img=20", status: "reviewing", matchScore: 94, appliedAt: "4 days ago", finalScore: 92, rank: 3 },
  { id: "a2", jobId: "j2", jobTitle: "Visual Lead", company: "Prism Creative", logo: "https://i.pravatar.cc/40?img=21", status: "reviewing", matchScore: 88, appliedAt: "1 week ago", finalScore: 88, rank: 5 },
  { id: "a3", jobId: "j3", jobTitle: "Interaction Designer", company: "LogiFlow Corp", logo: "https://i.pravatar.cc/40?img=22", status: "interviewing", matchScore: 91, appliedAt: "2 days ago", finalScore: 91, rank: 1 },
  { id: "a4", jobId: "j4", jobTitle: "UI Engineer", company: "Nexus Labs", logo: "https://i.pravatar.cc/40?img=23", status: "rejected", matchScore: 76, appliedAt: "2 weeks ago", finalScore: 72, rank: 12 },
];

export const candidateDashboardStats = [
  { label: "Active Applications", value: "12", change: "+2 this week", icon: "bi-file-earmark-text", iconBg: "#EDE9FE", iconColor: "#7C3AED" },
  { label: "Pending Assessments", value: "03", change: "Due soon", icon: "bi-clipboard-check", iconBg: "#D1FAE5", iconColor: "#059669", warning: true },
  { label: "Feedback Reports", value: "08", change: "5 unread", icon: "bi-chat-square-text", iconBg: "#F3F4F6", iconColor: "#6B7280" },
];

export const applicationDetailExtras = {
  skills: ["Figma Expert", "Design Ops", "React/CSS", "Mentorship"],
  skillInsights: [
    ["Visual Design", 90], ["Communication", 85], ["UX Strategy", 70],
    ["Collaboration", 88], ["Prototyping", 65], ["Problem Solving", 92],
  ],
  nextSteps: [
    { done: true, label: "Initial Screening", sub: "Completed on May 12, 2024" },
    { done: false, active: true, label: "Technical Interview", sub: "Scheduled for Tomorrow, 10:00 AM", person: "Sarah Jenkins (Tech Lead)" },
    { label: "Leadership Round", sub: "Pending technical round" },
    { label: "Final Offer", sub: "Final stage" },
  ],
  sentiment: {
    quote: "High enthusiasm during assessment. Demonstrated structured thinking and immediate problem-solving capabilities.",
    score: "Highly Positive (0.94)",
  },
};
