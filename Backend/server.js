import "dotenv/config";
import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

import app from "./app.js";
import connectDB from "./config/DB.js"; 
import "dotenv/config";



connectDB();





const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});