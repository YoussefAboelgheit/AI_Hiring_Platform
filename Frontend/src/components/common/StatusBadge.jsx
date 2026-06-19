const configs = {
  reviewing: { label: "Under Review", cls: "badge-reviewing" },
  pending: { label: "Pending", cls: "badge-pending" },
  shortlisted: { label: "Shortlisted", cls: "badge-shortlisted" },
  interviewing: { label: "Interviewing", cls: "badge-interviewing" },
  rejected: { label: "Rejected", cls: "badge-rejected" },
  accepted: { label: "Accepted", cls: "badge-accepted" },
  "in review": { label: "In Review", cls: "badge-reviewing" },
};

export default function StatusBadge({ status }) {
  const cfg = configs[status?.toLowerCase()] || { label: status, cls: "badge-pending" };
  return <span className={`badge-status ${cfg.cls}`}>{cfg.label}</span>;
}
