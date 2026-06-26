export const queryKeys = {
  categories: ["categories"],
  jobs: {
    all: ["jobs"],
    candidateList: (filters) => ["jobs", "candidate", filters],
  },
};
