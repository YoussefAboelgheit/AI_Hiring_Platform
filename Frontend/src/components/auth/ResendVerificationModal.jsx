import { Modal, Button } from "react-bootstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import toast from "react-hot-toast";
import * as authService from "../../services/authService";
import styles from "../../pages/auth/LoginPage.module.css";

const schema = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
});

export default function ResendVerificationModal({ show, onHide }) {
  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    const toastId = toast.loading("Sending verification email...");

    try {
      const result = await authService.resendVerification({ email: values.email });
      resetForm();
      onHide();
      toast.success(
        result.message || "Verification email sent. Please check your inbox.",
        { id: toastId, duration: 5000 }
      );
    } catch (error) {
      toast.error(error.message || "Failed to send verification email. Please try again.", {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: 18, fontWeight: 700 }}>Resend Verification Email</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
          Enter your email address and we&apos;ll send you a new verification link.
        </p>
        <Formik
          initialValues={{ email: "" }}
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form id="resend-verification-form">
              <div className={styles.floatingInputWrap}>
                <i className={`bi bi-envelope ${styles.inputIcon}`} aria-hidden="true" />
                <Field id="resend-email" name="email" type="email" placeholder=" " autoComplete="email" />
                <label htmlFor="resend-email">Email Address</label>
              </div>
              <ErrorMessage name="email">
                {(msg) => (
                  <p style={{ color: "#991B1B", fontSize: 12, marginTop: -16, marginBottom: 16 }}>{msg}</p>
                )}
              </ErrorMessage>
              <div className="d-flex gap-2 justify-content-end">
                <Button variant="outline-secondary" onClick={onHide} disabled={isSubmitting}>
                  Cancel
                </Button>
                <button type="submit" className="btn-primary-custom" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
}
