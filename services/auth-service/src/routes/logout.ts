import express from "express";

const router: express.Router = express.Router();

/**
 * POST /logout
 *
 * Clears the refresh cookie so the browser can no longer mint access tokens.
 *
 * Note: the already-issued access token stays valid until it expires (15m),
 * and the refresh JWT is not revoked server-side — SessionService still signs
 * refresh tokens with a hardcoded `jid` and never writes a Session row, so
 * there is nothing to revoke against yet.
 */
router.post("/", (req, res) => {
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });

  res.json({ message: "Logged out" });
});

export default router;
