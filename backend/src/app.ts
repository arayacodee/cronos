import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import { env } from "./config/env.js";


import businessRoutes from "./routes/business.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import availabilityRoutes from "./routes/availability.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";

import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";


const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(
  "/api/auth",
  authRoutes
);

app.use(express.json({ limit: "100kb" }));

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      service: "cronos-api",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      status: "error",
      service: "cronos-api",
      database: "disconnected",
    });
  }
});


app.use("/api/businesses", businessRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/availabilities", availabilityRoutes);
app.use("/api/reservations", reservationRoutes);

app.use((_req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});



export default app;