import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// =========================
// FORCE LOAD .env FROM ROOT
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../../../.env");

dotenv.config({ path: envPath });

console.log("Working Directory:", process.cwd());
console.log("Env Path:", envPath);
console.log("Env Loaded:", process.env.GEMINI_API_KEY ? "YES" : "NO");
console.log("Model:", process.env.GEMINI_MODEL);

// =========================
// IMPORT AFTER ENV LOADING
// =========================
import { parseResumeWithAI } from "./resumeParserService.js";

// =========================
// TEST FILE
// =========================
const filePath = path.join(__dirname, "AbanoubMaqqar_Reactjs.pdf");

async function test() {
  try {
    console.log("\nReading CV...");

    const buffer = fs.readFileSync(filePath);

    console.log("Calling Gemini...\n");

    const parsed = await parseResumeWithAI(buffer, "application/pdf");

    console.log("\nSUCCESS RESULT:\n");
    console.log(JSON.stringify(parsed, null, 2));
  } catch (err) {
    console.error("\nERROR:\n", err);
  }
}

test();
