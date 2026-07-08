import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApplicationById } from "../../services/applicationService";
import StatusBadge from "../../components/common/StatusBadge";
import CircleProgress from "../../components/common/CircleProgress";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import BackButton from "../../components/common/BackButton";

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await getApplicationById(id);
        if (!cancelled) setApp(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <LoadingState message="Loading application..." />;

  if (!app) {
    return (
      <EmptyState
        icon="bi-file-earmark-text"
        title="Application not found"
        description="This application may have been removed or you don't have access to it."
        action={
          <button className="btn-primary-custom" onClick={() => navigate("/candidate/applications")}>
            Back to Applications
          </button>
        }
      />
    );
  }

  const isPending = app.status === "pending" || app.status === "reviewing";
  const isRejected = app.status === "rejected";
  const isAccepted = app.status === "interviewing" || app.status === "accepted";

  return (
    <>
      <BackButton fallbackTo="/candidate/applications" label="Back to Applications" />
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20, fontSize: 13, flexWrap: "wrap" }}>
        <span style={{ cursor: "pointer", color: "var(--primary)" }} onClick={() => navigate("/candidate/applications")}>
          Applications
        </span>
        <i className="bi bi-chevron-right text-muted"></i>
        <span style={{ color: "var(--text-muted)" }}>{app.jobTitle}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{app.jobTitle}</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Applied {app.appliedAt} at <strong>{app.company}</strong>
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 16px" }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Application Status</span>
          <StatusBadge status={app.status} />
        </div>
      </div>

      {isPending && (
        <div className="hcard" style={{ padding: 60, textAlign: "center" }}>
          <div style={{
            width: 72, height: 72, background: "var(--primary-bg)", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
          }}>
            <i className="bi bi-hourglass-split" style={{ fontSize: 32, color: "var(--primary)" }}></i>
          </div>
          <h2 style={{ fontWeight: 800, marginBottom: 12 }}>Application Under Review</h2>
          <p style={{ color: "var(--text-muted)", maxWidth: 460, margin: "0 auto 28px", lineHeight: 1.7 }}>
            Your application and assessment have been submitted successfully. Our recruitment team is currently
            reviewing your profile. You will receive an update once a decision has been made.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn-primary-custom" onClick={() => navigate(`/candidate/jobs/${app.jobId}/assessment`)}>
              Take Assessment
            </button>
            <button className="btn-outline-custom" onClick={() => navigate("/candidate/applications")}>
              View All Applications
            </button>
          </div>
        </div>
      )}

      {isRejected && app.matchScore == null && (
        <div className="hcard" style={{ padding: 40, textAlign: "center" }}>
          <h2 style={{ fontWeight: 800, marginBottom: 12 }}>Application Status: Rejected</h2>
          <p style={{ color: "var(--text-muted)", maxWidth: 460, margin: "0 auto 28px", lineHeight: 1.7 }}>
            Thank you for your interest. The recruiter has decided not to move forward with your application at this time.
          </p>
          <button type="button" className="btn-primary-custom" onClick={() => navigate("/candidate/jobs")}>
            Browse More Jobs
          </button>
        </div>
      )}

      {isRejected && app.matchScore != null && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="hcard" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
                <CircleProgress value={app.matchScore} size={110} />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Application Status: Rejected</div>
                  <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>
                    Thank you for your interest in the position. After careful review, we will not be moving
                    forward with your application at this time.
                  </p>
                  <button
                    className="btn-primary-custom"
                    style={{ marginTop: 10 }}
                    onClick={() => navigate(`/candidate/feedback?applicationId=${app.id}`)}
                  >
                    <i className="bi bi-stars me-2"></i>View AI Feedback
                  </button>
                </div>
              </div>
              {app.skills && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {app.skills.map((s) => <span key={s} className="skill-tag">{s}</span>)}
                </div>
              )}
            </div>

            {app.skillInsights && (
              <div className="hcard" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontWeight: 700 }}>AI Skill Insights</div>
                  <button
                    style={{ fontSize: 13, color: "var(--primary)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => navigate(`/candidate/feedback?applicationId=${app.id}`)}
                  >
                    View Full Report ↗
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {app.skillInsights.map(([label, val]) => (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: "var(--text-muted)" }}>{label}</span>
                        <span style={{ fontWeight: 600 }}>{val}%</span>
                      </div>
                      <div className="match-bar">
                        <div className="match-bar-fill" style={{ width: `${val}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {app.nextSteps && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="hcard" style={{ padding: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 16 }}>Next Steps</div>
                {app.nextSteps.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: step.done ? "var(--success)" : step.active ? "var(--primary)" : "var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {step.done ? (
                        <i className="bi bi-check text-white" style={{ fontSize: 14 }}></i>
                      ) : (
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: step.active ? "#fff" : "var(--text-muted)" }}></div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: step.active ? "var(--primary)" : "var(--text-dark)" }}>
                        {step.label}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{step.sub}</div>
                      {step.person && (
                        <div style={{ fontSize: 11, background: "var(--body-bg)", padding: "4px 8px", borderRadius: 6, marginTop: 4 }}>
                          {step.person}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {app.sentiment && (
                <div className="hcard" style={{ padding: 20, background: "linear-gradient(135deg, #F5F0FF, #EDE9FE)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <i className="bi bi-stars" style={{ color: "var(--primary)" }}></i>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "var(--primary)" }}>AI Sentiment Analysis</span>
                  </div>
                  <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--text-dark)", lineHeight: 1.6, marginBottom: 10 }}>
                    &ldquo;{app.sentiment.quote}&rdquo;
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <i className="bi bi-emoji-smile" style={{ color: "var(--success)" }}></i>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--success)" }}>{app.sentiment.score}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isAccepted && (
        <div className="hcard" style={{ padding: 40, textAlign: "center" }}>
          <div style={{
            width: 72, height: 72, background: "#D1FAE5", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
          }}>
            <i className="bi bi-check-circle-fill" style={{ fontSize: 36, color: "var(--success)" }}></i>
          </div>
          <h2 style={{ fontWeight: 800, marginBottom: 12 }}>You&apos;ve been shortlisted! 🎉</h2>
          <p style={{ color: "var(--text-muted)", maxWidth: 460, margin: "0 auto 28px", lineHeight: 1.7 }}>
            Congratulations! The recruiter has reviewed your profile and selected you for the next stage.
            You will receive further instructions shortly.
          </p>
          <button className="btn-primary-custom" onClick={() => navigate(`/candidate/jobs/${app.jobId}/assessment`)}>
            View Assessment
          </button>
        </div>
      )}
    </>
  );
}