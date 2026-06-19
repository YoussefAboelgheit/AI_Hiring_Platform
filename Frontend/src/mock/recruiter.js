export const recruiterStats = {
  activeJobs: 24,
  newApplications: 1284,
  shortlisted: 86,
  assessmentsPending: 142,
};

export const recruiterDashboardStats = [
  { label: "Total Active Jobs", key: "activeJobs", change: "+12%", icon: "bi-briefcase", iconBg: "#EDE9FE", iconColor: "#7C3AED" },
  { label: "New Applications", key: "newApplications", change: "+5%", icon: "bi-file-earmark-person", iconBg: "#D1FAE5", iconColor: "#059669" },
  { label: "Shortlisted Candidates", key: "shortlisted", change: "-2%", icon: "bi-person-check", iconBg: "#FEE2E2", iconColor: "#DC2626", negative: true },
  { label: "Assessments Pending", key: "assessmentsPending", change: "+18%", icon: "bi-clipboard-check", iconBg: "#DBEAFE", iconColor: "#1D4ED8" },
];

export const recentApplicationsRecruiter = [
  { id: "ra1", candidate: "Alex Rivera", email: "alex.r@example.com", avatar: "https://i.pravatar.cc/40?img=11", jobRole: "Senior Product Designer", appliedAt: "2h ago", status: "reviewing" },
  { id: "ra2", candidate: "Michael Chen", email: "m.chen@tech.io", avatar: "https://i.pravatar.cc/40?img=12", jobRole: "Full Stack Developer", appliedAt: "5h ago", status: "shortlisted" },
  { id: "ra3", candidate: "Sophia Williams", email: "s.williams@global.com", avatar: "https://i.pravatar.cc/40?img=13", jobRole: "Marketing Manager", appliedAt: "1d ago", status: "interviewing" },
  { id: "ra4", candidate: "David Miller", email: "david.m@corp.net", avatar: "https://i.pravatar.cc/40?img=14", jobRole: "DevOps Engineer", appliedAt: "2d ago", status: "rejected" },
];

export const topAIMatches = [
  { id: "t1", name: "Elena Gilbert", title: "Senior UI Artist", avatar: "https://i.pravatar.cc/40?img=1", match: 98 },
  { id: "t2", name: "Marcus Thorne", title: "Lead ML Engineer", avatar: "https://i.pravatar.cc/40?img=2", match: 94 },
  { id: "t3", name: "Aria Sterling", title: "Solutions Architect", avatar: "https://i.pravatar.cc/40?img=3", match: 91 },
];

export const applicantsList = [
  { id: "c1", name: "Jordan Alexander", email: "j.alex@mail.com", avatar: "https://i.pravatar.cc/40?img=15", cvScore: 92, skillMatch: 88, assessmentScore: 95, finalScore: 92, rank: 1, status: "shortlisted" },
  { id: "c2", name: "Sarah Kim", email: "s.kim@design.io", avatar: "https://i.pravatar.cc/40?img=16", cvScore: 85, skillMatch: 82, assessmentScore: 78, finalScore: 82, rank: 2, status: "reviewing" },
  { id: "c3", name: "Alex Thompson", email: "alex.t@dev.com", avatar: "https://i.pravatar.cc/40?img=11", cvScore: 88, skillMatch: 79, assessmentScore: 72, finalScore: 80, rank: 3, status: "rejected" },
  { id: "c4", name: "Mia Chen", email: "mia.c@ux.co", avatar: "https://i.pravatar.cc/40?img=17", cvScore: 76, skillMatch: 74, assessmentScore: 80, finalScore: 77, rank: 4, status: "reviewing" },
];

export const candidateReviewDetail = {
  name: "Jordan Doe",
  title: "Senior Frontend Engineer",
  location: "San Francisco, CA",
  tags: ["8+ Years Experience", "Masters in CS", "Open to Relocation"],
  cvSummary: "Results-oriented Senior Frontend Engineer with extensive experience in building scalable web applications using React and TypeScript. Proven track record of leading development teams and optimizing for high-traffic platforms.",
  skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL", "Node.js"],
  education: [
    ["M.S. Computer Science", "Stanford University · 2016"],
    ["B.S. Software Engineering", "UC Berkeley · 2014"],
  ],
  projects: [
    ["E-Commerce SaaS HMU", "Rebuilt the checkout engine, improving conversion by 14%."],
    ["Real-time Analytics Dashboard", "Implemented WebSocket-based live reporting system."],
  ],
  certifications: [
    ["AWS Solutions Architect", "Issued Oct 2023"],
    ["Google Cloud Certification", "Issued May 2022"],
  ],
  aiMatchScore: 94,
  cvScore: 91,
  assessmentScore: 82,
  aiInsight: "Jordan shows exceptional depth in React architecture. Suggest asking about their experience with micro-frontends during the technical interview.",
};

export const topCandidates = {
  podium: [
    { rank: 1, name: "Alex Rivera", title: "Principal Experience Architect", avatar: "https://i.pravatar.cc/80?img=11", finalScore: 98.5, technical: 99, cultural: 97, confidence: "High (98%)" },
    { rank: 2, name: "Sarah Jenkins", title: "Staff Product Designer", avatar: "https://i.pravatar.cc/80?img=5", finalScore: 94.2, confidence: "High (95%)" },
    { rank: 3, name: "Chen Wei", title: "Senior Design Lead", avatar: "https://i.pravatar.cc/80?img=9", finalScore: 92.8, confidence: "High (93%)" },
  ],
  rest: [
    { rank: 4, name: "Jordan Smith", title: "Product Designer", avatar: "https://i.pravatar.cc/40?img=15", score: 89.4, match: 89 },
    { rank: 5, name: "Elena Garcia", title: "UX Researcher", avatar: "https://i.pravatar.cc/40?img=1", score: 87.1, match: 87 },
    { rank: 6, name: "Marcus Thorne", title: "UI Engineer", avatar: "https://i.pravatar.cc/40?img=2", score: 85.9, match: 85 },
    { rank: 7, name: "Linda Smith", title: "Design Systems Specialist", avatar: "https://i.pravatar.cc/40?img=20", score: 83.5, match: 83 },
    { rank: 8, name: "Robert Kaseta", title: "Visual Designer", avatar: "https://i.pravatar.cc/40?img=21", score: 82.0, match: 82 },
    { rank: 9, name: "Olivia Martinez", title: "Lead Designer", avatar: "https://i.pravatar.cc/40?img=22", score: 81.4, match: 81 },
    { rank: 10, name: "Thomas Hedges", title: "Senior Product Designer", avatar: "https://i.pravatar.cc/40?img=23", score: 80.2, match: 80 },
  ],
};

export const monthlyGoal = {
  percent: 75,
  filled: 15,
  target: 20,
  avgDays: 14,
};

export const aiInsightDashboard = "Hiring for the Senior Product Designer role is 20% faster than average this month. Consider expanding the search to include international talent for higher diversity.";
