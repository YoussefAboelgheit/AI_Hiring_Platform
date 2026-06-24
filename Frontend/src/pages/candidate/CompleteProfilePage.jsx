import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { saveCompleteProfile, resolveAvatar } from "../../services/authService";
import { isRecruiterRole } from "../../utils/roleMap";
import { getHomeForRole } from "../../routes/rolePaths";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const avatarInputRef = useRef(null);

  const isRecruiter = isRecruiterRole(user?.role);

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
      setAvatarPreview(user.avatar || resolveAvatar(user));
      setLoading(false);
    }
  }, [user]);

  const openAvatarPicker = () => avatarInputRef.current?.click();

  const handleAvatarChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected || !selected.type.startsWith("image/")) return;
    setAvatarPreview(URL.createObjectURL(selected));
    setAvatarFile(selected);
  };

  const handleFileChange = (selected) => {
    if (!selected) return;

    if (isRecruiter && !selected.type.startsWith("image/")) {
      alert("Please upload a PNG or JPG company logo.");
      return;
    }

    if (!isRecruiter && selected.type !== "application/pdf") {
      alert("Please upload a PDF resume.");
      return;
    }

    setFile(selected);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);

      if (!isRecruiter && avatarFile) {
        formData.append("profile_image", avatarFile);
      }

      if (!isRecruiter && file) {
        formData.append("CV", file);
      } else if (isRecruiter && file) {
        formData.append("company_logo", file);
      }

      await saveCompleteProfile(user.id, formData);
      await refreshUser();

      navigate(getHomeForRole(user.role));
    } catch (error) {
      console.error("Error saving profile:", error);
      alert(error.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading profile..." />;

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="card shadow-sm border-0 p-4 p-md-5" style={{ maxWidth: "560px", width: "100%" }}>
        <BackButton fallbackTo={getHomeForRole(user?.role)} label="Back" />

        <div className="text-center mb-4">
          <h1 className="h4 fw-bold">Complete Your Profile</h1>
          <p className="text-muted small">
            {isRecruiter ? "Set up your company profile." : "Build your personal brand."}
          </p>
        </div>

        {!isRecruiter && (
          <div className="text-center mb-4">
            <button type="button" onClick={openAvatarPicker} className="btn p-0 border-0 position-relative">
              <img
                src={avatarPreview}
                alt="Avatar"
                className="rounded-circle object-fit-cover"
                style={{ width: "96px", height: "96px" }}
              />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="d-none"
              onChange={handleAvatarChange}
            />
            <p className="text-muted small mt-1">Upload Profile Picture</p>
          </div>
        )}

        {isRecruiter && avatarPreview && (
          <div className="text-center mb-4">
            <img
              src={avatarPreview}
              alt="Company logo preview"
              className="rounded object-fit-cover border"
              style={{ width: "96px", height: "96px" }}
            />
            <p className="text-muted small mt-1">Current Company Logo</p>
          </div>
        )}

        <div className="mb-3">
          <label className="form-label small fw-semibold">
            {isRecruiter ? "Company Name" : "Full Name"}
          </label>
          <input
            className="form-control"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <label className="form-label small fw-semibold">
            {isRecruiter ? "Upload Company Logo" : "Upload Resume / CV"}
          </label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFileChange(e.dataTransfer.files[0]);
            }}
            onClick={() => document.getElementById("profile-file").click()}
            className={`border border-2 border-dashed rounded-3 p-4 text-center cursor-pointer ${
              dragging ? "border-primary bg-primary bg-opacity-10" : "border-secondary-subtle"
            }`}
          >
            <i className="bi bi-cloud-upload fs-2 text-primary" />
            <div className="small mt-2">{file ? file.name : "Click or drag to upload"}</div>
          </div>
          <input
            id="profile-file"
            type="file"
            accept={isRecruiter ? "image/png,image/jpeg,image/jpg" : "application/pdf"}
            className="d-none"
            onChange={(e) => handleFileChange(e.target.files[0])}
          />
        </div>

        <button className="btn btn-primary w-100 py-2" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
