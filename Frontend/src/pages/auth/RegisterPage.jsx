import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import AuthHeroPanel from "../../components/auth/AuthHeroPanel";
import BrandLogo from "../../components/common/BrandLogo";
import BackButton from "../../components/common/BackButton";
import styles from "./RegisterPage.module.css"; // 👈 الربط بالـ Module

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState("candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleRegister = async () => {
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Please fill in name, email, and password.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role,
      });

      navigate("/login", {
        replace: true,
        state: { message: result.message || "Account created successfully. Please log in." },
      });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AuthHeroPanel />

      <div className="auth-right">
        <div className="auth-form">
          <BackButton fallbackTo="/" label="Back to Home" className="mb-4" />
          <div className="mb-3">
            <BrandLogo size="sm" linkTo="/" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Create Account</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>Choose your role and join the community.</p>

          {error && (
            <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
            {[
              { id: "candidate", label: "I'm a Candidate", icon: "bi-person" },
              { id: "recruiter", label: "I'm a Recruiter", icon: "bi-briefcase" },
            ].map(({ id, label, icon }) => (
              <button key={id} type="button" className={`role-card ${role === id ? "active" : ""}`} onClick={() => setRole(id)}>
                <i className={`bi ${icon} d-block mb-2`} style={{ fontSize: 20 }} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          {[
            { label: "Full Name", key: "name", icon: "bi-person", type: "text" },
            { label: "Email Address", key: "email", icon: "bi-envelope", type: "email" },
            { label: "Password", key: "password", icon: "bi-lock", type: showPassword ? "text" : "password", toggle: true },
          ].map(({ label, key, icon, type, toggle }) => (
            <div key={key} className={styles.floatingInputWrap}>
              <i className={`bi ${icon} ${styles.inputIcon}`} aria-hidden="true" />
              
              <input 
                id={`reg-${key}`} 
                type={type} 
                placeholder=" " 
                value={form[key]} 
                onChange={(e) => setForm({ ...form, [key]: e.target.value })} 
              />
              
              <label htmlFor={`reg-${key}`}>{label}</label>

              {toggle && (
                <button type="button" className={styles.btnTogglePassword} onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              )}
            </div>
          ))}

          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 24, fontSize: 13, color: "var(--text-muted)", marginTop: 24 }}>
            <input type="checkbox" id="terms" style={{ marginTop: 2 }} />
            <label htmlFor="terms">I agree to the <a href="#terms" style={{ color: "var(--primary)" }}>Terms of Service</a> and <a href="#privacy" style={{ color: "var(--primary)" }}>Privacy Policy</a></label>
          </div>

          <button type="button" className="btn-primary-custom w-100 mb-3" onClick={handleRegister} disabled={submitting}>
            {submitting ? "Creating account..." : "Create Account"}
          </button>

          <div className="auth-divider"><span>Or continue with</span></div>

          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            {["Google", "LinkedIn"].map((p) => (
              <button key={p} type="button" className="auth-social-btn">
                <i className={`bi bi-${p === "Google" ? "google" : "linkedin"}`} style={{ color: p === "Google" ? "#EA4335" : "#0A66C2" }} aria-hidden="true" /> {p}
              </button>
            ))}
          </div>

          <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>
            Already have an account? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
          </div>
        </div>
      </div>
    </>
  );
}