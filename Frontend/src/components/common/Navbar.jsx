import { useState, useEffect, useRef } from "react";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    setDropdownOpen(false);
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userRole = user?.role || "candidate";
  const dashboardPath = `/${userRole}/dashboard`;
  const profilePath = `/${userRole}/profile`;

  return (
    <nav className="landing-nav">
      <BrandLogo size="md" linkTo={user ? dashboardPath : "/"} />
      
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
          <div className="nav-user-dropdown-container" ref={dropdownRef} style={{ position: "relative" }}>
            <button 
              type="button"
              className="nav-user-chip" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ cursor: "pointer", background: "none", border: "none", display: "flex", alignItems: "center", gap: "8px", padding: "4px 12px" }}
            >
              {/* التبديل الذكي بين الصورة الشخصية الحقيقية وأيقونة المستخدم الافتراضية */}
              {user.profile_image || user.avatar ? (
                <img 
                  src={user.profile_image || user.avatar} 
                  alt={user.name} 
                  style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} 
                />
              ) : (
                <i className="bi bi-person-circle" aria-hidden="true" style={{ fontSize: "18px" }} />
              )}
              
              <span>{user.name}</span>
              <i className={`bi bi-chevron-${dropdownOpen ? "up" : "down"}`} style={{ fontSize: "12px" }} />
            </button>

            {dropdownOpen && (
              <div 
                className="user-mini-menu" 
                style={{
                  position: "absolute",
                  right: 0,
                  top: "110%",
                  backgroundColor: "#fff",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  borderRadius: "8px",
                  padding: "8px 0",
                  minWidth: "160px",
                  zIndex: 1000,
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <Link 
                  to={dashboardPath} 
                  onClick={() => { setDropdownOpen(false); closeMenu(); }}
                  style={{ padding: "10px 16px", textDecoration: "none", color: "#333", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}
                >
                  <i className="bi bi-speedometer2" style={{ color: "#6366f1" }}></i>
                  Dashboard
                </Link>
                
                {userRole === "candidate" && (
                  <Link 
                    to={profilePath} 
                    onClick={() => { setDropdownOpen(false); closeMenu(); }}
                    style={{ padding: "10px 16px", textDecoration: "none", color: "#333", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}
                  >
                    <i className="bi bi-person text-secondary"></i>
                    My Profile
                  </Link>
                )}

                <hr style={{ margin: "4px 0", border: "none", borderTop: "1px solid #eee" }} />

                <button 
                  type="button" 
                  onClick={handleLogout}
                  style={{ padding: "10px 16px", background: "none", border: "none", color: "#dc3545", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", width: "100%", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  Logout
                </button>
              </div>
            )}
          </div>
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