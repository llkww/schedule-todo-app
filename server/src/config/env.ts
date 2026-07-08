import fs from "node:fs";
import path from "node:path";

import dotenv from "dotenv";
import { z } from "zod";

const localEnvPath = path.resolve(process.cwd(), ".env");
const rootEnvPath = path.resolve(process.cwd(), "../.env");

dotenv.config({ path: fs.existsSync(localEnvPath) ? localEnvPath : rootEnvPath });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1).default("file:./dev.db"),
  JWT_SECRET: z.string().min(32).default("development-only-secret-change-before-production"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().int().positive().default(3001),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:5173"),
});

const parsed = envSchema.parse(process.env);

if (parsed.NODE_ENV === "production" && parsed.JWT_SECRET.includes("development-only")) {
  throw new Error("JWT_SECRET must be configured for production.");
}

export const config = {
  nodeEnv: parsed.NODE_ENV,
  databaseUrl: parsed.DATABASE_URL,
  jwtSecret: parsed.JWT_SECRET,
  jwtExpiresIn: parsed.JWT_EXPIRES_IN,
  port: parsed.PORT,
  frontendOrigin: parsed.FRONTEND_ORIGIN,
};
