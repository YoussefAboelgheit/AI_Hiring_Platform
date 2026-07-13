import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import * as authService from "../../services/authService";
import AuthHeroPanel from "../../components/auth/AuthHeroPanel";
import BrandLogo from "../../components/common/BrandLogo";
import BackButton from "../../components/common/BackButton";

const emailSchema = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
});

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const registeredEmail = location.state?.email || "";
  const [email, setEmail] = useState(registeredEmail);
  const [showEmailInput, setShowEmailInput] = useState(!registeredEmail);
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);

  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN_SECONDS);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleResend = async (resendEmail) => {
    if (!resendEmail) return;
    setSending(true);
    try {
      const result = await authService.resendVerification({ email: resendEmail });
      toast.success(result.message || "Verification email sent. Please check your inbox.", { duration: 5000 });
      startCooldown();
    } catch (error) {
      toast.error(error.message || "Failed to resend verification email.");
    } finally {
      setSending(false);
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

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#EEF2FF",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <i className="bi bi-envelope-check" style={{ fontSize: 28, color: "var(--primary)" }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Verify your email</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 0 }}>
              We sent a verification email to:
            </p>
            {email && (
              <p style={{ fontWeight: 700, fontSize: 16, marginTop: 4, marginBottom: 0 }}>{email}</p>
            )}
          </div>

          {showEmailInput && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 12 }}>
                Enter your email address to receive a new verification link.
              </p>
              <Formik
                initialValues={{ email: "" }}
                validationSchema={emailSchema}
                onSubmit={(values) => {
                  setEmail(values.email);
                  setShowEmailInput(false);
                  handleResend(values.email);
                }}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div style={{ marginBottom: 12 }}>
                      <Field
                        id="verify-email-input"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="form-control"
                        autoComplete="email"
                      />
                      <ErrorMessage name="email">
                        {(msg) => (
                          <p style={{ color: "#991B1B", fontSize: 12, marginTop: 4 }}>{msg}</p>
                        )}
                      </ErrorMessage>
                    </div>
                    <button type="submit" className="btn-primary-custom w-100" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Verification Email"}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          )}

          {!showEmailInput && (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
                Didn&apos;t receive the email? Check your spam folder or resend below.
              </p>
              <button
                type="button"
                className="btn-primary-custom w-100 mb-3"
                disabled={cooldown > 0 || sending}
                onClick={() => handleResend(email)}
              >
                {sending
                  ? "Sending..."
                  : cooldown > 0
                    ? `Resend available in ${cooldown}s`
                    : "Resend Verification Email"}
              </button>
            </div>
          )}

          <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>
            Already verified?{" "}
            <Link
              to="/login"
              style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
