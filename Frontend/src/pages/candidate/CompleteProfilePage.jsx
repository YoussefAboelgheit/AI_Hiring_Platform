import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { getCompleteProfileDefaults, saveCompleteProfile } from "../../services/profileService";
import { resolveAvatar } from "../../services/authService";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const avatarInputRef = useRef(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    getCompleteProfileDefaults().then((defaults) => {
      setForm({ name: defaults.name, email: defaults.email, phone: defaults.phone });
      setAvatarPreview(defaults.avatar || resolveAvatar({ name: defaults.name }));
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const openAvatarPicker = () => avatarInputRef.current?.click();

  const handleAvatarChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected || !selected.type.startsWith("image/")) return;

    setAvatarPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(selected);
    });
    setAvatarFile(selected);
    e.target.value = "";
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await saveCompleteProfile({
        ...form,
        resume: file?.name,
        avatarFile,
      });
      refreshUser();
      navigate("/candidate/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading..." />;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div className="hcard" style={{ maxWidth: 560, width: "100%", padding: "clamp(24px, 5vw, 40px) clamp(20px, 4vw, 36px)" }}>
        <BackButton fallbackTo="/candidate/dashboard" label="Back to Dashboard" />
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, background: "var(--primary-bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <i className="bi bi-person-fill" style={{ fontSize: 22, color: "var(--primary)" }} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Complete Your Profile</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>Build your personal brand and let AI find your perfect career match.</p>
        </div>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <button
            type="button"
            onClick={openAvatarPicker}
            aria-label="Upload profile picture"
            style={{
              position: "relative",
              display: "inline-block",
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <img
              src={avatarPreview}
              alt="Profile preview"
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                objectFit: "cover",
                filter: avatarFile ? "none" : "grayscale(20%)",
                display: "block",
              }}
            />
            <span
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--primary)",
                border: "2px solid #fff",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <i className="bi bi-plus" style={{ fontSize: 16 }} aria-hidden="true" />
            </span>
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>Profile Picture (Recommended 400x400)</div>
        </div>

        <div className="grid-2-col mb-3">
          {[
            { label: "Full Name", key: "name", icon: "bi-person", placeholder: "John Doe" },
            { label: "Email Address", key: "email", icon: "bi-envelope", placeholder: "john@example.com" },
          ].map(({ label, key, icon, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>{label}</label>
              <div className="auth-input-wrap">
                <i className={`bi ${icon} text-muted`} aria-hidden="true" />
                <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Phone Number</label>
          <div className="auth-input-wrap">
            <i className="bi bi-telephone text-muted" aria-hidden="true" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Resume / CV</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); setFile(e.dataTransfer.files[0]); }}
            onClick={() => document.getElementById("profile-cv").click()}
            style={{ border: `2px dashed ${dragging ? "var(--primary)" : "var(--border)"}`, borderRadius: 12, padding: "32px 20px", textAlign: "center", cursor: "pointer", background: "var(--body-bg)" }}
          >
            <i className="bi bi-file-earmark-arrow-up" style={{ fontSize: 32, color: "var(--primary)", display: "block", marginBottom: 8 }} aria-hidden="true" />
            <div style={{ fontWeight: 600, fontSize: 14 }}>{file ? file.name : "Click to upload or drag and drop"}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>PDF, DOCX (Max. 5MB)</div>
            <input id="profile-cv" type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => setFile(e.target.files[0])} />
          </div>
        </div>

        <div style={{ background: "var(--primary-bg)", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10, marginBottom: 24, fontSize: 13, color: "var(--primary)" }}>
          <i className="bi bi-stars" aria-hidden="true" />
          Our AI will automatically parse your resume to suggest relevant jobs.
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button type="button" className="btn-primary-custom" style={{ flex: 2 }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : <>Save Profile <i className="bi bi-arrow-right ms-2" /></>}
          </button>
          <button type="button" className="btn-outline-custom" style={{ flex: 1 }} onClick={() => navigate("/candidate/dashboard")}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
