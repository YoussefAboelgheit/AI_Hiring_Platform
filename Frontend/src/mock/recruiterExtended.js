export const myJobsStats = [
  { label: "Active Roles", value: "12", change: "+2 from last month", icon: "bi-lightning-charge", iconBg: "#EDE9FE", iconColor: "#7C3AED" },
  { label: "Total Applicants", value: "842", change: "14% conversion rate", icon: "bi-people", iconBg: "#EDE9FE", iconColor: "#7C3AED" },
  { label: "AI Matches Found", value: "156", change: "High quality candidates", icon: "bi-stars", iconBg: "#EDE9FE", iconColor: "#7C3AED" },
  { label: "Pending Interviews", value: "24", change: "Scheduled this week", icon: "bi-calendar-check", iconBg: "#F5F0FF", iconColor: "#7C3AED", highlight: true },
];

export const myJobsList = [
  { id: "j1", title: "Senior Backend Engineer", status: "active", category: "Engineering", location: "London, UK", type: "Full-time", applicants: 124, aiMatches: 18, icon: "bi-code-slash" },
  { id: "j2", title: "Senior Product Designer", status: "active", category: "Design", location: "Remote", type: "Full-time", applicants: 89, aiMatches: 12, icon: "bi-pencil" },
  { id: "j3", title: "DevOps Engineer", status: "draft", category: "Engineering", location: "Berlin, DE", type: "Full-time", applicants: 0, aiMatches: 0, icon: "bi-gear" },
  { id: "j4", title: "Marketing Manager", status: "closed", category: "Marketing", location: "New York, US", type: "Full-time", applicants: 56, aiMatches: 8, hired: "James Wilson", icon: "bi-megaphone" },
];

export const assessmentGenerator = {
  jobTitle: "Senior Frontend Engineer",
  questionCount: 4,
  duration: "45 Minutes",
  totalMarks: 100,
  passingThreshold: 70,
  skillTags: ["REACT 18", "REDUX TOOLKIT", "CORE WEB VITALS"],
  logicNote: "Questions were generated based on the 'Senior Frontend' job description, prioritizing React architecture and Performance Optimization skills.",
  questions: [
    { id: "q1", number: 1, text: "Explain the Virtual DOM reconciliation process in React and how key props influence it.", tags: [{ label: "Conceptual", type: "default" }, { label: "High Priority", type: "success" }] },
    { id: "q2", number: 2, text: "Refactor the provided Redux-thunk code to use Redux Toolkit's createAsyncThunk and explain the benefits.", tags: [{ label: "Technical Skill", type: "default" }, { label: "Coding Required", type: "danger" }] },
    { id: "q3", number: 3, text: "How would you approach optimizing a page that has a 4-second First Contentful Paint? Describe your profiling steps.", tags: [{ label: "Performance", type: "default" }, { label: "Strategic", type: "primary" }] },
  ],
};

export const aiRecommendation = {
  candidateId: "99201",
  candidateName: "Sarah Mitchell",
  jobTitle: "Senior UI Designer",
  confidence: 95,
  summary: "Sarah Mitchell demonstrates exceptional proficiency in visual hierarchy and interaction design. Her portfolio and assessment results indicate a 92% retention rate for similar roles. Recommended for immediate interview scheduling.",
  metrics: [
    { title: "Top 1% in Logic", desc: "Scored in the top percentile on cognitive assessment modules.", icon: "bi-lightbulb", color: "#D1FAE5" },
    { title: "Perfect Cultural Fit", desc: "Strong alignment with company core values and team dynamics.", icon: "bi-heart", color: "#EDE9FE" },
    { title: "High Growth Delta", desc: "Demonstrates rapid learning velocity in technical assessments.", icon: "bi-graph-up", color: "#F3F4F6" },
    { title: "Portfolio Excellence", desc: "Visual execution exceeds industry benchmarks for the role.", icon: "bi-bullseye", color: "#CCFBF1" },
  ],
  competencies: [
    ["UI Precision & Craft", 98],
    ["UX Strategy & Logic", 92],
    ["Stakeholder Management", 85],
    ["Design System Architecture", 96],
  ],
  aiInsight: "Candidate demonstrates a 'Recursive Design Pattern' in portfolio case studies — iterating on user feedback loops with measurable KPI improvements.",
  predictions: [
    { label: "Onboarding Speed", status: "high" },
    { label: "Innovation Contribution", status: "high" },
    { label: "Team Synergy", status: "medium" },
  ],
};

export const emailInvitations = {
  selectedCount: 4,
  template: "Standard Invitation",
  subject: "Exciting Opportunity: Next Steps with HireAI Engineering",
  bodyIntro: "Hi {candidate_name},",
  bodyText: "We were impressed by your profile and would like to invite you to the next stage of our hiring process. Please complete the assessment below at your earliest convenience.",
  assessmentTitle: "Fullstack Engineering Assessment",
  assessmentDuration: "45 Minutes",
  candidates: [
    { id: "inv1", name: "Marco Verratti", role: "Senior Frontend Dev", avatar: "https://i.pravatar.cc/40?img=18" },
    { id: "inv2", name: "Elena Gilbert", role: "UI Engineer", avatar: "https://i.pravatar.cc/40?img=1" },
    { id: "inv3", name: "Chen Wei", role: "Full Stack Dev", avatar: "https://i.pravatar.cc/40?img=9" },
    { id: "inv4", name: "Jordan Smith", role: "React Developer", avatar: "https://i.pravatar.cc/40?img=15" },
  ],
  aiInsight: "These candidates have a 94% average match score for this role. Sending invitations today increases acceptance rates by 22%.",
};

export const applicationSubmitted = {
  referenceId: "APP-82910-XC",
  message: "Our AI is currently analyzing your profile for the best match. You'll receive real-time updates as the recruitment engine processes your data.",
  statusLabel: "AI Engine Analysis in Progress",
  eta: "Usually takes 2-5 minutes to generate initial match score",
};
