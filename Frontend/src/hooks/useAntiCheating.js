import { useRef, useState, useCallback } from "react";
import { reportViolation } from "../services/assessmentViolation.service";

const MAX_VIOLATIONS = 3;
const VIOLATION_DEBOUNCE_MS = 3000;

const GENERIC_DESCRIPTION =
  "We detected an activity that violates the assessment rules.\n\n" +
  "Please remain on the assessment page, keep Fullscreen mode enabled, " +
  "and do not copy, paste, or attempt to access external resources during the assessment.\n\n" +
  "This violation has been recorded.";

const VIOLATION_LABELS = {
  TAB_SWITCH: {
    icon: "bi-window-stack",
    title: "Tab Switch Detected",
    description: GENERIC_DESCRIPTION,
  },
  FULLSCREEN_EXIT: {
    icon: "bi-fullscreen-exit",
    title: "Fullscreen Exited",
    description: GENERIC_DESCRIPTION,
  },
  RIGHT_CLICK: {
    icon: "bi-hand-index",
    title: "Right-Click Blocked",
    description: GENERIC_DESCRIPTION,
  },
  COPY: {
    icon: "bi-files",
    title: "Copy Blocked",
    description: GENERIC_DESCRIPTION,
  },
  PASTE: {
    icon: "bi-clipboard",
    title: "Paste Blocked",
    description: GENERIC_DESCRIPTION,
  },
  CUT: {
    icon: "bi-scissors",
    title: "Cut Blocked",
    description: GENERIC_DESCRIPTION,
  },
  DRAG_START: {
    icon: "bi-arrows-move",
    title: "Drag Blocked",
    description: GENERIC_DESCRIPTION,
  },
  DEVTOOLS_SHORTCUT: {
    icon: "bi-terminal",
    title: "Developer Tools Blocked",
    description: GENERIC_DESCRIPTION,
  },
};

export default function useAntiCheating({ jobId, onAutoSubmit }) {
  const [violations, setViolations] = useState([]);
  const [violationCount, setViolationCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [latestViolation, setLatestViolation] = useState(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const monitoringRef = useRef(false);
  const violationCountRef = useRef(0);
  const autoSubmittedRef = useRef(false);
  const cleanupRef = useRef(null);
  const onAutoSubmitRef = useRef(onAutoSubmit);
  const pendingThresholdRef = useRef(false);
  const monitoringStartRef = useRef(0);
  const COOLDOWN_MS = 3000;

  const lastViolationTypeRef = useRef(null);
  const lastViolationTimeRef = useRef(0);

  onAutoSubmitRef.current = onAutoSubmit;

  const handleViolation = useCallback(async (type) => {
    if (autoSubmittedRef.current) return;

    const now = Date.now();
    if (now - monitoringStartRef.current < COOLDOWN_MS) return;

    if (
      type === lastViolationTypeRef.current &&
      now - lastViolationTimeRef.current < VIOLATION_DEBOUNCE_MS
    ) {
      return;
    }
    lastViolationTypeRef.current = type;
    lastViolationTimeRef.current = now;

    const newCount = violationCountRef.current + 1;
    violationCountRef.current = newCount;
    setViolationCount(newCount);
    setViolations((prev) => [...prev, { type, timestamp: new Date().toISOString() }]);

    const violationInfo = {
      ...VIOLATION_LABELS[type],
      type,
      timestamp: new Date().toISOString(),
      count: newCount,
      maxViolations: MAX_VIOLATIONS,
    };

    if (newCount > MAX_VIOLATIONS) {
      autoSubmittedRef.current = true;
      setAutoSubmitted(true);
      if (onAutoSubmitRef.current) onAutoSubmitRef.current();
      return;
    }

    if (newCount >= MAX_VIOLATIONS) {
      pendingThresholdRef.current = true;
    }

    setLatestViolation(violationInfo);

    try {
      await reportViolation(jobId, type);
    } catch {
      // Continue assessment
    }
  }, [jobId]);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
  }, []);

  const clearLatestViolation = useCallback(() => {
    setLatestViolation(null);
    if (pendingThresholdRef.current) {
      pendingThresholdRef.current = false;
      setShowWarning(true);
    }
  }, []);

  const startMonitoring = useCallback(() => {
    if (monitoringRef.current) return null;
    monitoringRef.current = true;
    monitoringStartRef.current = Date.now();

    const handlers = {};

    handlers.handleVisibility = () => {
      if (document.hidden) {
        handleViolation("TAB_SWITCH");
      }
    };

    handlers.handleBlur = () => {
      handleViolation("TAB_SWITCH");
    };

    handlers.handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleViolation("FULLSCREEN_EXIT");
      }
    };

    handlers.handleContextMenu = (e) => {
      e.preventDefault();
      handleViolation("RIGHT_CLICK");
    };

    handlers.handleCopy = (e) => {
      e.preventDefault();
      handleViolation("COPY");
    };

    handlers.handlePaste = (e) => {
      e.preventDefault();
      handleViolation("PASTE");
    };

    handlers.handleCut = (e) => {
      e.preventDefault();
      handleViolation("CUT");
    };

    handlers.handleDragStart = (e) => {
      e.preventDefault();
      handleViolation("DRAG_START");
    };

    handlers.handleKeyDown = (e) => {
      const isDevtoolsShortcut =
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "J" || e.key === "j")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "C" || e.key === "c")) ||
        (e.ctrlKey && (e.key === "U" || e.key === "u")) ||
        (e.metaKey && e.altKey && (e.key === "I" || e.key === "i"));
      if (isDevtoolsShortcut) {
        e.preventDefault();
        handleViolation("DEVTOOLS_SHORTCUT");
      }
    };

    document.addEventListener("visibilitychange", handlers.handleVisibility);
    window.addEventListener("blur", handlers.handleBlur);
    document.addEventListener("fullscreenchange", handlers.handleFullscreenChange);
    document.addEventListener("contextmenu", handlers.handleContextMenu);
    document.addEventListener("copy", handlers.handleCopy);
    document.addEventListener("paste", handlers.handlePaste);
    document.addEventListener("cut", handlers.handleCut);
    document.addEventListener("dragstart", handlers.handleDragStart);
    document.addEventListener("keydown", handlers.handleKeyDown);

    const cleanup = () => {
      document.removeEventListener("visibilitychange", handlers.handleVisibility);
      window.removeEventListener("blur", handlers.handleBlur);
      document.removeEventListener("fullscreenchange", handlers.handleFullscreenChange);
      document.removeEventListener("contextmenu", handlers.handleContextMenu);
      document.removeEventListener("copy", handlers.handleCopy);
      document.removeEventListener("paste", handlers.handlePaste);
      document.removeEventListener("cut", handlers.handleCut);
      document.removeEventListener("dragstart", handlers.handleDragStart);
      document.removeEventListener("keydown", handlers.handleKeyDown);
      monitoringRef.current = false;
    };

    cleanupRef.current = cleanup;
    return cleanup;
  }, [handleViolation]);

  const stopMonitoring = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    monitoringRef.current = false;
    setViolations([]);
    setViolationCount(0);
    setShowWarning(false);
    setLatestViolation(null);
    setAutoSubmitted(false);
    violationCountRef.current = 0;
    autoSubmittedRef.current = false;
    pendingThresholdRef.current = false;
    lastViolationTypeRef.current = null;
    lastViolationTimeRef.current = 0;
  }, []);

  return {
    violations,
    violationCount,
    showWarning,
    latestViolation,
    autoSubmitted,
    startMonitoring,
    stopMonitoring,
    dismissWarning,
    clearLatestViolation,
  };
}
