export function mapJobForCard(job) {
  const company = job.recruiter?.name || "HireAI Recruiter";

  return {
    id: job._id,
    title: job.title,
    company,
    logo: job.recruiter?.profile_image || job.recruiter?.company_logo || "",
    location: job.location || "Remote",
    skills: job.skills ?? [],
    experience: job.requirements || "Experience details not specified",
    type: job.jobType,
    workplace: job.workplace,
    categoryName: job.category?.name || "General",
    applicationEnd: job.applicationEnd,
    badge: job.workplace === "Remote" ? "Remote friendly" : "",
  };
}
