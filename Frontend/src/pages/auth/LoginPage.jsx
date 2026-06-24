import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../context/useAuth";
import AuthHeroPanel from "../../components/auth/AuthHeroPanel";
import BrandLogo from "../../components/common/BrandLogo";
import BackButton from "../../components/common/BackButton";
import ForgotPasswordModal from "../../components/auth/ForgotPasswordModal";
import { getHomeForRole } from "../../routes/rolePaths";
import styles from "./LoginPage.module.css";

//   Yup Schema  
const schema = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [show, setShow] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const successMessage = location.state?.message;

  //  React Query Mutation 
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: (formData) => login(formData),
    onSuccess: (user) => {
      const from = location.state?.from;
      const fromPath = from?.pathname;
      const rolePrefix = user.role === "recruiter" ? "/recruiter" : "/candidate";
      const canReturnToFrom = fromPath?.startsWith(rolePrefix);

      navigate(
        canReturnToFrom
          ? `${fromPath}${from.search || ""}${from.hash || ""}`
          : getHomeForRole(user.role),
        { replace: true }
      );
    },
  });

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
          <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>
            Please enter your details to access your recruitment dashboard.
          </p>

          {/* Success Message */}
          {successMessage && (
            <div style={{ background: "#D1FAE5", color: "#065F46", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {successMessage}
            </div>
          )}

          {/* Server Error */}
          {isError && (
            <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {error?.message || "Login failed. Please try again."}
            </div>
          )}

          {/* ── 3. Formik ── */}
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={schema}
            onSubmit={(values) => mutate(values)}
          >
            {() => (
              <Form>
                {/* Email */}
                <div className={styles.floatingInputWrap}>
                  <i className={`bi bi-envelope ${styles.inputIcon}`} aria-hidden="true" />
                  <Field id="login-email" name="email" type="email" placeholder=" " />
                  <label htmlFor="login-email">Email Address</label>
                </div>
                <ErrorMessage name="email">
                  {(msg) => (
                    <p style={{ color: "#991B1B", fontSize: 12, marginTop: 4, marginBottom: 8 }}>{msg}</p>
                  )}
                </ErrorMessage>

                {/* Password */}
                <div className={styles.floatingInputWrap} style={{ marginBottom: 8 }}>
                  <i className={`bi bi-lock ${styles.inputIcon}`} aria-hidden="true" />
                  <Field id="login-password" name="password" type={show ? "text" : "password"} placeholder=" " />
                  <label htmlFor="login-password">Password</label>
                  <button
                    type="button"
                    className={styles.btnTogglePassword}
                    onClick={() => setShow(!show)}
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
                <ErrorMessage name="password">
                  {(msg) => (
                    <p style={{ color: "#991B1B", fontSize: 12, marginTop: 4, marginBottom: 8 }}>{msg}</p>
                  )}
                </ErrorMessage>

                {/* Remember + Forgot */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, fontSize: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)" }}>
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember" style={{ cursor: "pointer" }}>Keep me logged in for 30 days</label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    style={{
                      color: "var(--primary)",
                      textDecoration: "none",
                      fontWeight: 600,
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="btn-primary-custom w-100 mb-3" disabled={isPending}>
                  {isPending ? "Signing in..." : "Login"}
                </button>
              </Form>
            )}
          </Formik>

          <div className="auth-divider"><span>Or continue with</span></div>

          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            {["Google", "LinkedIn"].map((p) => (
              <button key={p} type="button" className="auth-social-btn">
                <i
                  className={`bi bi-${p === "Google" ? "google" : "linkedin"}`}
                  style={{ color: p === "Google" ? "#EA4335" : "#0A66C2" }}
                  aria-hidden="true"
                />{" "}
                {p}
              </button>
            ))}
          </div>

          <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>
              Register
            </Link>
          </div>
        </div>
      </div>

      <ForgotPasswordModal show={forgotOpen} onHide={() => setForgotOpen(false)} />
    </>
  );
}