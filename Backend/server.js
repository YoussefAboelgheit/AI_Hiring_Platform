import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/DB.js";
import { publishExpiredDraftJobs } from "./services/jobEnrichment.service.js";

const PORT = process.env.PORT || 3001;

await connectDB();
import dns from "node:dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Every 60 seconds, auto-publish any draft jobs whose 5-minute editing window expired
// This ensures status changes to active even if server restarts and setTimeout timers are lost
setInterval(async () => {
  try {
    await publishExpiredDraftJobs();
  } catch (err) {
    console.error("Background draft-publishing check failed:", err?.message || err);
  }
}, 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Swagger docs for Jobs are available at http://localhost:${PORT}/docs`);
});
