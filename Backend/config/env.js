import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const result = dotenv.config({ path: join(__dirname, "../.env") });

console.log("Dotenv result:", result.error || "✅ loaded successfully");
console.log("MONGO_URI:", process.env.MONGO_URI);