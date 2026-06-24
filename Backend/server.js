import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/DB.js";



const PORT = process.env.PORT || 3001;

await connectDB();

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Swagger docs for Jobs are available at http://localhost:${PORT}/docs`);
});
