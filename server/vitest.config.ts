import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "file:./test.db",
      JWT_SECRET: "test-only-secret-with-more-than-thirty-two-characters",
      JWT_EXPIRES_IN: "7d",
      FRONTEND_ORIGIN: "http://localhost:5173",
    },
  },
});
