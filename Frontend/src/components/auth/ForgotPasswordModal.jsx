import { Modal, Button } from "react-bootstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import toast from "react-hot-toast";
import * as authService from "../../services/authService";
import styles from "../../pages/auth/LoginPage.module.css";

const schema = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
});

export default function ForgotPasswordModal({ show, onHide }) {
  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    const toastId = toast.loading("Sending reset email...");

    try {
      const result = await authService.forgotPassword({ email: values.email });
      resetForm();
      onHide();
      toast.success(
        result.message || "Check your email for a password reset link.",
        { id: toastId, duration: 5000 }
      );
    } catch (error) {
      toast.error(error.message || "Failed to send reset email. Please try again.", {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: 18, fontWeight: 700 }}>Forgot password?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
        <Formik
          initialValues={{ email: "" }}
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form id="forgot-password-form">
              <div className={styles.floatingInputWrap}>
                <i className={`bi bi-envelope ${styles.inputIcon}`} aria-hidden="true" />
                <Field id="forgot-email" name="email" type="email" placeholder=" " autoComplete="email" />
                <label htmlFor="forgot-email">Email Address</label>
              </div>
              <ErrorMessage name="email">
                {(msg) => (
                  <p style={{ color: "#991B1B", fontSize: 12, marginTop: -16, marginBottom: 16 }}>{msg}</p>
                )}
              </ErrorMessage>
              <div className="d-flex gap-2 justify-content-end">
                <Button variant="outline-secondary" onClick={handleClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <button type="submit" className="btn-primary-custom" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send reset link"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
}
