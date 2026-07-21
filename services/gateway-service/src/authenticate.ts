import type { NextFunction, Request, Response } from "express";
import { verifyJwtToken } from "./utils/VerifyJwtToken.js";
import { env } from "./config/env.js";
import { AuthError } from "@video-streaming/common";
import { JWTExpired, JWTInvalid } from "jose/errors";

export default async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Missing access token",
      });
    }

    const accessToken = authHeader.substring(7);

    const user = await verifyJwtToken(accessToken, env.JWT_SECRET);
    req.user = user;
    next(req);
  } catch (error) {
    if (error instanceof JWTExpired) {
      throw new AuthError("Refresh token has expired");
    } else if (error instanceof JWTInvalid) {
      throw new AuthError("Invalid refresh token");
    }
    throw error;
  }
}
