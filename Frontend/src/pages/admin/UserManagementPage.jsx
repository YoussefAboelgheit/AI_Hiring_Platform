import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/errorMessages";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} from "../../services/userService";
import { toFrontendRole, toBackendRole } from "../../utils/roleMap";
import LoadingState from "../../components/common/LoadingState";

// Yup validations for Create
const createUserSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters")
    .required("Name is required"),
  email: yup
    .string()
    .trim()
    .email("Provide a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  role: yup
    .string()
    .oneOf(["candidate", "recruiter", "admin"], "Select a valid role")
    .required("Role is required")
});

// Yup validations for Edit (only Name and Email are editable by admin)
const editUserSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters")
    .required("Name is required"),
  email: yup
    .string()
    .trim()
    .email("Provide a valid email address")
    .required("Email is required")
});

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [activeUser, setActiveUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch users from backend API
  const loadUsers = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const data = await getAllUsers({ page: pageNumber, limit: 10 });
      setUsers(data.users || []);
      setPage(data.page || 1);
      setTotalPages(data.pages || 1);
    } catch (err) {
      toast.error("Failed to load users from backend API");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1);
  }, []);

  // Handlers
  const handleAddUser = async (values, { resetForm }) => {
    setSubmitting(true);
    try {
      // Map frontend role "recruiter" -> backend "hr"
      const payload = {
        ...values,
        role: toBackendRole(values.role)
      };
      const response = await createUser(payload);
      toast.success(response.message || `User "${values.name}" created successfully`);
      setShowAddModal(false);
      resetForm();
      loadUsers(1); // Refresh back to page 1
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create user"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim()
      };
      const response = await updateUser(activeUser._id, payload);
      toast.success(response.message || `User "${values.name}" updated successfully`);
      setShowEditModal(false);
      setActiveUser(null);
      loadUsers(page); // Stay on current page
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update user"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    setSubmitting(true);
    try {
      const response = await deleteUser(activeUser._id);
      toast.success(response.message || `User deleted successfully`);
      setShowDeleteModal(false);
      setActiveUser(null);
      loadUsers(page); // Stay on current page
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete user"));
    } finally {
      setSubmitting(false);
    }
  };

  // Client-side search within current active page
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeClass = (role) => {
    const fRole = toFrontendRole(role);
    if (fRole === "admin") return "badge-status badge-accepted";
    if (fRole === "recruiter") return "badge-status badge-interviewing";
    return "badge-status badge-shortlisted";
  };

  if (loading && users.length === 0) return <LoadingState message="Loading users from API..." />;

  return (
    <>
      {/* Page Header */}
      <div className="page-header-row mb-4">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>User Management</h1>
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>
            Create, update, and manage candidate, recruiter, and administrator profiles directly on the backend database.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary-custom"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-person-plus me-2" aria-hidden="true" /> Add New User
        </button>
      </div>

      {/* Main Table Card */}
      <div className="hcard" style={{ padding: 24 }}>
        {/* Search Bar */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20, maxWidth: 400 }}>
          <div className="topbar .search-box" style={{ flex: 1, position: "static", border: "1px solid var(--border)", background: "var(--body-bg)", borderRadius: 10, padding: "6px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <i className="bi bi-search text-muted" aria-hidden="true" />
            <input
              type="text"
              placeholder="Filter users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 14, width: "100%" }}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="table-responsive">
          <table className="htable">
            <thead>
              <tr>
                <th>Profile &amp; Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Joined</th>
                <th style={{ width: "120px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
                    <i className="bi bi-people" style={{ fontSize: 28, display: "block", marginBottom: 8 }} aria-hidden="true" />
                    No users found on this page.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <img
                          src={
                            u.profile_image ||
                            u.company_logo ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=F3F5FB&color=1D2445&size=80`
                          }
                          alt={u.name}
                          style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--border)" }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>ID: {u._id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{u.email}</td>
                    <td>
                      <span className={getRoleBadgeClass(u.role)} style={{ fontSize: 12, padding: "4px 10px" }}>
                        {toFrontendRole(u.role)}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })
                        : "N/A"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 8 }}>
                        <button
                          type="button"
                          className="topbar-icon-btn"
                          style={{ width: 32, height: 32, fontSize: 14 }}
                          onClick={() => {
                            setActiveUser(u);
                            setShowEditModal(true);
                          }}
                          title="Edit User"
                          aria-label={`Edit user ${u.name}`}
                        >
                          <i className="bi bi-pencil" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="topbar-icon-btn"
                          style={{ width: 32, height: 32, fontSize: 14 }}
                          onClick={() => {
                            setActiveUser(u);
                            setShowDeleteModal(true);
                          }}
                          title="Delete User"
                          aria-label={`Delete user ${u.name}`}
                        >
                          <i className="bi bi-trash text-danger" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="btn-outline-custom"
                style={{ padding: "6px 12px", fontSize: 12 }}
                disabled={page <= 1 || loading}
                onClick={() => loadUsers(page - 1)}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn-outline-custom"
                style={{ padding: "6px 12px", fontSize: 12 }}
                disabled={page >= totalPages || loading}
                onClick={() => loadUsers(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <div className="hcard p-4 border-0">
          <Modal.Header closeButton style={{ borderBottom: "none", padding: 0 }}>
            <h2 className="section-title" style={{ margin: 0, fontSize: 18 }}>Add New User</h2>
          </Modal.Header>
          <Formik
            initialValues={{ name: "", email: "", password: "", role: "candidate" }}
            validationSchema={createUserSchema}
            onSubmit={handleAddUser}
          >
            {({ isSubmitting: formikSubmitting }) => (
              <Form style={{ marginTop: 20 }}>
                {/* Name */}
                <div style={{ marginBottom: 14 }}>
                  <label htmlFor="user-name-add" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Full Name</label>
                  <Field id="user-name-add" name="name" type="text" placeholder="Enter full name" style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none" }} />
                  <ErrorMessage name="name">{(msg) => <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{msg}</div>}</ErrorMessage>
                </div>

                {/* Email */}
                <div style={{ marginBottom: 14 }}>
                  <label htmlFor="user-email-add" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Email Address</label>
                  <Field id="user-email-add" name="email" type="email" placeholder="Enter email address (e.g., name@domain.com)" style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none" }} />
                  <ErrorMessage name="email">{(msg) => <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{msg}</div>}</ErrorMessage>
                </div>

                {/* Password */}
                <div style={{ marginBottom: 14 }}>
                  <label htmlFor="user-password-add" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Password</label>
                  <Field id="user-password-add" name="password" type="password" placeholder="Minimum 8 characters" style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none" }} />
                  <ErrorMessage name="password">{(msg) => <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{msg}</div>}</ErrorMessage>
                </div>

                {/* Role */}
                <div style={{ marginBottom: 20 }}>
                  <label htmlFor="user-role-add" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Access Role</label>
                  <Field id="user-role-add" name="role" as="select" style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", background: "white" }}>
                    <option value="candidate">Candidate</option>
                    <option value="recruiter">Recruiter (HR)</option>
                    <option value="admin">Administrator</option>
                  </Field>
                  <ErrorMessage name="role">{(msg) => <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{msg}</div>}</ErrorMessage>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button
                    type="button"
                    className="btn-outline-custom"
                    style={{ padding: "8px 16px", fontSize: 13 }}
                    onClick={() => setShowAddModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-custom"
                    style={{ padding: "8px 16px", fontSize: 13 }}
                    disabled={formikSubmitting || submitting}
                  >
                    {submitting ? "Creating..." : "Create User"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => { setShowEditModal(false); setActiveUser(null); }} centered>
        <div className="hcard p-4 border-0">
          <Modal.Header closeButton style={{ borderBottom: "none", padding: 0 }}>
            <h2 className="section-title" style={{ margin: 0, fontSize: 18 }}>Edit User Profile</h2>
          </Modal.Header>
          {activeUser && (
            <Formik
              initialValues={{
                name: activeUser.name || "",
                email: activeUser.email || ""
              }}
              validationSchema={editUserSchema}
              onSubmit={handleEditUser}
            >
              {({ isSubmitting: formikSubmitting }) => (
                <Form style={{ marginTop: 20 }}>
                  {/* Name */}
                  <div style={{ marginBottom: 14 }}>
                    <label htmlFor="user-name-edit" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Full Name</label>
                    <Field id="user-name-edit" name="name" type="text" placeholder="Enter full name" style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none" }} />
                    <ErrorMessage name="name">{(msg) => <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{msg}</div>}</ErrorMessage>
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: 14 }}>
                    <label htmlFor="user-email-edit" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Email Address</label>
                    <Field id="user-email-edit" name="email" type="email" placeholder="Enter email address (e.g., name@domain.com)" style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none" }} />
                    <ErrorMessage name="email">{(msg) => <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{msg}</div>}</ErrorMessage>
                  </div>

                  {/* Footer Buttons */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button
                      type="button"
                      className="btn-outline-custom"
                      style={{ padding: "8px 16px", fontSize: 13 }}
                      onClick={() => { setShowEditModal(false); setActiveUser(null); }}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary-custom"
                      style={{ padding: "8px 16px", fontSize: 13 }}
                      disabled={formikSubmitting || submitting}
                    >
                      {submitting ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal show={showDeleteModal} onHide={() => { setShowDeleteModal(false); setActiveUser(null); }} centered>
        <div className="hcard p-4 border-0">
          <Modal.Header closeButton style={{ borderBottom: "none", padding: 0 }}>
            <h2 className="section-title text-danger" style={{ margin: 0, fontSize: 18 }}>Delete User Profile</h2>
          </Modal.Header>
          {activeUser && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 14, color: "var(--text-dark)", lineHeight: 1.6, marginBottom: 24 }}>
                Are you sure you want to permanently delete the profile for <strong>{activeUser.name}</strong> ({activeUser.email})?
                This user will no longer be able to log in, and all associated media profiles will be purged. This action is irreversible.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  className="btn-outline-custom"
                  style={{ padding: "8px 16px", fontSize: 13 }}
                  onClick={() => { setShowDeleteModal(false); setActiveUser(null); }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600 }}
                  onClick={handleDeleteUser}
                  disabled={submitting}
                >
                  {submitting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}