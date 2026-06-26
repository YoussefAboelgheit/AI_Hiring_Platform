import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs, deleteJob } from "../../services/jobService";
import LoadingState from "../../components/common/LoadingState";
import toast from "react-hot-toast";

export default function JobManagementPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (err) {
      toast.error(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteJob(id);
      toast.success("Job deleted");
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Delete failed");
    }
  };

  if (loading) return <LoadingState message="Loading jobs..." />;

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
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(job._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center" }}>
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <button
            className="btn btn-primary"
            style={{ marginTop: 12 }}
            onClick={() => navigate("/admin/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
