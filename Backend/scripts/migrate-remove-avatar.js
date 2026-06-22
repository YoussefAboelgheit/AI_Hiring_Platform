
import "dotenv/config";
import dns from "dns";
import mongoose from "mongoose";

dns.setServers(["1.1.1.1", "8.8.8.8"]);
const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    const result = await mongoose.connection.db.collection("users").updateMany(
      {},
      {
        $unset: {
          avatar: "",
        },
      },
    );

    console.log(`Modified ${result.modifiedCount} documents`);

    await mongoose.disconnect();
    console.log("Migration completed");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

migrate();
