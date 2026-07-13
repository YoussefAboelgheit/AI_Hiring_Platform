import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../context/useAuth";
import AuthHeroPanel from "../../components/auth/AuthHeroPanel";
import BrandLogo from "../../components/common/BrandLogo";
import BackButton from "../../components/common/BackButton";
import styles from "./RegisterPage.module.css";

//  Yup Schema 
const schema = yup.object({
  name: yup.string().trim().required("Full name is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
  terms: yup.boolean().oneOf([true], "You must accept the terms"),
});

export default function RegisterPage() {


  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState("candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //  React Query Mutation 

  const { mutate, isPending, isError, error } = useMutation({

    mutationFn: ({ name, email, password }) => register({ name, email, password, role }),
    onSuccess: (result, variables) => {
      navigate("/verify-email", {
        replace: true,
        state: { email: variables.email },
      });
    },
  });

  return (
    <>
      <AuthHeroPanel />

      <div className="auth-right">
        <div className="auth-form">
        <BackButton forceTo="/" label="Back to Home" className="mb-4" />
          <div className="mb-3">
            <BrandLogo size="sm" linkTo="/" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            Create Account
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
            Choose your role and join the community.
          </p>

          {/* Server Error */}
          {isError && (
            <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {error?.message || "Registration failed. Please try again."}
            </div>
          )}

          {/* Role Selector */}
          <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
            {[
              { id: "candidate", label: "I'm a Candidate", icon: "bi-person" },
              { id: "recruiter", label: "I'm a Recruiter", icon: "bi-briefcase" },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                type="button"
                className={`role-card ${role === id ? "active" : ""}`}
                onClick={() => setRole(id)}
              >
                <i className={`bi ${icon} d-block mb-2`} style={{ fontSize: 20 }} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          {/* ── 3. Formik ── */}
          <Formik
            initialValues={{ name: "", email: "", password: "", confirmPassword: "", terms: false }}
            validationSchema={schema}
            onSubmit={(values) => mutate(values)}
          >
            {({ values, setFieldValue }) => (
              <Form>
                {/* Fields */}
                {[
                  { label: "Full Name",     key: "name",     icon: "bi-person",   type: "text" },
                  { label: "Email Address", key: "email",    icon: "bi-envelope", type: "email" },
                  { label: "Password",      key: "password", icon: "bi-lock",     type: showPassword ? "text" : "password", toggle: true, toggleState: showPassword, setToggle: setShowPassword },
                  { label: "Confirm Password", key: "confirmPassword", icon: "bi-lock", type: showConfirmPassword ? "text" : "password", toggle: true, toggleState: showConfirmPassword, setToggle: setShowConfirmPassword },
                ].map(({ label, key, icon, type, toggle, toggleState, setToggle }) => (
                  <div key={key}>
                    <div className={styles.floatingInputWrap}>
                      <i className={`bi ${icon} ${styles.inputIcon}`} aria-hidden="true" />
                      <Field
                        id={`reg-${key}`}
                        name={key}
                        type={type}
                        placeholder=" "
                      />
                      <label htmlFor={`reg-${key}`}>{label}</label>
                      {toggle && (
                        <button
                          type="button"
                          className={styles.btnTogglePassword}
                          onClick={() => setToggle(!toggleState)}
                          aria-label="Toggle password"
                        >
                          <i className={`bi ${toggleState ? "bi-eye-slash" : "bi-eye"}`} />
                        </button>
                      )}
                    </div>
                    <ErrorMessage name={key}>
                      {(msg) => (
                        <p style={{ color: "#991B1B", fontSize: 12, marginTop: 4, marginBottom: 8 }}>
                          {msg}
                        </p>
                      )}
                    </ErrorMessage>
                  </div>
                ))}

                {/* Terms */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: 13, color: "var(--text-muted)", marginTop: 24 }}>
                  <input
                    type="checkbox"
                    id="terms"
                    checked={values.terms}
                    onChange={(e) => setFieldValue("terms", e.target.checked)}
                    style={{ marginTop: 2 }}
                  />
                  <label htmlFor="terms">
                    I agree to the{" "}
                    <Link to="/terms" style={{ color: "var(--primary)" }}>Terms of Service</Link>
                    {" "}and{" "}
                    <Link to="/privacy" style={{ color: "var(--primary)" }}>Privacy Policy</Link>
                  </label>
                </div>
                <ErrorMessage name="terms">
                  {(msg) => (
                    <p style={{ color: "#991B1B", fontSize: 12, marginBottom: 12 }}>{msg}</p>
                  )}
                </ErrorMessage>

                <button
                  type="submit"
                  className="btn-primary-custom w-100 mb-3"
                  disabled={isPending}
                >
                  {isPending ? "Creating account..." : "Create Account"}
                </button>
              </Form>
            )}
          </Formik>

          <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}