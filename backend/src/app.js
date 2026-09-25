
import dotenv from "dotenv";
dotenv.config();
console.log("APP CLIENT_URL =", process.env.CLIENT_URL);
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import exchangeRequestRoutes from "./routes/exchangeRequestRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import {
  generalRateLimiter,
  authRateLimiter,
} from "./middleware/security/rateLimiter.js";
import {
  mongoSanitizeMiddleware,
  xssSanitizeMiddleware,
} from "./middleware/security/sanitize.js";

const app = express();

// ── Request logging ──────────────────────────────────────────────
// "dev" gives concise, colorized console output ideal for local
// development; "combined" is the standard Apache-style access log
// format expected by most hosting platforms' log viewers (Render,
// Railway) and any downstream log-aggregation tool. Neither format
// logs request bodies or headers, so no sensitive data (passwords,
// tokens) is ever written to logs by this middleware.
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(helmet());
console.log("allowedOrigins source =", process.env.CLIENT_URL);
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim());
// ── CORS: supports one or several comma-separated allowed origins ──
// CLIENT_URL can be a single origin (as in every prior step) or a
// comma-separated list (e.g. a production domain plus preview
// deployments) without any code change beyond parsing the string here.
// const allowedOrigins = process.env.CLIENT_URL.split(",").map((origin) =>
//   origin.trim()
// );

app.use(
  cors({
    origin: (origin, callback) => {
      // `origin` is undefined for same-origin requests, server-to-server
      // calls, or tools like curl/Postman with no Origin header — these
      // are allowed through since there's no browser enforcing CORS for
      // them anyway; the check only matters for actual cross-origin
      // browser requests.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(mongoSanitizeMiddleware);
app.use(xssSanitizeMiddleware);

app.use(generalRateLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "SkillBridge API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/exchange-requests", exchangeRequestRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;