import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAIRecommendation } from "../../services/recruiterService";
import CircleProgress from "../../components/common/CircleProgress";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";

export default function AIRecommendationPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAIRecommendation().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading AI recommendation..." />;
  if (!data) return null;

  return (
    <>
      <BackButton fallbackTo="/recruiter/applications" label="Back to Applicants" />
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20, fontSize: 13, flexWrap: "wrap" }}>
        <span style={{ cursor: "pointer", color: "var(--primary)" }} onClick={() => navigate("/recruiter/applications")}>Applications</span>
        <i className="bi bi-chevron-right text-muted" aria-hidden="true" />
        <span style={{ color: "var(--text-muted)" }}>{data.jobTitle}</span>
        <i className="bi bi-chevron-right text-muted" aria-hidden="true" />
        <span style={{ color: "var(--text-muted)" }}>Candidate ID: {data.candidateId}</span>
      </div>

      <div className="hcard" style={{ padding: 28, marginBottom: 20, border: "2px solid var(--primary)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 28, alignItems: "start" }} className="grid-aside-main">
          <div style={{ textAlign: "center" }}>
            <CircleProgress value={data.confidence} size={140} stroke={10} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginTop: 8 }}>CONFIDENCE</div>
            <span className="ai-badge mt-2 d-inline-flex"><i className="bi bi-stars" /> AI RECOMMENDATION</span>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Candidate Synthesis</h1>
              <button type="button" className="btn-primary-custom" style={{ fontSize: 13 }}><i className="bi bi-download me-2" />Export Analysis</button>
            </div>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 20 }}>{data.summary}</p>
        <div className="grid-stats-4">
              {data.metrics.map((m) => (
                <div key={m.title} style={{ background: m.color, borderRadius: 12, padding: 14 }}>
                  <i className={`bi ${m.icon} mb-2 d-block`} style={{ fontSize: 18 }} aria-hidden="true" />
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-aside-main mb-4">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="hcard" style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 16 }}>Competency Heatmap</div>
            {data.competencies.map(([label, val]) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 700 }}>{val}/100</span>
                </div>
                <div className="match-bar"><div className="match-bar-fill" style={{ width: `${val}%` }} /></div>
              </div>
            ))}
          </div>

          <div className="hcard" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <i className="bi bi-stars" style={{ color: "var(--primary)" }} aria-hidden="true" />
              <span style={{ fontWeight: 700 }}>AI Insight</span>
            </div>
            <p style={{ fontSize: 14, fontStyle: "italic", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16 }}>&ldquo;{data.aiInsight}&rdquo;</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" className="btn-outline-custom" style={{ fontSize: 13 }}>Compare with Average</button>
              <button type="button" className="btn btn-link p-0" style={{ fontSize: 13, color: "var(--primary)", fontWeight: 600 }}>See Data Sources</button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="hcard" style={{ padding: 20, background: "var(--primary-bg)" }}>
            <div style={{ fontWeight: 700, marginBottom: 14 }}>Hiring Success Prediction</div>
            {data.predictions.map((p) => (
              <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 13 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.status === "high" ? "var(--success)" : "var(--warning)" }} />
                {p.label}
              </div>
            ))}
          </div>
          <div className="hcard" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Verified Profile</div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>Identity and credentials verified via Blockchain Ledger on June 12, 2024.</p>
          </div>
          <button type="button" className="btn-primary-custom w-100" style={{ padding: 14 }}>
            <i className="bi bi-calendar-event me-2" />Schedule Interview
          </button>
        </div>
      </div>
    </>
  );
}
