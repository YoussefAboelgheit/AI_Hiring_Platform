export default function EmptyState({ icon = "bi-inbox", title, description, action }) {
  return (
    <div className="text-center py-5 px-3">
      <i className={`bi ${icon} text-muted`} style={{ fontSize: 40, display: "block", marginBottom: 12 }} aria-hidden="true" />
      {title && <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>}
      {description && <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 420, margin: "0 auto 16px" }}>{description}</p>}
      {action}
    </div>
  );
}
