import { Router } from "express";

import { authRouter } from "./authRoutes.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  return sendSuccess(res, { status: "ok" });
});

apiRouter.use("/auth", authRouter);
