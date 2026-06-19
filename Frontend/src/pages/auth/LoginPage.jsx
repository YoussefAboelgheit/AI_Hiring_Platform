import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import AuthHeroPanel from "../../components/auth/AuthHeroPanel";
import BrandLogo from "../../components/common/BrandLogo";
import BackButton from "../../components/common/BackButton";
import { getHomeForRole } from "../../routes/rolePaths";
import styles from "./LoginPage.module.css"; 

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const successMessage = location.state?.message;

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const user = await login({ email, password });
      const from = location.state?.from;
      const fromPath = from?.pathname;
      const rolePrefix = user.role === "recruiter" ? "/recruiter" : "/candidate";
      const canReturnToFrom = fromPath?.startsWith(rolePrefix);

      navigate(
        canReturnToFrom ? `${fromPath}${from.search || ""}${from.hash || ""}` : getHomeForRole(user.role),
        { replace: true }
      );
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
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
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>Please enter your details to access your recruitment dashboard.</p>

          {successMessage && (
            <div style={{ background: "#D1FAE5", color: "#065F46", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {successMessage}
            </div>
          )}

          {error && (
            <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* حقل الإيميل الـ Floating */}
          <div className={styles.floatingInputWrap}>
            <i className={`bi bi-envelope ${styles.inputIcon}`} aria-hidden="true" />
            <input 
              id="login-email" 
              type="email" 
              placeholder=" " 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <label htmlFor="login-email">Email Address</label>
          </div>

          {/* حقل الباسورد الـ Floating */}
          <div className={styles.floatingInputWrap} style={{ marginBottom: 16 }}>
            <i className={`bi bi-lock ${styles.inputIcon}`} aria-hidden="true" />
            <input 
              id="login-password" 
              type={show ? "text" : "password"} 
              placeholder=" " 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <label htmlFor="login-password">Password</label>
            
            <button type="button" className={styles.btnTogglePassword} onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
              <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`} />
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, fontSize: 13 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)" }}>
              <input type="checkbox" id="remember" />
              <label htmlFor="remember" style={{ cursor: "pointer" }}>Keep me logged in for 30 days</label>
            </div>
            <a href="#forgot" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>Forgot password?</a>
          </div>

          <button type="button" className="btn-primary-custom w-100 mb-3" onClick={handleLogin} disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
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
            Don&apos;t have an account? <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>Register</Link>
          </div>
        </div>
      </div>
    </>
  );
}