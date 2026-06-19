import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApplicantsList } from "../../services/recruiterService";
import StatusBadge from "../../components/common/StatusBadge";
import CircleProgress from "../../components/common/CircleProgress";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";

export default function ApplicantsListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApplicantsList()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading applicants..." />;
  if (!data) return null;

  const { applicants, jobTitle, total } = data;

  return (
    <>
      <BackButton fallbackTo="/recruiter/applications" label="Back to Applications" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Applicants List</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>Ranked by AI match score · {jobTitle}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn-outline-custom" style={{ fontSize: 13 }} onClick={() => navigate("/recruiter/email-invitations")}>
            <i className="bi bi-envelope me-2"></i>Send Invitations
          </button>
          <button type="button" className="btn-outline-custom" style={{ fontSize: 13 }}><i className="bi bi-funnel me-2"></i>Filter</button>
          <button type="button" className="btn-outline-custom" style={{ fontSize: 13 }}><i className="bi bi-sort-down me-2"></i>Sort by Match</button>
          <button type="button" className="btn-primary-custom" style={{ fontSize: 13 }}><i className="bi bi-download me-2"></i>Export List</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {applicants.map((c, i) => (
          <div key={c.id} className="hcard" style={{ padding: 20, display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: i === 0 ? "var(--primary)" : "var(--body-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 16,
                color: i === 0 ? "#fff" : "var(--text-muted)",
                flexShrink: 0,
              }}
            >
              {c.rank}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <img src={c.avatar} alt="" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.email}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <StatusBadge status={c.status} />
                  {c.status === "shortlisted" && (
                    <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                      VERIFIED
                    </span>
                  )}
                </div>
              </div>
            </div>
            <CircleProgress value={Math.round((c.cvScore + c.skillMatch + c.assessmentScore) / 3)} size={72} stroke={6} />
            <div style={{ display: "flex", flex: 1, gap: 20 }}>
              {[["CV Relevance", c.cvScore], ["Assessment", c.assessmentScore]].map(([label, val]) => (
                <div key={label} style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span style={{ fontWeight: 700 }}>{val}/100</span>
                  </div>
                  <div className="match-bar">
                    <div className="match-bar-fill" style={{ width: `${val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                type="button"
                className="btn-primary-custom"
                style={{ fontSize: 13, padding: "8px 16px" }}
                onClick={() => navigate(`/recruiter/candidates/${c.id}`)}
              >
                View Candidate →
              </button>
              <button type="button" className="btn-outline-custom" style={{ fontSize: 13, padding: "7px 16px" }}>
                Add Note
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, padding: "16px 0" }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Showing 1-{applicants.length} of {total} applicants
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {["‹", "1", "2", "3", "...", "13", "›"].map((p, i) => (
            <button
              key={i}
              type="button"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: p === "1" ? "var(--primary)" : "#fff",
                color: p === "1" ? "#fff" : "var(--text-muted)",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
