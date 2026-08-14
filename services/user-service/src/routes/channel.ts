import express, { Router } from "express";
import channelService from "../service/ChannelService.js";

const router: Router = express.Router();

/**
 * Create Channel
 * POST /channels
 */
router.post("/", async (req, res) => {
  const channel = await channelService.createChannel(req.user.uid, req.body);

  res.status(201).json(channel);
});

/**
 * Get My Channel
 * GET /channels/me
 */
router.get("/me", async (req, res) => {
  const channel = await channelService.getMyChannel(req.user.uid);

  res.json(channel);
});

/**
 * Get Public Channel
 * GET /channels/:handle
 */
router.get("/:handle", async (req, res) => {
  const channel = await channelService.getChannelByHandle(req.params.handle);

  res.json(channel);
});

/**
 * Update My Channel
 * PATCH /channels/me
 */
router.patch("/me", async (req, res) => {
  const channel = await channelService.updateChannel(req.user.uid, req.body);

  res.json(channel);
});

/**
 * Delete My Channel
 * DELETE /channels/me
 */
router.delete("/me", async (req, res) => {
  await channelService.deleteChannel(req.user.uid);

  res.sendStatus(204);
});

export default router;
