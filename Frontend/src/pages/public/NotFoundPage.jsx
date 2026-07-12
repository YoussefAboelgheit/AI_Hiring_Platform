import { Link } from "react-router-dom";
import BrandLogo from "../../components/common/BrandLogo";

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "var(--body-bg, #F8FAFC)",
      }}
    >
      <div className="text-center" style={{ maxWidth: 480 }}>
        <div className="mb-4 d-flex justify-content-center">
          <BrandLogo size="sm" linkTo="/" />
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "var(--primary)",
            lineHeight: 1,
            marginBottom: 12,
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Not Found</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 28, lineHeight: 1.6 }}>
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/" className="btn-primary-custom" style={{ textDecoration: "none" }}>
            Go Home
          </Link>
 
        </div>
      </div>
    </div>
  );
}
