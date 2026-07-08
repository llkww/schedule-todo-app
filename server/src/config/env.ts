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
  JWT_SECRET:
    process.env.NODE_ENV === "test"
      ? z.string().min(32).default("test-only-secret-with-more-than-thirty-two-characters")
      : z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().int().positive().default(3001),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:5173"),
});

const parsed = envSchema.parse(process.env);

export const config = {
  nodeEnv: parsed.NODE_ENV,
  databaseUrl: parsed.DATABASE_URL,
  jwtSecret: parsed.JWT_SECRET,
  jwtExpiresIn: parsed.JWT_EXPIRES_IN,
  port: parsed.PORT,
  frontendOrigin: parsed.FRONTEND_ORIGIN,
};
