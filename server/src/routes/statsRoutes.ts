import { Router } from "express";

import { dashboard, matrix, tags } from "../controllers/statsController.js";
import { requireAuth } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const statsRouter = Router();

statsRouter.use(requireAuth);

statsRouter.get("/dashboard", asyncHandler(dashboard));
statsRouter.get("/matrix", asyncHandler(matrix));
statsRouter.get("/tags", asyncHandler(tags));
