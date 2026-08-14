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
    const queryToken =
      typeof req.query.token === "string" ? req.query.token : undefined;

    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : queryToken;

    // <video>/<img> tags can't send an Authorization header, so media
    // requests fall back to a ?token= query param carrying the same JWT.
    if (!accessToken) {
      return res.status(401).json({
        message: "Missing access token",
      });
    }

    const user = await verifyJwtToken(accessToken, env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof JWTExpired) {
      throw new AuthError("Refresh token has expired");
    } else if (error instanceof JWTInvalid) {
      throw new AuthError("Invalid refresh token");
    }
    throw error;
  }
}
