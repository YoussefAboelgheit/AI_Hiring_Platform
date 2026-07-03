import { useNavigate } from "react-router-dom";

export default function BackButton({ fallbackTo, label = "Back", className = "", flush = false, forceTo }) {
  const navigate = useNavigate();

  const handleBack = () => {
    // لو بعتنا له مكان معين (زي الهوم)، هيروح له علطول بضغطة واحدة
    if (forceTo) {
      navigate(forceTo);
    } 
    // لو مبعتناش حاجة، هيفضل شغال زي القديم ويرجع خطوة لورا عادي جداً في باقي الموقع
    else if (window.history.state?.idx > 0) {
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