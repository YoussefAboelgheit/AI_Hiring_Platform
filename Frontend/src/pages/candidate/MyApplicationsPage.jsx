import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyApplications } from "../../services/applicationService";
import { queryKeys } from "../../constants/queryKeys";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";

export default function MyApplicationsPage() {
  const navigate = useNavigate();

  const {
    data: applications = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.applications.mine,
    queryFn: getMyApplications,
    staleTime: 60 * 1000,
  });

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1>My Applications</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Track all your job applications and their current status.
          </p>
        </div>
        {isFetching && !isLoading && (
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            <i className="bi bi-arrow-repeat me-1" aria-hidden="true" />
            Refreshing...
          </span>
        )}
      </div>

      {isError && (
        <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "12px 16px", borderRadius: 10, fontSize: 14, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span>{error?.message || "Failed to load applications."}</span>
          <button type="button" className="btn-outline-custom" style={{ fontSize: 13 }} onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <LoadingState message="Loading applications..." />
      ) : applications.length === 0 && !isError ? (
        <EmptyState
          icon="bi-file-earmark-text"
          title="No applications yet"
          description="Start exploring jobs and submit your first application."
          action={
            <button type="button" className="btn-primary-custom" onClick={() => navigate("/candidate/jobs")}>
              Browse Jobs
            </button>
          }
        />
      ) : (
        <div className="hcard table-responsive-wrap" style={{ overflow: "hidden" }}>
          <table className="htable">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Workplace</th>
                <th>Applied</th>
                <th>Status</th>
                <th aria-label="Actions" />
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
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.company)}&background=F3F5FB&color=1D2445&size=32`; }}
                      />
                      <span style={{ fontWeight: 600 }}>{app.jobTitle}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{app.company}</td>
                  <td style={{ color: "var(--text-muted)" }}>{app.jobWorkplace || "—"}</td>
                  <td style={{ color: "var(--text-muted)" }}>{app.appliedAt}</td>
                  <td><StatusBadge status={app.status} /></td>
                  <td><i className="bi bi-chevron-right text-muted" aria-hidden="true" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
