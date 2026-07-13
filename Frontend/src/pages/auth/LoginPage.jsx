import { useState, useRef } from "react";
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
import * as authService from "../../services/authService";
import toast from "react-hot-toast";
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
  const [verifyEmail, setVerifyEmail] = useState("");
  const [resendingVerification, setResendingVerification] = useState(false);
  const successMessage = location.state?.message;
  const lastEmailRef = useRef("");

  //  React Query Mutation 
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: (formData) => login(formData),
    onSuccess: (user) => {
      const from = location.state?.from;
      const fromPath = from?.pathname;
      const rolePrefix =
        user.role === "admin"
          ? "/admin"
          : user.role === "recruiter"
          ? "/recruiter"
          : "/candidate";
      const canReturnToFrom = fromPath?.startsWith(rolePrefix);

      navigate(
        canReturnToFrom
          ? `${fromPath}${from.search || ""}${from.hash || ""}`
          : getHomeForRole(user.role),
        { replace: true }
      );
    },
    onError: (err) => {
      const errMsg = err?.message || "";
      if (errMsg.toLowerCase().includes("verify your email")) {
        navigate("/verify-email", {
          replace: true,
          state: { email: lastEmailRef.current },
        });
      }
    },
  });

  const handleResendVerification = async () => {
    if (!verifyEmail) return;
    setResendingVerification(true);
    try {
      const result = await authService.resendVerification({ email: verifyEmail });
      toast.success(result.message || "Verification email sent.");
    } catch (err) {
      toast.error(err.message || "Failed to resend verification email.");
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <>
      <AuthHeroPanel />

      <div className="auth-right">
        <div className="auth-form">
        <BackButton forceTo="/" label="Back to Home" className="mb-4" />   
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

          {/* Unverified Email Banner */}
          {verifyEmail && (
            <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <i className="bi bi-exclamation-triangle" style={{ color: "#EA580C", fontSize: 18, flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ color: "#9A3412", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                    Email not verified
                  </p>
                  <p style={{ color: "#9A3412", fontSize: 13, marginBottom: 10 }}>
                    Please verify your email address before signing in. Check your inbox for a verification link
                    or resend the email below.
                  </p>
                  <button
                    type="button"
                    className="btn-primary-custom"
                    style={{ fontSize: 13, padding: "7px 16px" }}
                    disabled={resendingVerification}
                    onClick={handleResendVerification}
                  >
                    {resendingVerification ? "Sending..." : "Resend Verification Email"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Server Error (non-verification) */}
          {isError && !verifyEmail && (
            <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {error?.message || "Login failed. Please try again."}
            </div>
          )}

          {/* ── 3. Formik ── */}
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={schema}
            onSubmit={(values) => {
              lastEmailRef.current = values.email;
              setVerifyEmail("");
              mutate(values);
            }}
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