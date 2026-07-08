import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Integrations", href: "#integrations" },
      { label: "Updates", href: "#updates" }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Blog", href: "#blog" },
      { label: "Contact", href: "#contact" }
    ]
  },
  {
    title: "Resources & Legal",
    links: [
      { label: "Help Center", href: "#help" },
      { label: "Documentation", href: "#docs" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", href: "#terms" }
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
          <a href="#terms">Terms of Service</a>
          <a href="#help">Help Center</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>
    );
  }

  return (
    <footer style={styles.footer}>
      <div className="container">
        <div className="row g-4 mb-5 text-start">

          {/* Brand col */}
          <div className="col-12 col-lg-4">
            <div className="mb-3">
              <BrandLogo size="lg" linkTo="/" />
            </div>
            <p style={styles.footerDesc}>
              The intelligent recruitment engine designed for modern hiring teams.
              Streamline screening, assessments, and feedback.
            </p>
            <div className="d-flex gap-3">
              {[
                { href: "#ln", icon: "bi-linkedin" },
                { href: "#gh", icon: "bi-github" },
                { href: "#tw", icon: "bi-twitter-x" },
              ].map((s) => (
                <a key={s.icon} href={s.href} style={styles.socialLink}>
                  <i className={`bi ${s.icon}`} />
                </a>
              ))}
            </div>
          </div>

          {/* Links cols */}
          <div className="col-12 col-lg-8">
            <div className="row g-4 justify-content-lg-end">
              {footerColumns.map((col) => (
                <div key={col.title} className="col-6 col-md-4 col-lg-3">
                  <h6 style={styles.colTitle}>{col.title}</h6>
                  <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        {link.to ? (
                          <Link to={link.to} style={styles.colLink}>{link.label}</Link>
                        ) : (
                          <a href={link.href} style={styles.colLink}>{link.label}</a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={styles.bottomBar}>
          <span style={{ color: "#64748B", fontSize: 13 }}>
            © {new Date().getFullYear()} HireAI Recruitment. All rights reserved.
          </span>
          <div className="d-flex gap-4">
            <Link to="/login" style={styles.portalLink}>Recruiter Portal</Link>
            <Link to="/login" style={styles.portalLink}>Candidate Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: "#F8FAFC",
    borderTop: "1px solid #E2E8F0",
    paddingTop: 60,
    paddingBottom: 32,
    marginTop: "auto",
  },
  footerDesc: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 1.7,
    maxWidth: 300,
    marginBottom: 20,
  },
  socialLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#f3f5fb",
    color: "#1d2445",
    fontSize: 16,
    textDecoration: "none",
    transition: "background 0.2s",
  },
  colTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#94A3B8",
    marginBottom: 14,
  },
  colLink: {
    fontSize: 14,
    color: "#475569",
    textDecoration: "none",
  },
  bottomBar: {
    borderTop: "1px solid #E2E8F0",
    paddingTop: 20,
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  portalLink: {
    fontSize: 13,
    color: "#1d2445",
    textDecoration: "none",
    fontWeight: 500,
  },
};