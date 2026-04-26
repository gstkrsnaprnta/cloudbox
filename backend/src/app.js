import cors from "cors";
import express from "express";
import morgan from "morgan";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import boxRoutes from "./routes/boxRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import packageRoutes from "./routes/packageRoutes.js";
import xenditRoutes from "./routes/xenditRoutes.js";

export const app = express();

const allowedOrigins = new Set([
  env.frontendUrl,
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.appEnv === "production" ? "combined" : "dev"));

app.get("/api/health", (req, res) => {
  res.json({
    app: env.appName,
    environment: env.appEnv,
    status: "ok"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/boxes", boxRoutes);
app.use("/api/xendit", xenditRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, req, res, next) => {
  if (error instanceof ZodError) {
    return res.status(422).json({ message: "Validation failed.", errors: error.flatten() });
  }

  console.error(error);
  res.status(500).json({
    message: env.appDebug ? error.message : "Internal server error."
  });
});
