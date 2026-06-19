import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecruiterFeedbackReport } from "../../services/feedbackService";
import CircleProgress from "../../components/common/CircleProgress";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";

export default function RecruiterFeedbackPage() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecruiterFeedbackReport()
      .then(setReport)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading feedback report..." />;
  if (!report) return null;

  const { candidateName, jobTitle, matchScore, executiveSummary, metrics, strengths, growthAreas, interviewQuestions } = report;

  return (
    <>
      <BackButton fallbackTo="/recruiter/feedback" label="Back to Feedback" />
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, fontSize: 13, flexWrap: "wrap" }}>
        <span style={{ cursor: "pointer", color: "var(--primary)" }} onClick={() => navigate("/recruiter/applications")}>
          Applications
        </span>
        <i className="bi bi-chevron-right text-muted"></i>
        <span style={{ color: "var(--text-muted)" }}>{candidateName}</span>
        <i className="bi bi-chevron-right text-muted"></i>
        <span style={{ color: "var(--text-muted)" }}>Feedback Report</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Feedback Report: {candidateName}</h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="ai-badge"><i className="bi bi-stars"></i>AI-Generated Analysis</span>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {jobTitle} · {matchScore}% Match Score
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn-outline-custom" style={{ fontSize: 13 }}><i className="bi bi-download me-2"></i>Export PDF</button>
          <button type="button" className="btn-primary-custom" style={{ fontSize: 13 }} onClick={() => navigate("/recruiter/applications")}>
            Move to Interview →
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, marginBottom: 20 }}>
        <div className="hcard" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <i className="bi bi-file-earmark-text" style={{ color: "var(--primary)" }}></i>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Executive Summary</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 20 }}>{executiveSummary}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {metrics.map(([k, v]) => (
              <div key={k} style={{ background: "var(--body-bg)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", fontWeight: 700 }}>{k}</div>
                <div style={{ fontWeight: 800, fontSize: 18, color: "var(--primary)" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hcard" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", marginBottom: 16 }}>
            Aggregate Match
          </div>
          <CircleProgress value={matchScore} size={110} />
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>Top 3% of candidates in the current talent pool.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {[
          { title: "Key Strengths", icon: "bi-check-circle-fill", color: "var(--success)", items: strengths },
          { title: "Growth Areas", icon: "bi-exclamation-triangle-fill", color: "var(--warning)", items: growthAreas },
        ].map(({ title, icon, color, items }) => (
          <div key={title} className="hcard" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <i className={`bi ${icon}`} style={{ color }}></i>
              <span style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 12, letterSpacing: 1 }}>{title}</span>
            </div>
            {items.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 6 }}></div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{item}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Supporting detail about this area of evaluation and relevant context.</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="hcard" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="ai-badge"><i className="bi bi-stars"></i>Targeted Interview Strategy</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, background: "#EDE9FE", color: "var(--primary)", padding: "3px 10px", borderRadius: 20 }}>
            STRATEGY: RIGOR & INNOVATION
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {interviewQuestions.map(({ type, focus, q }) => (
            <div key={type} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <span style={{ background: "var(--primary-bg)", color: "var(--primary)", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>{type}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Focus: {focus}</span>
              </div>
              <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--text-dark)", lineHeight: 1.6, margin: 0 }}>
                &ldquo;{q}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {[1, 2, 3].map((i) => (
            <img
              key={i}
              src={`https://i.pravatar.cc/28?img=${i}`}
              alt=""
              style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid #fff", marginLeft: i === 1 ? 0 : -8 }}
            />
          ))}
          <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: 8 }}>+3 &nbsp;Shared with the Design Leadership team.</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button type="button" style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Add Note
          </button>
          <button type="button" style={{ background: "none", border: "none", color: "var(--danger)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Reject Candidate
          </button>
        </div>
      </div>
    </>
  );
}
