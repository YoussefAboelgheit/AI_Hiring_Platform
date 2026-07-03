import { Field } from "formik";
import styles from "../../pages/auth/LoginPage.module.css";

export default function AuthPasswordField({
  id,
  name,
  label,
  show,
  onToggle,
  autoComplete = "new-password",
}) {
  return (
    <div>
      <div className={styles.floatingInputWrap} style={{ marginBottom: 8 }}>
        <i className={`bi bi-lock ${styles.inputIcon}`} aria-hidden="true" />
        <Field
          id={id}
          name={name}
          type={show ? "text" : "password"}
          placeholder=" "
          autoComplete={autoComplete}
        />
        <label htmlFor={id}>{label}</label>
        <button
          type="button"
          className={styles.btnTogglePassword}
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
        >
          <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`} />
        </button>
      </div>
    </div>
  );
}
