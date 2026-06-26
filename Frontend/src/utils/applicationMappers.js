function formatAppliedAt(dateValue) {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function mapStatus(status) {
  const normalized = String(status || "Pending").toLowerCase();

  if (normalized === "pending") return "pending";
  if (normalized === "reviewed") return "reviewing";
  if (normalized === "accepted") return "accepted";
  if (normalized === "rejected") return "rejected";
  return normalized;
}

function statusLabel(status) {
  const labels = {
    pending: "Pending review",
    reviewing: "Under review",
    accepted: "Accepted",
    rejected: "Rejected",
  };

  return labels[mapStatus(status)] || status;
}

export function mapApplicationForList(application) {
  const job = application.job || {};
  const recruiter = job.recruiter || {};
  const company = recruiter.name || "HireAI Recruiter";

  return {
    id: application._id,
    jobId: job._id,
    jobTitle: job.title || "Untitled role",
    company,
    logo: recruiter.profile_image || recruiter.company_logo || "",
    status: mapStatus(application.status),
    statusLabel: statusLabel(application.status),
    appliedAt: formatAppliedAt(application.createdAt),
    matchScore: null,
    finalScore: null,
    rank: null,
  };
}

export function mapApplicationForDetail(application) {
  const listItem = mapApplicationForList(application);

  return {
    ...listItem,
    cvUrl: application.CV || null,
    jobLocation: application.job?.location || "",
    jobWorkplace: application.job?.workplace || "",
    jobType: application.job?.jobType || "",
  };
}
