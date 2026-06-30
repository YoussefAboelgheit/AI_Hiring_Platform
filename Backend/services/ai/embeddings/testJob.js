import { generateEmbedding } from "./generatEmbeddingsServic.js";

const jobs = [
  "Senior Backend Developer with Node.js, PostgreSQL, Docker",
  "Frontend React Developer with Tailwind and UI/UX",
  "DevOps Engineer with AWS, Kubernetes, CI/CD",
];

async function testJobs() {
  console.log("🔹 JOB EMBEDDINGS TEST\n");

  for (let i = 0; i < jobs.length; i++) {
    const vec = await generateEmbedding(jobs[i]);

    console.log(`Job${i + 1}: length =`, vec.length);
    console.log(vec.slice(0, 5));
    console.log("----------------------");
  }
}

testJobs();
