export const assessmentData = {
  id: "as1",
  title: "Senior UX Engineering Assessment",
  totalQuestions: 20,
  currentQuestion: 12,
  timeLeft: "24:45",
  progress: 60,
  question: {
    number: 12,
    category: "Logic & Architecture",
    text: "Given a high-load microservices environment, which caching strategy would you implement to ensure zero-stale data consistency across distributed nodes while maintaining sub-10ms latency?",
    options: [
      { id: "A", text: "Write-Through Cache with Redis-PubSub invalidation.", desc: "Ensures immediate updates to the database and broadcasts changes to all active nodes via a message bus." },
      { id: "B", text: "Strict Consistency using Raft Consensus Algorithm.", desc: "Guarantees all nodes agree on the same value before returning, prioritizing consistency over availability." },
      { id: "C", text: "Lazy Loading with Time-to-Live (TTL) expiration.", desc: "Optimizes read performance by fetching only when missed, relying on short TTL for data freshness." },
      { id: "D", text: "Local memory-mapped file buffers with sync-locks.", desc: "Utilizes OS-level caching mechanisms for extremely high local performance within a single instance environment." },
    ],
  },
};
