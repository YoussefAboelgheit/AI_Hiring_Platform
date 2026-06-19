import { Link } from "react-router-dom";
import logoSrc from "../../assets/illustrations/images.png";

const LANDING_PATH = "/";

export default function BrandLogo({
  size = "md",
  linkTo = LANDING_PATH,
  asLink = true,
  className = "",
}) {
  const img = (
    <img
      src={logoSrc}
      alt="HireAI Workforce"
      className={`brand-logo brand-logo--${size} ${className}`.trim()}
      decoding="async"
      draggable={false}
    />
  );

  if (asLink && linkTo) {
    return (
      <Link
        to={linkTo}
        className="brand-logo-link"
        aria-label="Go to HireAI home page"
        title="Go to home page"
      >
        {img}
      </Link>
    );
  }

  return img;
}
