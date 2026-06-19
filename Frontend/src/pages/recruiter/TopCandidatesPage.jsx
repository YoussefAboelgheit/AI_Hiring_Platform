import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTopCandidates } from "../../services/recruiterService";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";

export default function TopCandidatesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopCandidates()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading rankings..." />;
  if (!data) return null;

  const { podium, rest } = data;
  const podiumOrder = [podium[1], podium[0], podium[2]];

  return (
    <>
      <BackButton fallbackTo="/recruiter/dashboard" label="Back to Dashboard" />
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, fontSize: 13, flexWrap: "wrap" }}>
        <span style={{ cursor: "pointer", color: "var(--primary)" }} onClick={() => navigate("/recruiter/dashboard")}>
          Recruitment
        </span>
        <i className="bi bi-chevron-right text-muted"></i>
        <span style={{ cursor: "pointer", color: "var(--primary)" }} onClick={() => navigate("/recruiter/applications")}>
          Senior Product Designer
        </span>
        <i className="bi bi-chevron-right text-muted"></i>
        <span style={{ color: "var(--primary)", fontWeight: 600 }}>Top Candidates</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Top 10 Candidate Rankings</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>Ranked by AI score based on CV, assessment, and skill match.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn-outline-custom" style={{ fontSize: 13 }}><i className="bi bi-sliders me-2"></i>Refine Metrics</button>
          <button type="button" className="btn-primary-custom" style={{ fontSize: 13 }}><i className="bi bi-share me-2"></i>Export Report</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1fr", gap: 16, marginBottom: 28, alignItems: "end" }}>
        {podiumOrder.map((c) => {
          const isFirst = c.rank === 1;
          return (
            <div
              key={c.rank}
              className="hcard"
              style={{
                padding: 24,
                textAlign: "center",
                border: isFirst ? "2px solid var(--primary)" : "1px solid var(--border)",
                position: "relative",
              }}
            >
              {isFirst && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "var(--primary)", color: "#fff", fontSize: 12, fontWeight: 800, padding: "3px 14px", borderRadius: 20 }}>
                  #1
                </div>
              )}
              {!isFirst && (
                <div style={{ fontSize: 32, fontWeight: 900, color: "#D1D5DB", marginBottom: 8 }}>#{c.rank}</div>
              )}
              <img
                src={c.avatar}
                alt={c.name}
                style={{
                  width: isFirst ? 72 : 56,
                  height: isFirst ? 72 : 56,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: isFirst ? "3px solid var(--primary)" : "2px solid var(--border)",
                  marginBottom: 10,
                }}
              />
              <div style={{ fontWeight: 800, fontSize: isFirst ? 18 : 15, marginBottom: 2 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>{c.title}</div>
              <div style={{ fontSize: isFirst ? 38 : 28, fontWeight: 900, color: "var(--primary)", marginBottom: 4 }}>{c.finalScore}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12 }}>FINAL SCORE</div>
              {isFirst && c.technical != null && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[["TECHNICAL", c.technical], ["CULTURAL", c.cultural]].map(([l, v]) => (
                    <div key={l} style={{ background: "var(--body-bg)", borderRadius: 8, padding: "8px" }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{l}</div>
                      <div style={{ fontWeight: 800, fontSize: 20, color: "var(--primary)" }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", fontSize: 12 }}>
                <i className="bi bi-check-circle-fill" style={{ color: "var(--success)" }}></i>
                <span style={{ color: "var(--text-muted)" }}>Match Confidence</span>
                <span style={{ fontWeight: 700, color: "var(--success)" }}>{c.confidence}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hcard" style={{ overflow: "hidden" }}>
        <table className="htable">
          <thead>
            <tr><th>Rank & Candidate</th><th>Score</th><th>Match</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {rest.map((c) => (
              <tr key={c.rank}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontWeight: 700, color: "var(--text-muted)", width: 28 }}>#{c.rank}</span>
                    <img src={c.avatar} alt="" style={{ width: 36, height: 36, borderRadius: "50%" }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.title}</div>
                    </div>
                  </div>
                </td>
                <td><span style={{ fontWeight: 800, color: "var(--primary)", fontSize: 16 }}>{c.score}</span></td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="match-bar" style={{ width: 100 }}>
                      <div className="match-bar-fill" style={{ width: `${c.match}%` }}></div>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.match}% Match</span>
                  </div>
                </td>
                <td>
                  <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18 }}>
                    ···
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button type="button" className="btn-outline-custom" onClick={() => navigate("/recruiter/applications")}>
          View Full Ranking ({rest.length + podium.length} Total Candidates)
        </button>
      </div>
    </>
  );
}
