import express from "express";

export const app = express();

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" }, message: "success" });
});
