import express, { Router } from "express";
import { SessionService } from "../service/SessionService.js";

const router: Router = express.Router();
const sessionService = new SessionService();

router.get("/", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken as string | undefined;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token not found",
      });
    }

    const { user, accessToken, newRefreshToken } =
      await sessionService.refreshToken(refreshToken);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth/refresh",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    res
      .status(200)
      .json({ message: "Token refresh successful", accessToken, user });
  } catch (error) {
    next(error);
  }
});

export default router;
