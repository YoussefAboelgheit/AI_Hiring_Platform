export const queryKeys = {
  categories: ["categories"],
  jobs: {
    all: ["jobs"],
    candidateList: (filters) => ["jobs", "candidate", filters],
  },
  applications: {
    mine: ["applications", "mine"],
    detail: (id) => ["applications", "detail", id],
  },
  assessments: {
    detail: (jobId) => ["assessments", jobId],
  },
};
