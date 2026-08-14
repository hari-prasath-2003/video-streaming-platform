import express, { Router } from "express";
import { ValidationError } from "@video-streaming/common";
import accountService from "../service/AccountService.js";
import { mediaUrl, upload } from "../utils/Storage.js";
import {
  bootstrapAccountSchema,
  parse,
  updateAccountSchema,
} from "../validation/index.js";

const router: Router = express.Router();

/**
 * Account overview — profile, channel and counts in one call.
 * GET /me
 */
router.get("/", async (req, res) => {
  const account = await accountService.getAccount(
    req.user.uid,
    req.user.email,
    req.user.role,
  );

  res.json(account);
});

/**
 * Create the profile + channel for a user who has only ever signed up.
 * POST /me/bootstrap
 */
router.post("/bootstrap", async (req, res) => {
  const account = await accountService.bootstrapAccount(
    req.user.uid,
    req.user.email,
    req.user.role,
    parse(bootstrapAccountSchema, req.body ?? {}),
  );

  res.status(201).json(account);
});

/**
 * Edit account details — profile and channel patched together.
 * PATCH /me
 */
router.patch("/", async (req, res) => {
  const account = await accountService.updateAccount(
    req.user.uid,
    req.user.email,
    req.user.role,
    parse(updateAccountSchema, req.body),
  );

  res.json(account);
});

/**
 * Upload a profile picture or banner.
 * POST /me/avatar   (multipart, field "avatar")
 * POST /me/banner   (multipart, field "banner")
 */
for (const kind of ["avatar", "banner"] as const) {
  router.post(`/${kind}`, upload.single(kind), async (req, res) => {
    if (!req.file) {
      throw new ValidationError(`A ${kind} image file is required.`);
    }

    const account = await accountService.setImage(
      req.user.uid,
      req.user.email,
      req.user.role,
      kind,
      mediaUrl(kind === "avatar" ? "avatars" : "banners", req.file.filename),
    );

    res.status(201).json(account);
  });

  /** Remove it again. DELETE /me/avatar | /me/banner */
  router.delete(`/${kind}`, async (req, res) => {
    const account = await accountService.setImage(
      req.user.uid,
      req.user.email,
      req.user.role,
      kind,
      null,
    );

    res.json(account);
  });
}

/**
 * Delete the profile, channel and subscriptions for this user.
 * The auth-service credentials are deleted separately.
 * DELETE /me
 */
router.delete("/", async (req, res) => {
  await accountService.deleteAccount(req.user.uid);

  res.sendStatus(204);
});

export default router;
