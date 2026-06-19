import { useNavigate } from "react-router-dom";

export default function BackButton({ fallbackTo, label = "Back", className = "", flush = false }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else if (fallbackTo) {
      navigate(fallbackTo);
    } else {
      navigate(-1);
    }
  };

  const classes = [
    "back-button",
    "rounded-pill",
    "px-3",
    "py-2",
    "shadow-sm",
    flush ? "back-button--flush" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" onClick={handleBack} className={classes} aria-label={label}>
      <i className="bi bi-arrow-left back-button__icon" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
