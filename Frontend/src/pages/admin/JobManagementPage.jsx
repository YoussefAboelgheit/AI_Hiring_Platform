import { useEffect, useState } from "react";

import { getJobs, deleteJob, adminCloseJob } from "../../services/jobService";
import { getErrorMessage } from "../../utils/errorMessages";

import LoadingState from "../../components/common/LoadingState";
import toast from "react-hot-toast";

export default function JobManagementPage() {

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null); // job pending deletion, or null
  const [deleting, setDeleting] = useState(false);
  const [closeTarget, setCloseTarget] = useState(null); // job pending closing, or null
  const [closing, setClosing] = useState(false);

  const loadJobs = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const data = await getJobs({ page: pageNumber, limit: 10 });
      setJobs(data.jobs || []);
      setPage(data.page || 1);
      setTotalPages(data.pages || 1);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load jobs"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleDelete = (job) => setDeleteTarget(job);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteJob(deleteTarget._id);
      toast.success("Job deleted");
      setDeleteTarget(null);
      loadJobs(page);
    } catch (err) {
      toast.error(getErrorMessage(err, "Delete failed"));
    } finally {
      setDeleting(false);
    }
  };

  // الأدمن يقدر يقفل جوب مفتوح بس (مينفعش يفتحه تاني ولا يرجعه درافت)
  const handleCloseClick = (job) => setCloseTarget(job);

  const handleConfirmClose = async () => {
    if (!closeTarget) return;
    setClosing(true);
    try {
      await adminCloseJob(closeTarget._id);
      toast.success("Job closed");
      setCloseTarget(null);
      loadJobs(page);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to close job"));
    } finally {
      setClosing(false);
    }
  };

  if (loading && jobs.length === 0) return <LoadingState message="Loading jobs..." />;

  return (
    <div className="container-fluid py-4">
      <div className="page-header-row">
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Manage Jobs</h1>
        <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>
          Review and delete job postings.
        </p>
        <div className="hcard w-100" style={{ padding: 28, marginTop: 20 }}>
          <table className="table table-hover align-middle w-100">
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Category</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id}>
                  <td>{job.title}</td>
                  <td>{job.recruiter?.company_logo ? (<img src={job.recruiter.company_logo} alt="Company logo" style={{ width: "45px", height: "45px", objectFit: "cover" }} className="rounded shadow-sm" />) : null}</td>
                  <td>{job.category?.name || "Uncategorized"}</td>
                  <td>
                    <span
                      className={`badge ${job.status === "Open"
                          ? "text-bg-success"
                          : job.status === "Closed"
                            ? "text-bg-secondary"
                            : "text-bg-warning"
                        }`}
                    >
                      {job.status || "Open"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 76 }}>
                        {job.status === "Open" && (
                          <button
                            className="btn btn-sm btn-outline-secondary w-100"
                            onClick={() => handleCloseClick(job)}
                          >
                            Close
                          </button>
                        )}
                      </div>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(job)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn-outline-custom"
                  style={{ padding: "6px 12px", fontSize: 12 }}
                  disabled={page <= 1 || loading}
                  onClick={() => loadJobs(page - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn-outline-custom"
                  style={{ padding: "6px 12px", fontSize: 12 }}
                  disabled={page >= totalPages || loading}
                  onClick={() => loadJobs(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Delete confirmation modal ===== */}
      {deleteTarget && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
            <div className="modal-content" style={{ borderRadius: 16, border: "none" }}>
              <div className="modal-body" style={{ padding: 28, textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <i className="bi bi-trash" style={{ color: "#DC2626", fontSize: 20 }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Delete this job?</div>
                <p style={{ color: "var(--text-muted)", fontSize: 13.5, margin: 0 }}>
                  Are you sure you want to delete "{deleteTarget.title}"? This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer" style={{ border: "none", padding: "0 24px 24px", justifyContent: "center" }}>
                <button type="button" className="btn btn-light" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Close job confirmation modal ===== */}
      {closeTarget && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
            <div className="modal-content" style={{ borderRadius: 16, border: "none" }}>
              <div className="modal-body" style={{ padding: 28, textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <i className="bi bi-lock" style={{ color: "#D97706", fontSize: 20 }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Close this job?</div>
                <p style={{ color: "var(--text-muted)", fontSize: 13.5, margin: 0 }}>
                  Are you sure you want to close "{closeTarget.title}"? Candidates won't be able to apply anymore.
                </p>
              </div>
              <div className="modal-footer" style={{ border: "none", padding: "0 24px 24px", justifyContent: "center" }}>
                <button type="button" className="btn btn-light" onClick={() => setCloseTarget(null)} disabled={closing}>Cancel</button>
                <button type="button" className="btn btn-warning" onClick={handleConfirmClose} disabled={closing}>
                  {closing ? "Closing..." : "Close Job"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}