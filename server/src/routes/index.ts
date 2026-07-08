import { Router } from "express";

import { authRouter } from "./authRoutes.js";
import { scheduleRouter } from "./scheduleRoutes.js";
import { statsRouter } from "./statsRoutes.js";
import { tagRouter } from "./tagRoutes.js";
import { userRouter } from "./userRoutes.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  return sendSuccess(res, { status: "ok" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/schedules", scheduleRouter);
apiRouter.use("/tags", tagRouter);
apiRouter.use("/stats", statsRouter);
apiRouter.use("/users", userRouter);
