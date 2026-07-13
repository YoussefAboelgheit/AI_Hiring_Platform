import { Link } from "react-router-dom";
import logoSrc from "../../assets/illustrations/hire-ai-logo.png";
// Dedicated version of the logo made for the sidebar's dark background — the
// default logo's dark text/shapes get lost there, so "sidebar" size gets this
// one instead while every other size (navbar, footer, etc.) keeps the original.
import sidebarLogoSrc from "../../assets/illustrations/joblio-logo-sidebar.png";

const LANDING_PATH = "/";

export default function BrandLogo({
  size = "md",
  linkTo = LANDING_PATH,
  asLink = true,
  className = "",
}) {
  const resolvedSrc = size === "sidebar" ? sidebarLogoSrc : logoSrc;
  const img = (
    <img
      src={resolvedSrc}
      alt="Hire AI"
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
        aria-label="Go to Hire AI home page"
        title="Go to home page"
      >
        {img}
      </Link>
    );
  }

  return img;
}