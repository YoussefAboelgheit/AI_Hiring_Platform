import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as chatService from "../../services/chatService";
import * as applicationService from "../../services/applicationService";
import LoadingState from "../../components/common/LoadingState";

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return formatTime(dateStr);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function ChatPage() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [newChatType, setNewChatType] = useState("general");
  const [newChatJobId, setNewChatJobId] = useState("");
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [creating, setCreating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const activeConversation = conversations.find((c) => c._id === activeId);
  const isMockInterview = activeConversation?.type === "mock_interview";
  const isCompleted = activeConversation?.status === "completed";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const { data } = await chatService.getConversations();
      setConversations(data || []);
    } catch {
      // ignore
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (id) => {
    if (!id) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    try {
      const { data } = await chatService.getConversation(id);
      setMessages(data.messages || []);
    } catch {
      // ignore
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadConversations();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMessages(activeId);
  }, [activeId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !activeId) return;
    setInput("");
    setSending(true);

    const tempUser = { role: "user", content: text, _id: `temp-${Date.now()}` };
    setMessages((prev) => [...prev, tempUser]);

    try {
      const { data } = await chatService.sendMessage(activeId, text);
      setMessages((prev) => [
        ...prev.filter((m) => m._id !== tempUser._id),
        data.userMessage,
        data.assistantMessage,
      ]);
      loadConversations();
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === tempUser._id
            ? { ...m, failed: true }
            : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = async () => {
    if (newChatType === "mock_interview" && !newChatJobId) return;
    setCreating(true);
    try {
      const payload = { type: newChatType };
      if (newChatType === "mock_interview") payload.jobId = newChatJobId;
      const { data } = await chatService.createConversation(payload);
      setShowNewChat(false);
      setNewChatType("general");
      setNewChatJobId("");
      await loadConversations();
      setActiveId(data.conversation._id);
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  const handleEndInterview = async () => {
    if (!activeId) return;
    setSending(true);
    try {
      const { data } = await chatService.endInterview(activeId);
      setMessages((prev) => [...prev, data.summary]);
      loadConversations();
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  const handleDelete = (id, title) => {
    setDeleteTarget({ id, title });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleting(id);
    try {
      await chatService.deleteConversation(id);
      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
      }
      setConversations((prev) => prev.filter((c) => c._id !== id));
      setDeleteTarget(null);
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  };

  const openNewChat = async () => {
    setShowNewChat(true);
    setNewChatType("general");
    setNewChatJobId("");
    try {
      const apps = await applicationService.getMyApplications();
      setAppliedJobs(apps || []);
    } catch {
      setAppliedJobs([]);
    }
  };

  const selectConversation = (id) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  const typeIcon = (type) =>
    type === "mock_interview" ? "bi-person-workspace" : "bi-chat-dots";

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--body-bg)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
            zIndex: 999,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: 320, flexShrink: 0, background: "#fff",
          borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          position: "relative",
          zIndex: 1000,
        }}
        className={`${sidebarOpen ? "d-flex" : "d-none d-md-flex"}`}
      >
        <div
          style={{
            padding: "16px 20px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
            <i className="bi bi-chat-dots me-2" style={{ color: "var(--primary)" }} />
            AI Chat
          </h2>
          <button
            className="btn btn-sm"
            style={{ background: "var(--primary)", color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: 12 }}
            onClick={openNewChat}
          >
            <i className="bi bi-plus-lg me-1" /> New
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {loadingConversations ? (
            <LoadingState message="Loading conversations..." />
          ) : conversations.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              No conversations yet.
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c._id}
                onClick={() => selectConversation(c._id)}
                style={{
                  padding: "12px 20px", cursor: "pointer", borderBottom: "1px solid var(--border)",
                  background: activeId === c._id ? "var(--primary-bg)" : "#fff",
                  transition: "background 0.15s",
                  position: "relative",
                }}
                onMouseEnter={(e) => { e.currentTarget.querySelector(".chat-delete-btn").style.opacity = 1; }}
                onMouseLeave={(e) => { e.currentTarget.querySelector(".chat-delete-btn").style.opacity = 0; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <i className={`bi ${typeIcon(c.type)}`} style={{ color: "var(--primary)", fontSize: 14 }} />
                  <span style={{ fontWeight: 600, fontSize: 13, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.title}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0, marginRight: 24 }}>
                    {formatDate(c.updatedAt)}
                  </span>
                </div>
                {c.status === "completed" && (
                  <span
                    className="badge rounded-pill"
                    style={{ fontSize: 10, background: "#D1FAE5", color: "#065F46" }}
                  >
                    Completed
                  </span>
                )}
                <button
                  className="chat-delete-btn"
                  onClick={(e) => { e.stopPropagation(); handleDelete(c._id, c.title); }}
                  disabled={deleting === c._id}
                  style={{
                    position: "absolute", top: 8, right: 8, opacity: 0,
                    transition: "opacity 0.15s",
                    background: "none", border: "none", padding: "4px 6px",
                    color: "#DC2626", fontSize: 14, cursor: "pointer",
                  }}
                  title="Delete conversation"
                >
                  <i className="bi bi-trash" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <div
          style={{
            padding: "12px 20px", borderBottom: "1px solid var(--border)",
            background: "#fff", display: "flex", alignItems: "center", gap: 12,
          }}
        >
          <button
            className="btn d-md-none"
            onClick={() => setSidebarOpen(true)}
            style={{ padding: "4px 8px", fontSize: 18 }}
          >
            <i className="bi bi-list" />
          </button>
          {activeConversation ? (
            <>
              <i className={`bi ${typeIcon(activeConversation.type)}`} style={{ color: "var(--primary)", fontSize: 18 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{activeConversation.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {activeConversation.type === "mock_interview" ? "Mock Interview" : "General Chat"}
                  {isCompleted && " · Completed"}
                </div>
              </div>
            </>
          ) : (
            <span style={{ color: "var(--text-muted)", fontSize: 14 }}>AI Chat Assistant</span>
          )}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button
              className="btn-outline-custom"
              style={{ padding: "6px 14px", fontSize: 12 }}
              onClick={() => navigate("/candidate/dashboard")}
            >
              <i className="bi bi-arrow-left me-1" /> Back
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
          {!activeId ? (
            <div
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", height: "100%", color: "var(--text-muted)",
                textAlign: "center", gap: 12,
              }}
            >
              <i className="bi bi-chat-dots" style={{ fontSize: 48, opacity: 0.3 }} />
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-muted)", margin: 0 }}>
                AI Chat Assistant
              </h3>
              <p style={{ fontSize: 13, maxWidth: 360, margin: 0 }}>
                Start a new conversation for general career chat or a job-specific mock interview.
              </p>
              <button
                className="btn-primary-custom"
                style={{ padding: "10px 28px", fontSize: 14 }}
                onClick={openNewChat}
              >
                <i className="bi bi-plus-lg me-2" />New Conversation
              </button>
            </div>
          ) : loadingMessages ? (
            <LoadingState message="Loading messages..." />
          ) : messages.length === 0 ? (
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "100%", color: "var(--text-muted)", fontSize: 14,
              }}
            >
              Start the conversation by typing a message below.
            </div>
          ) : (
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
              {messages.map((m, i) => (
                <div
                  key={m._id || i}
                  style={{
                    display: "flex",
                    justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      padding: "10px 16px",
                      borderRadius: 16,
                      background: m.role === "user" ? "var(--primary)" : "#fff",
                      color: m.role === "user" ? "#fff" : "var(--text-dark)",
                      border: m.role === "user" ? "none" : "1px solid var(--border)",
                      fontSize: 14,
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.content}
                    {m.failed && (
                      <div style={{ fontSize: 11, color: "#991B1B", marginTop: 4 }}>
                        Failed to send. Try again.
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
                  <div
                    style={{
                      padding: "12px 20px", borderRadius: 16,
                      background: "#fff", border: "1px solid var(--border)",
                      display: "flex", gap: 4,
                    }}
                  >
                    <span style={{ animation: "blink 1.4s infinite both" }}>.</span>
                    <span style={{ animation: "blink 1.4s infinite both", animationDelay: "0.2s" }}>.</span>
                    <span style={{ animation: "blink 1.4s infinite both", animationDelay: "0.4s" }}>.</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        {activeId && !isCompleted && (
          <div
            style={{
              padding: "12px 20px", borderTop: "1px solid var(--border)",
              background: "#fff",
            }}
          >
            <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 8, alignItems: "flex-end" }}>

              <div style={{ flex: 1, position: "relative" }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  disabled={sending}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1px solid var(--border)", fontSize: 14,
                    resize: "none", outline: "none", fontFamily: "inherit",
                    background: sending ? "#F9FAFB" : "#fff",
                  }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                  }}
                />
              </div>
              <button
                className="btn"
                onClick={handleSend}
                disabled={!input.trim() || sending}
                style={{
                  padding: "10px 18px", borderRadius: 10,
                  background: input.trim() && !sending ? "var(--primary)" : "#E5E7EB",
                  color: input.trim() && !sending ? "#fff" : "#9CA3AF",
                  border: "none", fontWeight: 600, fontSize: 14, flexShrink: 0,
                }}
              >
                <i className="bi bi-send-fill" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 2000, padding: 16,
          }}
          onClick={() => setShowNewChat(false)}
        >
          <div
            className="hcard"
            style={{ maxWidth: 440, width: "100%", padding: "28px 24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              New Conversation
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
                Type
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <label
                  style={{
                    flex: 1, padding: "10px 14px", borderRadius: 10,
                    border: `2px solid ${newChatType === "general" ? "var(--primary)" : "var(--border)"}`,
                    cursor: "pointer", textAlign: "center", fontSize: 13, fontWeight: 600,
                    background: newChatType === "general" ? "var(--primary-bg)" : "#fff",
                  }}
                >
                  <input
                    type="radio"
                    name="chatType"
                    value="general"
                    checked={newChatType === "general"}
                    onChange={() => setNewChatType("general")}
                    style={{ display: "none" }}
                  />
                  <i className="bi bi-chat-dots me-2" />
                  General Chat
                </label>
                <label
                  style={{
                    flex: 1, padding: "10px 14px", borderRadius: 10,
                    border: `2px solid ${newChatType === "mock_interview" ? "var(--primary)" : "var(--border)"}`,
                    cursor: "pointer", textAlign: "center", fontSize: 13, fontWeight: 600,
                    background: newChatType === "mock_interview" ? "var(--primary-bg)" : "#fff",
                  }}
                >
                  <input
                    type="radio"
                    name="chatType"
                    value="mock_interview"
                    checked={newChatType === "mock_interview"}
                    onChange={() => setNewChatType("mock_interview")}
                    style={{ display: "none" }}
                  />
                  <i className="bi bi-person-workspace me-2" />
                  Mock Interview
                </label>
              </div>
            </div>

            {newChatType === "mock_interview" && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
                  Select a Job
                </label>
                <select
                  className="form-select"
                  value={newChatJobId}
                  onChange={(e) => setNewChatJobId(e.target.value)}
                  style={{ borderRadius: 10, fontSize: 13, padding: "10px 12px" }}
                >
                  <option value="">-- Select a job --</option>
                  {appliedJobs
                    .filter((app) => app.jobId)
                    .map((app) => (
                      <option key={app.jobId} value={app.jobId}>
                        {app.jobTitle}
                      </option>
                    ))}
                </select>
                {appliedJobs.length === 0 && (
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                    No job applications found. Apply to a job first.
                  </p>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                className="btn-outline-custom"
                style={{ padding: "8px 20px", fontSize: 13 }}
                onClick={() => setShowNewChat(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary-custom"
                style={{ padding: "8px 20px", fontSize: 13 }}
                disabled={
                  creating ||
                  (newChatType === "mock_interview" && !newChatJobId)
                }
                onClick={handleNewChat}
              >
                {creating ? "Creating..." : "Start"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 2100, padding: 16,
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="hcard"
            style={{ maxWidth: 400, width: "100%", padding: "28px 24px", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12, margin: "0 auto 16px",
              background: "#FEE2E2",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <i className="bi bi-trash" style={{ color: "#DC2626", fontSize: 20 }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              Delete Conversation
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginBottom: 24 }}>
              Are you sure you want to delete "<strong>{deleteTarget.title}</strong>"? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                className="btn-outline-custom"
                style={{ padding: "8px 20px", fontSize: 13 }}
                onClick={() => setDeleteTarget(null)}
                disabled={deleting === deleteTarget.id}
              >
                Cancel
              </button>
              <button
                className="btn-primary-custom"
                style={{ padding: "8px 20px", fontSize: 13, background: "#DC2626", borderColor: "#DC2626" }}
                disabled={deleting === deleteTarget.id}
                onClick={confirmDelete}
              >
                {deleting === deleteTarget.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
