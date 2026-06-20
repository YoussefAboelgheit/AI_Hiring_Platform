import app from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();



const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB Connection error:", err.message);
    process.exit(1);
  });



const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
