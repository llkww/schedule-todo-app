import { Router } from "express";

import { sendSuccess } from "../utils/apiResponse.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  return sendSuccess(res, { status: "ok" });
});
