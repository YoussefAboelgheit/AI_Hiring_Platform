import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/errorMessages";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../../services/categoryService";
import LoadingState from "../../components/common/LoadingState";

// Validation schema for category operations
const categorySchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name is too long")
    .required("Category name is required")
});

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories
  const loadCategories = async () => {
    try {
      const data = await getCategories();
      // Sort alphabetically by name
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setCategories(sorted);
    } catch (err) {
      toast.error("Failed to load categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Handlers
  const handleAddCategory = async (values, { resetForm }) => {
    setSubmitting(true);
    try {
      const newCat = await createCategory({ name: values.name.trim() });
      toast.success(`Category "${newCat.name}" created successfully`);
      setShowAddModal(false);
      resetForm();
      loadCategories();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create category"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCategory = async (values) => {
    setSubmitting(true);
    try {
      const updated = await updateCategory(activeCategory._id, {
        name: values.name.trim()
      });
      toast.success(`Category updated to "${updated.name}"`);
      setShowEditModal(false);
      setActiveCategory(null);
      loadCategories();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update category"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    setSubmitting(true);
    try {
      await deleteCategory(activeCategory._id);
      toast.success(`Category "${activeCategory.name}" removed successfully`);
      setShowDeleteModal(false);
      setActiveCategory(null);
      loadCategories();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to remove category"));
    } finally {
      setSubmitting(false);
    }
  };

  // Filtering
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingState message="Fetching system categories..." />;

  return (
    <>
      {/* Page Header */}
      <div className="page-header-row mb-4">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Category Management</h1>
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>
            Create, update, and manage job tags used for posting new jobs and candidate profile matching.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary-custom"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-lg me-2" aria-hidden="true" /> Add Category
        </button>
      </div>

      {/* Main Container */}
      <div className="hcard" style={{ padding: 24 }}>
        {/* Search and Filters */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20, maxWidth: 400 }}>
          <div className="topbar .search-box" style={{ flex: 1, position: "static", border: "1px solid var(--border)", background: "var(--body-bg)", borderRadius: 10, padding: "6px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <i className="bi bi-search text-muted" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search categories by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 14, width: "100%" }}
            />
          </div>
        </div>

        {/* Categories Table */}
        <div className="table-responsive">
          <table className="htable">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Date Created</th>
                <th style={{ width: "120px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
                    <i className="bi bi-tag" style={{ fontSize: 28, display: "block", marginBottom: 8 }} aria-hidden="true" />
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat._id}>
                    <td>
                      <span className="badge-status badge-shortlisted" style={{ fontSize: 13, padding: "5px 12px", borderRadius: 6 }}>
                        {cat.name}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                      {new Date(cat.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 8 }}>
                        <button
                          type="button"
                          className="topbar-icon-btn"
                          style={{ width: 32, height: 32, fontSize: 14 }}
                          onClick={() => {
                            setActiveCategory(cat);
                            setShowEditModal(true);
                          }}
                          title="Edit Category"
                          aria-label={`Edit category ${cat.name}`}
                        >
                          <i className="bi bi-pencil" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="topbar-icon-btn"
                          style={{ width: 32, height: 32, fontSize: 14 }}
                          onClick={() => {
                            setActiveCategory(cat);
                            setShowDeleteModal(true);
                          }}
                          title="Delete Category"
                          aria-label={`Delete category ${cat.name}`}
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
      </div>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <div className="hcard p-4 border-0">
          <Modal.Header closeButton style={{ borderBottom: "none", padding: 0 }}>
            <h2 className="section-title" style={{ margin: 0, fontSize: 18 }}>Add New Category</h2>
          </Modal.Header>
          <Formik
            initialValues={{ name: "" }}
            validationSchema={categorySchema}
            onSubmit={handleAddCategory}
          >
            {({ isSubmitting: formikSubmitting }) => (
              <Form style={{ marginTop: 20 }}>
                <div style={{ marginBottom: 20 }}>
                  <label htmlFor="cat-name-add" style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>
                    Category Name
                  </label>
                  <Field
                    id="cat-name-add"
                    name="name"
                    type="text"
                    placeholder="e.g. Sales, Data Science"
                    style={{
                      width: "100%",
                      border: "1.5px solid var(--border)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 14,
                      outline: "none"
                    }}
                  />
                  <ErrorMessage name="name">
                    {(msg) => (
                      <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 6 }}>{msg}</div>
                    )}
                  </ErrorMessage>
                </div>
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
                    {submitting ? "Creating..." : "Create Category"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => { setShowEditModal(false); setActiveCategory(null); }} centered>
        <div className="hcard p-4 border-0">
          <Modal.Header closeButton style={{ borderBottom: "none", padding: 0 }}>
            <h2 className="section-title" style={{ margin: 0, fontSize: 18 }}>Edit Category</h2>
          </Modal.Header>
          {activeCategory && (
            <Formik
              initialValues={{ name: activeCategory.name }}
              validationSchema={categorySchema}
              onSubmit={handleEditCategory}
            >
              {({ isSubmitting: formikSubmitting }) => (
                <Form style={{ marginTop: 20 }}>
                  <div style={{ marginBottom: 20 }}>
                    <label htmlFor="cat-name-edit" style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>
                      Category Name
                    </label>
                    <Field
                      id="cat-name-edit"
                      name="name"
                      type="text"
                      style={{
                        width: "100%",
                        border: "1.5px solid var(--border)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: 14,
                        outline: "none"
                      }}
                    />
                    <ErrorMessage name="name">
                      {(msg) => (
                        <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 6 }}>{msg}</div>
                      )}
                    </ErrorMessage>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button
                      type="button"
                      className="btn-outline-custom"
                      style={{ padding: "8px 16px", fontSize: 13 }}
                      onClick={() => { setShowEditModal(false); setActiveCategory(null); }}
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

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => { setShowDeleteModal(false); setActiveCategory(null); }} centered>
        <div className="hcard p-4 border-0">
          <Modal.Header closeButton style={{ borderBottom: "none", padding: 0 }}>
            <h2 className="section-title text-danger" style={{ margin: 0, fontSize: 18 }}>Remove Category</h2>
          </Modal.Header>
          {activeCategory && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 14, color: "var(--text-dark)", lineHeight: 1.6, marginBottom: 24 }}>
                Are you sure you want to delete the category <strong>{activeCategory.name}</strong>?
                This will make jobs classified under this category lose their category name grouping. This action is irreversible.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  className="btn-outline-custom"
                  style={{ padding: "8px 16px", fontSize: 13 }}
                  onClick={() => { setShowDeleteModal(false); setActiveCategory(null); }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600 }}
                  onClick={handleDeleteCategory}
                  disabled={submitting}
                >
                  {submitting ? "Removing..." : "Delete Permanently"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}