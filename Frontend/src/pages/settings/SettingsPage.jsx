import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../context/useAuth";
import * as authService from "../../services/authService";
import { deleteUser } from "../../services/userService";
import BackButton from "../../components/common/BackButton";
import toast from "react-hot-toast";

const passwordSchema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .notOneOf([yup.ref("currentPassword")], "New password must be different")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords do not match")
    .required("Please confirm your new password"),
});

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isRecruiter = user?.role === "recruiter";
  const dashboardPath = isRecruiter ? "/recruiter/dashboard" : "/candidate/dashboard";
  const profilePath = isRecruiter ? "/recruiter/profile/edit" : "/candidate/profile/edit";

  const { mutate, isPending, isError, error, reset } = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: (result) => {
      setSuccessMessage(result.message || "Password updated successfully.");
      reset();
    },
  });

  const {
    mutate: mutateDelete,
    isPending: isDeleting,
    isError: isDeleteError,
    error: deleteError,
  } = useMutation({
    mutationFn: () => deleteUser(user.id),
    onSuccess: async () => {
      toast.success("Your account has been deleted.");
      await logout();
      navigate("/login", { replace: true });
    },
  });

  const handleDeleteAccount = () => {
    if (!user?.id) {
      toast.error("Unable to delete account. Please sign in again.");
      return;
    }
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    mutateDelete();
  };

  return (
    <>
     <BackButton forceTo={dashboardPath} label="Back to Dashboard" />
      <div className="page-header-row">
        <div>
          <h1>Settings</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Manage your account and security preferences.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 640 }}>
        {/* Account */}
        <div className="hcard" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Account</h2>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Name</div>
              <div style={{ fontWeight: 600 }}>{user?.name || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Email</div>
              <div style={{ fontWeight: 600 }}>{user?.email || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Role</div>
              <div style={{ fontWeight: 600, textTransform: "capitalize" }}>{user?.role || "—"}</div>
            </div>
          </div>
          <Link
            to={profilePath}
            className="btn-primary-custom"
            style={{ marginTop: 20, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
          >
            <i className="bi bi-pencil me-2" />
            Edit Profile
          </Link>
        </div>

        {/* Security */}
        <div className="hcard" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Change Password</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
            Update your password. You will stay signed in on this device.
          </p>

          {successMessage && (
            <div style={{ background: "#D1FAE5", color: "#065F46", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {successMessage}
            </div>
          )}

          {isError && (
            <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {error?.message || "Failed to update password."}
            </div>
          )}

          <Formik
            initialValues={{ currentPassword: "", newPassword: "", confirmPassword: "" }}
            validationSchema={passwordSchema}
            onSubmit={(values, { resetForm }) => {
              setSuccessMessage("");
              mutate(
                { currentPassword: values.currentPassword, newPassword: values.newPassword },
                { onSuccess: () => resetForm() }
              );
            }}
          >
            {() => (
              <Form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { name: "currentPassword", label: "Current password", show: showCurrent, toggle: () => setShowCurrent((v) => !v) },
                  { name: "newPassword", label: "New password", show: showNew, toggle: () => setShowNew((v) => !v) },
                  { name: "confirmPassword", label: "Confirm new password", show: showConfirm, toggle: () => setShowConfirm((v) => !v) },
                ].map(({ name, label, show, toggle }) => (
                  <div key={name}>
                    <label htmlFor={name} style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                      {label}
                    </label>
                    <div style={{ position: "relative" }}>
                      <Field
                        id={name}
                        name={name}
                        type={show ? "text" : "password"}
                        className="form-control"
                        autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
                      />
                      <button
                        type="button"
                        onClick={toggle}
                        className="border-0 bg-transparent"
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                        aria-label={show ? "Hide password" : "Show password"}
                      >
                        <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`} />
                      </button>
                    </div>
                    <ErrorMessage name={name} component="div" style={{ color: "#DC2626", fontSize: 12, marginTop: 4 }} />
                  </div>
                ))}

                <button type="submit" className="btn-primary-custom" disabled={isPending} style={{ alignSelf: "flex-start" }}>
                  {isPending ? "Updating..." : "Update Password"}
                </button>
              </Form>
            )}
          </Formik>
        </div>

        {/* Danger zone */}
        <div className="hcard" style={{ padding: 24, borderColor: "#FECACA" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#991B1B" }}>Delete Account</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 16 }}>
            Permanently delete your account and associated data. This action cannot be undone.
          </p>

          {isDeleteError && (
            <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {deleteError?.message || "Failed to delete account."}
            </div>
          )}

          {confirmDelete && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#991B1B", marginBottom: 16 }}>
              Click <strong>Confirm Delete</strong> to permanently remove your account.
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting
                ? "Deleting..."
                : confirmDelete
                  ? "Confirm Delete"
                  : "Delete Account"}
            </button>
            {confirmDelete && !isDeleting && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
