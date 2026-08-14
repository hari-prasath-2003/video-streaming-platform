import express, { Router } from "express";
import path from "node:path";
import { ValidationError } from "@video-streaming/common";
import videoService from "../service/VideoService.js";
import { upload } from "../utils/Storage.js";

const router: Router = express.Router();

function mediaUrl(kind: "videos" | "thumbnails", filename: string) {
  return `/api/video/media/${kind}/${filename}`;
}

/**
 * Upload a video
 * POST /api/video
 */
router.post(
  "/",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    const files = req.files as
      | Record<string, Express.Multer.File[]>
      | undefined;

    const videoFile = files?.video?.[0];
    const thumbnailFile = files?.thumbnail?.[0];

    if (!videoFile) {
      throw new ValidationError("A video file is required.");
    }

    const visibility =
      req.body.visibility === "private"
        ? "PRIVATE"
        : req.body.visibility === "unlisted"
          ? "UNLISTED"
          : "PUBLIC";

    const video = await videoService.uploadVideo(req.user.uid, {
      title: req.body.title,
      description: req.body.description,
      videoUrl: mediaUrl("videos", path.basename(videoFile.path)),
      thumbnailUrl: thumbnailFile
        ? mediaUrl("thumbnails", path.basename(thumbnailFile.path))
        : undefined,
      durationSeconds: req.body.durationSeconds
        ? Math.round(Number(req.body.durationSeconds))
        : undefined,
      visibility,
    });

    res.status(201).json(video);
  },
);

/**
 * Public feed
 * GET /api/video?limit=&cursor=
 */
router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 24, 50);
  const cursor =
    typeof req.query.cursor === "string" ? req.query.cursor : undefined;

  const videos = await videoService.getFeed(limit, cursor);

  res.json(videos);
});

/**
 * Videos the current user has liked
 * GET /api/video/liked
 */
router.get("/liked", async (req, res) => {
  const videos = await videoService.getLikedVideos(req.user.uid);

  res.json(videos);
});

/**
 * Video detail
 * GET /api/video/:id
 */
router.get("/:id", async (req, res) => {
  const video = await videoService.getVideoById(req.params.id, req.user.uid);

  res.json(video);
});

/**
 * Delete a video I own
 * DELETE /api/video/:id
 */
router.delete("/:id", async (req, res) => {
  await videoService.deleteVideo(req.params.id, req.user.uid);

  res.sendStatus(204);
});

/**
 * Record a view
 * POST /api/video/:id/views
 */
router.post("/:id/views", async (req, res) => {
  await videoService.recordView(req.params.id);

  res.sendStatus(204);
});

/**
 * Like a video
 * POST /api/video/:id/like
 */
router.post("/:id/like", async (req, res) => {
  await videoService.likeVideo(req.params.id, req.user.uid);

  res.sendStatus(204);
});

/**
 * Unlike a video
 * DELETE /api/video/:id/like
 */
router.delete("/:id/like", async (req, res) => {
  await videoService.unlikeVideo(req.params.id, req.user.uid);

  res.sendStatus(204);
});

export default router;
