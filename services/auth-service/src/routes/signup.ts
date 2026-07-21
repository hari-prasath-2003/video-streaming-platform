import express from "express";
import { generateJwtToken } from "../utils/GenerateJwtToken.js";
import { SessionService } from "../service/SessionService.js";

const sessionService = new SessionService();

const router: express.Router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // TODO: Implement signup logic here
    const { user, accessToken, refreshToken } = await sessionService.signUpUser(
      email,
      password,
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth/refresh",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    res.status(200).json({ message: "Signup successful", accessToken, user });
  } catch (error) {
    next(error);
  }
});

export default router;
