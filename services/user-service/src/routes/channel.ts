import express, { Router } from "express";
import channelService from "../service/ChannelService.js";
import {
  createChannelSchema,
  parse,
  updateChannelSchema,
} from "../validation/index.js";

const router: Router = express.Router();

/**
 * Create Channel
 * POST /channels
 */
router.post("/", async (req, res) => {
  const channel = await channelService.createChannel(
    req.user.uid,
    parse(createChannelSchema, req.body),
  );

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
 * Resolve several channels by owner id at once.
 *
 * video-service stores the uploader's userId as Video.channelId, so feed and
 * watch screens need a batch lookup to turn those ids into names/avatars
 * without one request per card.
 *
 * GET /channels/by-owner?ids=uuid,uuid
 */
router.get("/by-owner", async (req, res) => {
  const ids =
    typeof req.query.ids === "string"
      ? req.query.ids.split(",").map((id) => id.trim()).filter(Boolean)
      : [];

  const channels = await channelService.getChannelsByOwnerIds(ids);

  res.json(channels);
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
  const channel = await channelService.updateChannel(
    req.user.uid,
    parse(updateChannelSchema, req.body),
  );

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
