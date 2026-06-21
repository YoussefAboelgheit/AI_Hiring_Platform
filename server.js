import "dotenv/config";
import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

import app from "./app.js";
import mongoose from "mongoose";



const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected successfully");
    try {
      await mongoose.connection.db.collection("users").updateMany({}, { $unset: { avatar: "" } });
    } catch (migrateErr) {
      // Silently ignore migration errors
    }
  })
  .catch((err) => {
    console.error("MongoDB Connection error:", err.message);
    process.exit(1);
  });



const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});