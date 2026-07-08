import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmailInvitations, sendEmailInvitations } from "../../services/recruiterService";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";

export default function EmailInvitationsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    getEmailInvitations().then((res) => {
      setData(res);
      setCandidates(res.candidates);
    }).finally(() => setLoading(false));
  }, []);

  const removeCandidate = (id) => setCandidates((prev) => prev.filter((c) => c.id !== id));

  const handleSend = async () => {
    setSending(true);
    try {
      await sendEmailInvitations({ candidates: candidates.map((c) => c.id) });
      navigate("/recruiter/applications");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingState message="Loading invitations..." />;
  if (!data) return null;

  return (
    <>
      <BackButton fallbackTo="/recruiter/applications" label="Back to Applicants" />
      <div className="page-header-row">
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Email Invitations</h1>
      </div>

      <div className="grid-aside-wide">
        <div>
          <div className="hcard" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: "var(--text-muted)" }}>SELECTED CANDIDATES</span>
              <span style={{ background: "var(--primary)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{candidates.length} Selected</span>
            </div>
            {candidates.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <img src={c.avatar} alt="" style={{ width: 36, height: 36, borderRadius: "50%" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.role}</div>
                </div>
                <button type="button" className="btn btn-link p-0 text-muted" onClick={() => removeCandidate(c.id)} aria-label={`Remove ${c.name}`}>
                  <i className="bi bi-x-lg" />
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-link p-0 mt-3" style={{ color: "var(--primary)", fontWeight: 600, fontSize: 13 }}>
              <i className="bi bi-plus me-1" />Add More
            </button>
          </div>
          <div style={{ background: "var(--primary-bg)", borderRadius: 12, padding: 16, border: "1px solid #e2e2e2" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <i className="bi bi-stars" style={{ color: "var(--primary)" }} aria-hidden="true" />
              <span style={{ fontWeight: 700, fontSize: 13, color: "var(--primary)" }}>HireAI Insight</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>{data.aiInsight}</p>
          </div>
        </div>

        <div className="hcard" style={{ padding: 24 }}>
          <div style={{ fontWeight: 700, marginBottom: 20 }}>Invitation Preview</div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Template</label>
            <select className="form-select" style={{ borderRadius: 10, fontSize: 14 }}>
              <option>Template: {data.template}</option>
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Subject Line</label>
            <input className="form-control" defaultValue={data.subject} style={{ borderRadius: 10, fontSize: 14 }} />
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 20, minHeight: 200 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
              {["bi-type-bold", "bi-type-italic", "bi-list-ul", "bi-link-45deg"].map((icon) => (
                <button key={icon} type="button" className="btn btn-sm btn-light"><i className={`bi ${icon}`} aria-hidden="true" /></button>
              ))}
              <button type="button" className="btn btn-sm btn-outline-secondary ms-auto" style={{ fontSize: 11 }}>Insert Variable</button>
            </div>
            <p style={{ fontSize: 14, marginBottom: 12 }}>{data.bodyIntro}</p>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16 }}>{data.bodyText}</p>
            <div style={{ background: "var(--primary-bg)", borderRadius: 10, padding: 14, display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <i className="bi bi-clipboard-check" style={{ fontSize: 24, color: "var(--primary)" }} aria-hidden="true" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{data.assessmentTitle}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{data.assessmentDuration}</div>
              </div>
            </div>
            <a href="#portal" style={{ color: "var(--primary)", fontWeight: 600, fontSize: 13 }}>Access HireAI Portal</a>
          </div>
          <div style={{ display: "flex", gap: 16, marginBottom: 20, fontSize: 13 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="checkbox" defaultChecked /> Send copy to me</label>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="checkbox" defaultChecked /> Track link clicks</label>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" className="btn-outline-custom">Save Draft</button>
            <button type="button" className="btn-primary-custom" onClick={handleSend} disabled={sending || candidates.length === 0}>
              <i className="bi bi-send me-2" />{sending ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
