import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import BrandLogo from "./BrandLogo";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About", to: "/about" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate("/login");
  };

  return (
    <nav className="landing-nav">
      <BrandLogo size="md" linkTo="/" />
      <button
        type="button"
        className="landing-nav-toggle d-lg-none"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-label="Toggle navigation menu"
      >
        <i className={`bi ${menuOpen ? "bi-x-lg" : "bi-list"}`} />
      </button>
      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        {navLinks.map((link) =>
          link.to ? (
            <Link key={link.label} to={link.to} onClick={closeMenu}>{link.label}</Link>
          ) : (
            <a key={link.label} href={link.href} onClick={closeMenu}>{link.label}</a>
          )
        )}

        {user ? (
          <>
            <span className="nav-user-chip">
              <i className="bi bi-person-circle" aria-hidden="true" />
              {user.name}
            </span>
            <button type="button" className="btn-outline-custom nav-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none nav-auth-link"
              onClick={() => { closeMenu(); navigate("/login"); }}
            >
              Login
            </button>
            <button type="button" className="btn-primary-custom" onClick={() => { closeMenu(); navigate("/register"); }}>
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
