import { createClient } from "@supabase/supabase-js";
import HTTPError from "../util/httpError.js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VECTOR_TABLE_NAME = process.env.VECTOR_TABLE_NAME || "job_embeddings";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    "Supabase credentials missing. Vector service will fail without them.",
  );
}

const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

const ensureClient = () => {
  if (!supabase) {
    throw new HTTPError(500, "Supabase client is not initialized.");
  }
};

/**
 * Upsert a job embedding row in Supabase pgvector.
 * @param {string} jobId
 * @param {number[]} embedding
 * @param {Object} metadata
 * @returns {Promise<Object>}
 */
export const upsertJobEmbedding = async (jobId, embedding, metadata = {}) => {
  ensureClient();

  const row = {
    job_id: jobId,
    embedding,
    metadata: {
      ...metadata,
      jobId,
    },
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(VECTOR_TABLE_NAME)
    .upsert([row], { onConflict: "job_id" })
    .select();

  if (error) {
    throw new HTTPError(500, `Supabase vector upsert failed: ${error.message}`);
  }

  return data?.[0] ?? null;
};

/**
 * Search job embeddings by a query vector.
 * Future implementation may require a Supabase function for vector similarity.
 * @param {number[]} queryEmbedding
 * @param {number} limit
 * @returns {Promise<Object[]>}
 */
export const searchJobEmbeddings = async (queryEmbedding, limit = 10) => {
  ensureClient();

  const { data, error } = await supabase
    .from(VECTOR_TABLE_NAME)
    .select("*, metadata")
    .limit(limit);

  if (error) {
    throw new HTTPError(500, `Supabase vector search failed: ${error.message}`);
  }

  return data ?? [];
};
