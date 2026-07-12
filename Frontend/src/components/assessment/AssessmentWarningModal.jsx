import { Modal, Button } from "react-bootstrap";

const TYPE_STYLES = {
  TAB_SWITCH: { icon: "bi-window-stack", bg: "#FEF3C7", iconColor: "#D97706" },
  FULLSCREEN_EXIT: { icon: "bi-fullscreen-exit", bg: "#FEF3C7", iconColor: "#D97706" },
  RIGHT_CLICK: { icon: "bi-hand-index", bg: "#FEE2E2", iconColor: "#DC2626" },
  COPY: { icon: "bi-files", bg: "#FEE2E2", iconColor: "#DC2626" },
  PASTE: { icon: "bi-clipboard", bg: "#FEE2E2", iconColor: "#DC2626" },
  CUT: { icon: "bi-scissors", bg: "#FEE2E2", iconColor: "#DC2626" },
  DRAG_START: { icon: "bi-arrows-move", bg: "#FEE2E2", iconColor: "#DC2626" },
  DEVTOOLS_SHORTCUT: { icon: "bi-terminal", bg: "#FEE2E2", iconColor: "#DC2626" },
};

const WARNING_ICON = { icon: "bi-exclamation-triangle-fill", bg: "#FEF3C7", iconColor: "#D97706" };

export default function AssessmentWarningModal({ show, onHide, violation, showThreshold }) {
  const isFinal = showThreshold;
  const style = isFinal ? WARNING_ICON : (violation ? TYPE_STYLES[violation.type] || TYPE_STYLES.TAB_SWITCH : WARNING_ICON);

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: 18, fontWeight: 700 }}>
          {isFinal ? "Final Warning" : (violation?.title || "Violation Detected")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: style.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <i className={`bi ${style.icon}`} style={{ fontSize: 20, color: style.iconColor }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ marginBottom: 4, fontWeight: 600, whiteSpace: "pre-line" }}>
              We detected an activity that violates the assessment rules.
            </p>
            <p style={{ marginBottom: 4, color: "var(--text-muted)", fontSize: 14, whiteSpace: "pre-line" }}>
              Please remain on the assessment page, keep Fullscreen mode enabled, and do not copy, paste, or attempt to access external resources during the assessment.
            </p>
            <p style={{ marginBottom: 0, fontWeight: 600, fontSize: 14, color: isFinal ? "#DC2626" : "#D97706" }}>
              {isFinal
                ? "Any additional violation will automatically submit your assessment."
                : "This violation has been recorded."}
            </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant={isFinal ? "warning" : "primary"}
          onClick={onHide}
          style={{ fontWeight: 600 }}
        >
          I understand
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
