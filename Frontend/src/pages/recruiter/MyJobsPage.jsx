import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, Badge, Row, Col, Card } from "react-bootstrap";
import { getMyJobs } from "../../services/recruiterService";
import { deleteJob, closeJob, openJob } from "../../services/jobService";
import { useAuth } from "../../context/useAuth";
import LoadingState from "../../components/common/LoadingState";
import toast from "react-hot-toast";

const statusVariant = {
  Open: "success",
  Closed: "danger",
  Drafted: "secondary",
  Expired: "danger",
};

const statusAccent = { Open: "#10B981", Closed: "#EF4444", Drafted: "#9CA3AF", default: "#D1D5DB" };

// Gives each job category a consistent, distinct color instead of one flat gray icon everywhere.
const categoryPalette = [
  { bg: "#EDE9FE", color: "#7C3AED" },
  { bg: "#DBEAFE", color: "#2563EB" },
  { bg: "#D1FAE5", color: "#059669" },
  { bg: "#FEF3C7", color: "#B45309" },
  { bg: "#FCE7F3", color: "#DB2777" },
  { bg: "#E0F2FE", color: "#0284C7" },
];
function categoryColor(name = "General") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return categoryPalette[Math.abs(hash) % categoryPalette.length];
}

// One primary action + a Bootstrap Dropdown for everything else, so a job row never
// turns into a wall of buttons. react-bootstrap's Dropdown handles open/close-on-outside-click for us.
function JobActionsMenu({ items }) {
  return (
    <Dropdown align="end">
      <Dropdown.Toggle as="button" className="btn btn-light border" style={{ width: 36, height: 36, padding: 0 }} id="job-actions-toggle">
        <i className="bi bi-three-dots"></i>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {items.map((item) => (
          <Dropdown.Item key={item.label} className={item.danger ? "text-danger" : ""} disabled={item.disabled} onClick={item.onClick}>
            <i className={`bi ${item.icon} me-2`}></i>{item.pending ? item.pendingLabel : item.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default function MyJobsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [closing, setClosing] = useState(null);
  const [publishing, setPublishing] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const handlePublish = async (jobId, jobTitle) => {
    if (!window.confirm(`Publish "${jobTitle}" now? It will become visible to candidates immediately.`)) return;
    setPublishing(jobId);
    try {
      const updated = await openJob(jobId);
      setData((prev) => ({
        ...prev,
        jobs: prev.jobs.map((j) => (j._id === jobId ? { ...j, status: updated?.status || "Open" } : j)),
      }));
      toast.success("Job published!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to publish job.");
    } finally {
      setPublishing(null);
    }
  };

  const handleClose = async (jobId, jobTitle) => {
    if (!window.confirm(`Close "${jobTitle}"? Once closed, it can't be reopened.`)) return;
    setClosing(jobId);
    try {
      const updated = await closeJob(jobId);
      setData((prev) => ({
        ...prev,
        jobs: prev.jobs.map((j) => (j._id === jobId ? { ...j, status: updated?.status || "Closed" } : j)),
      }));
      toast.success("Job closed.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to close job.");
    } finally {
      setClosing(null);
    }
  };

  const handleDelete = async (jobId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) return;
    setDeleting(jobId);
    try {
      await deleteJob(jobId);
      setData((prev) => ({
        ...prev,
        jobs: prev.jobs.filter((j) => j._id !== jobId),
      }));
      toast.success("Job deleted successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete job.");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    if (user?._id) {
      getMyJobs(user._id)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <LoadingState message="Loading jobs..." />;
  if (!data) return null;

  const filteredJobs = data.jobs.filter((job) => statusFilter === "All" || job.status === statusFilter);
  const tabs = ["All", "Open", "Drafted", "Closed"];

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1>My Jobs</h1>
          <p className="text-muted mb-0">Manage your open positions and track applicant flow with HireAI.</p>
        </div>
        <button type="button" className="btn-primary-custom" onClick={() => navigate("/recruiter/jobs/new")}>
          <i className="bi bi-plus me-2" />Create Job
        </button>
      </div>

      <Row className="row-cols-1 row-cols-md-3 g-3 mb-4">
        {data.stats.map((s) => (
          <Col key={s.label}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value fs-3">{s.value}</div>
                  <div className="stat-change text-muted">{s.change}</div>
                </div>
                <div className="stat-icon" style={{ background: s.iconBg }}>
                  <i className={`bi ${s.icon}`} style={{ color: s.iconColor }} aria-hidden="true" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="d-flex justify-content-end mb-3">
        <Dropdown>
          <Dropdown.Toggle as="button" className="btn btn-light border btn-sm d-flex align-items-center gap-2">
            <i className="bi bi-funnel"></i>
            {statusFilter}
            <Badge bg="light" text="dark" className="border">{filteredJobs.length}</Badge>
          </Dropdown.Toggle>
          <Dropdown.Menu align="end">
            {tabs.map((tab) => {
              const count = tab === "All" ? data.jobs.length : data.jobs.filter((j) => j.status === tab).length;
              return (
                <Dropdown.Item key={tab} active={statusFilter === tab} onClick={() => setStatusFilter(tab)} className="d-flex justify-content-between align-items-center gap-3">
                  {tab} <Badge bg="light" text="dark" className="border">{count}</Badge>
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className="d-flex flex-column gap-3">
        {filteredJobs.length === 0 && (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center text-muted py-5">
              No {statusFilter !== "All" ? statusFilter.toLowerCase() : ""} jobs found.
            </Card.Body>
          </Card>
        )}

        {filteredJobs.map((job) => {
          const now = new Date();
          const deadline = job.applicationEnd ? new Date(job.applicationEnd) : null;
          const expired = deadline && deadline < now && job.status !== "Closed";
          const statusLabel = expired ? "Expired" : job.status;
          const variant = statusVariant[statusLabel] || "secondary";
          const catColor = categoryColor(job.category);

          return (
            <Card key={job.id} className="border-0 shadow-sm" style={{ borderLeft: `4px solid ${statusAccent[job.status] || statusAccent.default}` }}>
              <Card.Body>
                <Row className="align-items-center g-3">
                  <Col xs="auto">
                    <div style={{ width: 48, height: 48, background: catColor.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className={`bi ${job.icon}`} style={{ fontSize: 20, color: catColor.color }} aria-hidden="true" />
                    </div>
                  </Col>

                  <Col>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="fw-bold fs-6">{job.title}</span>
                      <Badge bg={variant} className="fw-semibold">{statusLabel}</Badge>
                    </div>
                    <div className="text-muted small">{job.category} · {job.location} · {job.type}</div>
                    <div className="mt-2">
                      <span className="skill-tag">
                        <i className="bi bi-people me-1" aria-hidden="true" />{job.applicants} {job.applicants === 1 ? "Applicant" : "Applicants"}
                      </span>
                    </div>
                  </Col>

                  <Col xs="auto" className="d-flex gap-2 align-items-center">
                    {job.status === "Drafted" ? (
                      <>
                        <button type="button" className="btn btn-light border btn-sm" onClick={() => navigate('/recruiter/applications', { state: { jobId: job._id } })}>
                          View Applicants
                        </button>
                        <button type="button" className="btn-primary-custom" style={{ fontSize: 13, padding: "7px 16px" }} onClick={() => handlePublish(job._id, job.title)} disabled={publishing === job._id}>
                          {publishing === job._id ? "Publishing..." : "Publish Job"}
                        </button>
                        <JobActionsMenu
                          items={[
                            { label: "Resume Editing", icon: "bi-pencil", onClick: () => navigate(`/recruiter/jobs/edit/${job._id}`) },
                            { label: "Manage Assessment", icon: "bi-clipboard-check", onClick: () => navigate(`/recruiter/jobs/${job._id}/assessment`) },
                            { label: "Delete", icon: "bi-trash", danger: true, onClick: () => handleDelete(job._id, job.title), disabled: deleting === job._id, pending: deleting === job._id, pendingLabel: "Deleting..." },
                          ]}
                        />
                      </>
                    ) : job.status === "Closed" ? (
                      <>
                        <button type="button" className="btn btn-light border btn-sm" onClick={() => navigate(`/recruiter/job/${job._id}`)}>View Applicants</button>
                        <JobActionsMenu
                          items={[
                            { label: "Manage Assessment", icon: "bi-clipboard-check", onClick: () => navigate(`/recruiter/jobs/${job._id}/assessment`) },
                            { label: "Delete", icon: "bi-trash", danger: true, onClick: () => handleDelete(job._id, job.title), disabled: deleting === job._id, pending: deleting === job._id, pendingLabel: "Deleting..." },
                          ]}
                        />
                      </>
                    ) : (
                      <>
                        <button type="button" className="btn btn-light border btn-sm" onClick={() => navigate('/recruiter/applications', { state: { jobId: job._id } })}>
                          View Applicants
                        </button>
                        <JobActionsMenu
                          items={[
                            { label: "Manage Assessment", icon: "bi-clipboard-check", onClick: () => navigate(`/recruiter/jobs/${job._id}/assessment`) },
                            { label: "Close Job", icon: "bi-x-circle", onClick: () => handleClose(job._id, job.title), disabled: closing === job._id, pending: closing === job._id, pendingLabel: "Closing..." },
                            { label: "Delete", icon: "bi-trash", danger: true, onClick: () => handleDelete(job._id, job.title), disabled: deleting === job._id, pending: deleting === job._id, pendingLabel: "Deleting..." },
                          ]}
                        />
                      </>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          );
        })}
      </div>
    </>
  );
}