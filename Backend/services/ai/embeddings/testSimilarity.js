import { generateEmbedding } from "./generatEmbeddingsServic.js";

/* =========================
   COSINE SIMILARITY
========================= */
function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;

  const len = Math.min(a.length, b.length);

  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

/* =========================
   DATA
========================= */
const job =
  "Senior Backend Developer with Node.js, PostgreSQL, Docker, Microservices";

const cvs = [
  {
    id: "cv1",
    text: "Node.js developer with Express and PostgreSQL experience",
  },
  {
    id: "cv2",
    text: "React frontend developer with UI/UX skills, Microservices,js,",
  },
  {
    id: "cv3",
    text: "Chef in hotel kitchen cooking food",
  },
];

/* =========================
   MAIN
========================= */
async function run() {
  console.log("🔹 Generating job embedding...");
  const jobVec = await generateEmbedding(job);

  console.log("🔹 Generating CV embeddings...\n");

  const results = [];

  for (const cv of cvs) {
    const cvVec = await generateEmbedding(cv.text);

    const score = cosineSimilarity(jobVec, cvVec);

    results.push({
      id: cv.id,
      score,
    });
  }

  results.sort((a, b) => b.score - a.score);

  console.log("\n🔹 TOP MATCHES:\n");
  console.log(results);
}

run();
