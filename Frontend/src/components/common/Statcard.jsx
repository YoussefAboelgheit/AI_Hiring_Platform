// One shared stat-card look, used on the Recruiter Dashboard and the My Jobs page
// so the two no longer look like they came from different apps.
// `tint` picks from a small brand-consistent palette instead of arbitrary hex codes.
const TINTS = {
  navy: { bg: "#EEF0F8", iconBg: "#DDE1F0", iconColor: "#1d2445" },
  navyLight: { bg: "#EEF0F8", iconBg: "#E3E6F2", iconColor: "#374172" },
  teal: { bg: "#EAF7F4", iconBg: "#CCFBF1", iconColor: "#0D9488" },
  tealDark: { bg: "#E3F5F1", iconBg: "#B9EDE3", iconColor: "#0F766E" },
};

export default function StatCard({ icon, label, value, change, negative = false, tint = "navy" }) {
  const c = TINTS[tint] || TINTS.navy;

  return (
    <div
      className="hcard stat-card border-0 shadow-sm p-4"
      style={{
        backgroundColor: c.bg,
        borderRadius: 16,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        cursor: "default",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(31,41,55,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ background: c.iconBg, width: 40, height: 40, fontSize: 18, borderRadius: 12 }}
        >
          <i className={`bi ${icon}`} style={{ color: c.iconColor }} />
        </div>
        {change && (
          <span style={{ fontSize: 12, color: negative ? "var(--danger)" : "var(--success)", fontWeight: 700 }}>
            {change}
          </span>
        )}
      </div>
      <div className="fw-bold" style={{ fontSize: 32, color: "#1F2937", marginBottom: 4 }}>
        {value}
      </div>
      <div className="text-secondary" style={{ fontSize: 13, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}