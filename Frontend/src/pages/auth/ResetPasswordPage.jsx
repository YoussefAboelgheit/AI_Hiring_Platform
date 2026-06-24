import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import * as yup from "yup";
import toast from "react-hot-toast";
import AuthHeroPanel from "../../components/auth/AuthHeroPanel";
import AuthPasswordField from "../../components/auth/AuthPasswordField";
import BrandLogo from "../../components/common/BrandLogo";
import BackButton from "../../components/common/BackButton";
import * as authService from "../../services/authService";

const schema = yup.object({
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords do not match")
    .required("Please confirm your password"),
});

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isLinkValid = Boolean(token && userId);

  const handleSubmit = async (values, { setSubmitting }) => {
    const toastId = toast.loading("Resetting password...");

    try {
      const result = await authService.confirmForgotPassword({
        token,
        newPassword: values.newPassword,
      });
      toast.success(result.message || "Password reset successfully.", { id: toastId });
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { message: "Password reset successfully. Please log in with your new password." },
        });
      }, 1500);
    } catch (error) {
      toast.error(error.message || "Failed to reset password. Please try again.", { id: toastId });
      setSubmitting(false);
    }
  };

  return (
    <>
      <AuthHeroPanel />

      <div className="auth-right">
        <div className="auth-form">
          <BackButton fallbackTo="/login" label="Back to Login" className="mb-4" />
          <div className="mb-3">
            <BrandLogo size="sm" linkTo="/" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Reset password</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>
            Choose a new password for your account.
          </p>

          {!isLinkValid ? (
            <div>
              <div
                style={{
                  background: "#FEE2E2",
                  color: "#991B1B",
                  padding: "12px 14px",
                  borderRadius: 10,
                  fontSize: 14,
                  marginBottom: 20,
                }}
              >
                This reset link is invalid or incomplete. Please request a new one.
              </div>
              <Link to="/login" className="btn-primary-custom" style={{ textDecoration: "none", display: "inline-block" }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <Formik
              initialValues={{ newPassword: "", confirmPassword: "" }}
              validationSchema={schema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <AuthPasswordField
                    id="reset-new-password"
                    name="newPassword"
                    label="New Password"
                    show={showNew}
                    onToggle={() => setShowNew((value) => !value)}
                  />
                  <ErrorMessage name="newPassword">
                    {(msg) => (
                      <p style={{ color: "#991B1B", fontSize: 12, marginTop: 4, marginBottom: 8 }}>{msg}</p>
                    )}
                  </ErrorMessage>

                  <AuthPasswordField
                    id="reset-confirm-password"
                    name="confirmPassword"
                    label="Confirm Password"
                    show={showConfirm}
                    onToggle={() => setShowConfirm((value) => !value)}
                  />
                  <ErrorMessage name="confirmPassword">
                    {(msg) => (
                      <p style={{ color: "#991B1B", fontSize: 12, marginTop: 4, marginBottom: 8 }}>{msg}</p>
                    )}
                  </ErrorMessage>

                  <button
                    type="submit"
                    className="btn-primary-custom w-100 mb-3"
                    disabled={isSubmitting}
                    style={{ marginTop: 16 }}
                  >
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                  </button>
                </Form>
              )}
            </Formik>
          )}

          <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-muted)", marginTop: 16 }}>
            Remember your password?{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>
              Log in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
