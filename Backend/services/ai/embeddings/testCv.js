import { generateEmbedding } from "./generatEmbeddingsServic.js";


const cvs = [
  "Node.js developer with Express and PostgreSQL experience",
  "React frontend developer with UI/UX skills",
  "Chef in hotel kitchen cooking food",
];

async function testCV() {
  console.log("🔹 CV EMBEDDINGS TEST\n");

  for (let i = 0; i < cvs.length; i++) {
    const vec = await generateEmbedding(cvs[i]);

    console.log(`CV${i + 1}: length =`, vec.length);
    console.log(vec.slice(0, 5));
    console.log("----------------------");
  }
}

testCV();
