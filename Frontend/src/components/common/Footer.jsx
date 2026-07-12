import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import "./Footer.css";

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" }
    ]
  }
];

export default function Footer({ variant = "landing" }) {
  if (variant === "app") {
    return (
      <footer className="page-footer">
        <span>HireAI · © 2026 HireAI Recruitment. All rights reserved.</span>
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <div className="mb-3">
              <BrandLogo size="lg" linkTo="/" />
            </div>
            <p className="site-footer-desc">
              The intelligent recruitment engine designed for modern hiring teams.
              Streamline screening, assessments, and feedback.
            </p>
            <div className="d-flex gap-3">
              {[
                { href: "#ln", icon: "bi-linkedin" },
                { href: "#gh", icon: "bi-github" },
                { href: "#tw", icon: "bi-twitter-x" },
              ].map((s) => (
                <a key={s.icon} href={s.href} className="site-footer-social">
                  <i className={`bi ${s.icon}`} />
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title} className="site-footer-col">
              <h6 className="site-footer-col-title">{col.title}</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to} className="site-footer-link">{link.label}</Link>
                    ) : (
                      <a href={link.href} className="site-footer-link">{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="site-footer-bottom">
          <span>© {new Date().getFullYear()} HireAI Recruitment. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
