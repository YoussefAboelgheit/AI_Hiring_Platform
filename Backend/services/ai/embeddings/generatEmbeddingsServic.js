const OLLAMA_EMBED_URL =
  process.env.OLLAMA_EMBED_URL || "http://localhost:11434/api/embed";

const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

/* =========================
   GENERIC EMBEDDING (CV + JOB)
========================= */
export async function generateEmbedding(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid input text for embedding");
  }

  const response = await fetch(OLLAMA_EMBED_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_EMBED_MODEL,
      input: text,
    }),
  });

  const data = await response.json();

  // DEBUG (important)
  // console.log("OLLAMA RAW:", data);

  const embedding = data.embedding || data.embeddings?.[0] || data.data?.[0];

  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error("Invalid embedding returned from Ollama");
  }

  return embedding;
}
