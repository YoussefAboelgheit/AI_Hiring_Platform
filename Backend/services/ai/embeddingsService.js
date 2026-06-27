import { createClient } from "@supabase/supabase-js";
import ParsedResume from "../../models/parsedResume.js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    "Supabase credentials missing. Embeddings service will fail without them.",
  );
}

const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";

const chunkText = (parsed) => {
  const chunks = [];
  if (parsed.summary) chunks.push(parsed.summary);
  if (parsed.skills && parsed.skills.length)
    chunks.push(parsed.skills.join(", "));
  if (parsed.certifications && parsed.certifications.length)
    chunks.push(parsed.certifications.join(", "));
  (parsed.experience || []).forEach((e) => {
    chunks.push(
      `${e.title || ""} at ${e.company || ""} — ${e.description || ""}`.trim(),
    );
  });
  (parsed.education || []).forEach((ed) => {
    chunks.push(
      `${ed.degree || ""} ${ed.fieldOfStudy || ""} ${ed.institution || ""}`.trim(),
    );
  });
  if (parsed.projects && parsed.projects.length)
    parsed.projects.forEach((p) =>
      chunks.push(`${p.name || ""} ${p.description || ""}`.trim()),
    );
  // fallback to stringify whole resume if nothing extracted
  if (!chunks.length) chunks.push(JSON.stringify(parsed));
  return chunks.filter(Boolean).slice(0, 50); // limit to 50 chunks
};

export async function generateEmbeddingsForParsedResume(parsedResumeId) {
  if (!OPENAI_KEY)
    throw new Error("OPENAI_API_KEY not configured for embeddings generation");
  if (!supabase) throw new Error("Supabase client not initialized");

  const parsed = await ParsedResume.findById(parsedResumeId);
  if (!parsed) throw new Error("ParsedResume not found");

  const chunks = chunkText(parsed.parsedData);
  if (!chunks.length) throw new Error("No text chunks to embed");

  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: chunks }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Embeddings request failed: ${txt}`);
  }

  const body = await resp.json();
  const vectors = body.data.map((d) => d.embedding);

  // Prepare rows for Supabase table `cv_vectors` (ensure this table exists)
  const rows = vectors.map((embedding, i) => ({
    parsed_resume_id: parsedResumeId.toString(),
    chunk_index: i,
    text: chunks[i] || "",
    embedding,
  }));

  const { data: insertRes, error } = await supabase
    .from("cv_vectors")
    .insert(rows)
    .select();
  if (error) throw error;

  const refs = (insertRes || []).map((r) => r.id).filter(Boolean);
  if (refs.length) {
    await ParsedResume.findByIdAndUpdate(parsedResumeId, {
      $set: { embeddingRefs: refs },
    });
  }

  return insertRes;
}

export default { generateEmbeddingsForParsedResume };
