import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// ── Import Middlewares ────────────────────────────────────────────────────────
import errorHandlingMW from "./middlewares/errorHandlingMW.js";
import notFoundMW from "./middlewares/notFoundMW.js";

// ── Import Routers ────────────────────────────────────────────────────────────
import authRouter from "./routes/auth.router.js";
import userRouter from "./routes/user.router.js";
const app = express();


// ── Global Middlewares ────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const origin = process.env.CLIENT_URL || "http://localhost:5173";
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(morgan("dev"));
app.use((req, res, next) => {
  if (req.headers["content-type"]?.startsWith("multipart/form-data")) {
    return next();
  }
  express.json({ limit: "25mb" })(req, res, next);
});
app.use(cookieParser());

// ── Route Mounting ────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);



app.use(notFoundMW);
app.use(errorHandlingMW);


export default app;