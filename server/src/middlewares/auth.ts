import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

import { config } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { unauthorized } from "../utils/errors.js";

type JwtPayload = {
  sub?: string;
};

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw unauthorized("Authentication required");
    }

    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;

    if (!payload.sub) {
      throw unauthorized("Authentication required");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, username: true, email: true },
    });

    if (!user) {
      throw unauthorized("Authentication required");
    }

    req.user = user;
    next();
  } catch {
    next(unauthorized("Authentication required"));
  }
}
