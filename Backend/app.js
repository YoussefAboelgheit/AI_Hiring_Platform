import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";

import errorHandlingMW from "./middlewares/errorHandlingMW.js";
import notFoundMW from "./middlewares/notFoundMW.js";

import authRouter from "./routes/auth.router.js";
import jobRouter from "./routes/job.router.js";
import userRouter from "./routes/user.router.js";
import categoryRouter from "./routes/category.router.js";
import cvRouter from "./routes/cv.router.js";

const app = express();

//@desc Swagger documentation by abanoub please don't delete
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerFilePath = path.resolve(process.cwd(), "openapi.yaml");
const fallbackSwaggerFilePath = path.resolve(__dirname, "openapi.yaml");
const resolvedSwaggerFilePath = existsSync(swaggerFilePath)
  ? swaggerFilePath
  : fallbackSwaggerFilePath;
const swaggerDocument = YAML.parse(
  readFileSync(resolvedSwaggerFilePath, "utf8"),
);
//*************************************************************
app.use((req, res, next) => {
  const origin = process.env.CLIENT_URL || "http://localhost:5173";
  res.header("Access-Control-Allow-Origin", origin);
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,PUT,DELETE,OPTIONS",
  );
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

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customSiteTitle: "AI Hiring Platform API Docs",
  }),
);

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/cv", cvRouter);

//categories
app.use("/api/categories", categoryRouter);

app.use(notFoundMW);
app.use(errorHandlingMW);

export default app;
