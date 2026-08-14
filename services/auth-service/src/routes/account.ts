import express, { type Request } from "express";
import { AuthError } from "@video-streaming/common";
import { SessionService } from "../service/SessionService.js";

const sessionService = new SessionService();

const router: express.Router = express.Router();

/**
 * These routes reach auth-service through the gateway's /api/account mount,
 * which sits behind `authenticate` — so the caller's identity arrives as the
 * x-user-id header, the same way it does for user-service and video-service.
 */
function requireUserId(req: Request): string {
  const userId = req.header("x-user-id");

  if (!userId) {
    throw new AuthError("need to authenticate to access this service");
  }

  return userId;
}

/**
 * GET /account/me
 */
router.get("/me", async (req, res, next) => {
  try {
    res.json(await sessionService.getAccount(requireUserId(req)));
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /account/me/password
 */
router.patch("/me/password", async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body ?? {};

    await sessionService.changePassword(
      requireUserId(req),
      currentPassword,
      newPassword,
    );

    res.json({ message: "Password updated" });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /account/me/email
 */
router.patch("/me/email", async (req, res, next) => {
  try {
    const { currentPassword, newEmail } = req.body ?? {};

    const account = await sessionService.changeEmail(
      requireUserId(req),
      currentPassword,
      newEmail,
    );

    res.json(account);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /account/me
 *
 * Removes the credentials only. Delete the profile via DELETE /api/user/me
 * first, or it is left orphaned.
 */
router.delete("/me", async (req, res, next) => {
  try {
    await sessionService.deleteAccount(
      requireUserId(req),
      req.body?.currentPassword,
    );

    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

export default router;
