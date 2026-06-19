import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// ── Import Middlewares ────────────────────────────────────────────────────────
import errorHandlingMW from "./middlewares/errorHandlingMW.js";
import notFoundMW from "./middlewares/notFoundMW.js";

// ── Import Routers ────────────────────────────────────────────────────────────
import authRouter   from "./routes/auth.router.js";
const app = express();


// ── Global Middlewares ────────────────────────────────────────────────────────
app.use(morgan("dev"));
app.use(express.json());

app.use(cookieParser());

// ── Route Mounting ────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);



app.use(notFoundMW);
app.use(errorHandlingMW);


export default app;