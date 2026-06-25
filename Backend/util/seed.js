import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dns from "dns";             

dns.setServers(["1.1.1.1", "8.8.8.8"]);  
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

// dynamic imports AFTER dotenv.config()
const mongoose = (await import("mongoose")).default;
const User     = (await import("../models/user.js")).default;

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const existing = await User.findOne({ email: "admin@gmail.com" });
    if (existing) {
      console.log("Admin already exists, skipping seed");
      process.exit(0);
    }

    await User.create({
      name:       "Admin User",
      email:      "admin@gmail.com",
      password:   "admin123456",
      role:       "admin",
      isVerified: true,
    });

    console.log("✅ Admin user created successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seedAdmin();