/**
 * Integrated server entry point.
 * Integration/testing owner: TAJWAR KHAN
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { initializeDatabase } from "./database/db.js";
import { authRouter } from "./auth/routes.js";
import { profileRouter } from "./profile/routes.js";
import { groupsRouter } from "./groups/routes.js";
import { eventsRouter } from "./events/routes.js";
import { adminRouter } from "./admin/routes.js";
import { errorHandler, notFound } from "./middleware/errors.js";

export async function createApp({ resetDatabase = false } = {}) {
  await initializeDatabase({ reset: resetDatabase });
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: config.clientUrl, credentials: false }));
  app.use(express.json({ limit: "200kb" }));
  if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

  app.get("/api/health", (req, res) => res.json({ status: "ok", service: "CampusConnect API" }));
  app.use("/api/auth", authRouter);
  app.use("/api/profile", profileRouter);
  app.use("/api/groups", groupsRouter);
  app.use("/api/events", eventsRouter);
  app.use("/api/admin", adminRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

if (process.env.NODE_ENV !== "test") {
  const app = await createApp();
  app.listen(config.port, () => console.log(`CampusConnect API running at http://localhost:${config.port}`));
}
