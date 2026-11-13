import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "campusconnect-local-development-secret-change-me",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  databaseFile: process.env.DATABASE_FILE
    ? path.resolve(process.env.DATABASE_FILE)
    : path.resolve(here, "../data/campusconnect.sqlite")
};
