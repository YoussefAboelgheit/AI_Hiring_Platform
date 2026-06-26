import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyApplications } from "../../services/applicationService";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import toast from "react-hot-toast";

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyApplications();
        if (!cancelled) setApplications(data);
      } catch (err) {
        if (!cancelled) {
          const message = err.message || "Failed to load applications.";
          setError(message);
          toast.error(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>My Applications</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
        Track all your job applications and their current status.
      </p>

      {loading ? (
        <LoadingState message="Loading applications..." />
      ) : error ? (
        <EmptyState
          icon="bi-exclamation-circle"
          title="Failed to load applications"
          description={error}
          action={
            <button type="button" className="btn-outline-custom" onClick={() => window.location.reload()}>
              Retry
            </button>
          }
        />
      ) : applications.length === 0 ? (
        <EmptyState
          icon="bi-file-earmark-text"
          title="No applications yet"
          description="Start exploring jobs and submit your first application."
          action={
            <button className="btn-primary-custom" onClick={() => navigate("/candidate/jobs")}>
              Browse Jobs
            </button>
          }
        />
      ) : (
        <div className="hcard" style={{ overflow: "hidden" }}>
          <table className="htable">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Applied</th>
                <th>Match Score</th>
                <th>Final Score</th>
                <th>Rank</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/candidate/applications/${app.id}`)}
                >
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img
                        src={app.logo}
                        alt=""
                        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)" }}
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${app.company}&background=EDE9FE&color=7C3AED&size=32`; }}
                      />
                      <span style={{ fontWeight: 600 }}>{app.jobTitle}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{app.company}</td>
                  <td style={{ color: "var(--text-muted)" }}>{app.appliedAt}</td>
                  <td>
                    {app.matchScore != null ? (
                      <span className="match-pill"><i className="bi bi-stars"></i>{app.matchScore}%</span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>
                  <td>
                    {app.finalScore != null ? (
                      <span style={{ fontWeight: 700, color: "var(--primary)" }}>{app.finalScore}</span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>
                  <td>
                    {app.rank != null ? (
                      <span style={{ fontWeight: 700 }}>#{app.rank}</span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>
                  <td><StatusBadge status={app.status} /></td>
                  <td><i className="bi bi-chevron-right text-muted"></i></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
