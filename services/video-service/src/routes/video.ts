import express, { type RequestHandler, Router } from "express";
import path from "node:path";
import { ValidationError } from "@video-streaming/common";
import videoService from "../service/VideoService.js";
import commentService from "../service/CommentService.js";
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
 * Public feed, optionally scoped to one channel
 * GET /api/video?limit=&cursor=&channelId=
 */
router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 24, 50);
  const cursor =
    typeof req.query.cursor === "string" ? req.query.cursor : undefined;
  const channelId =
    typeof req.query.channelId === "string" ? req.query.channelId : undefined;

  const videos = await videoService.getFeed(
    req.user.uid,
    limit,
    cursor,
    channelId,
  );

  res.json(videos);
});

/**
 * Search public videos by title/description
 * GET /api/video/search?q=&limit=&cursor=
 *
 * Declared before "/:id" so the literal path wins over the id param.
 */
router.get("/search", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  if (!q) {
    throw new ValidationError("A search term is required.");
  }

  const limit = Math.min(Number(req.query.limit) || 24, 50);
  const cursor =
    typeof req.query.cursor === "string" ? req.query.cursor : undefined;

  const results = await videoService.searchVideos(
    req.user.uid,
    q,
    limit,
    cursor,
  );

  res.json(results);
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
 * Like a video. Posting again while already liked clears the reaction.
 * POST /api/video/:id/like
 */
router.post("/:id/like", async (req, res) => {
  const video = await videoService.reactToVideo(
    req.params.id,
    req.user.uid,
    "LIKE",
  );

  res.json(video);
});

/**
 * Dislike a video. Posting again while already disliked clears the reaction.
 * POST /api/video/:id/dislike
 */
router.post("/:id/dislike", async (req, res) => {
  const video = await videoService.reactToVideo(
    req.params.id,
    req.user.uid,
    "DISLIKE",
  );

  res.json(video);
});

/**
 * Clear whichever reaction is set.
 * DELETE /api/video/:id/like
 * DELETE /api/video/:id/reaction
 */
const clearReaction: RequestHandler<{ id: string }> = async (req, res) => {
  const video = await videoService.clearReaction(req.params.id, req.user.uid);

  res.json(video);
};

router.delete("/:id/like", clearReaction);
router.delete("/:id/reaction", clearReaction);

/**
 * Top-level comments on a video
 * GET /api/video/:id/comments?limit=&cursor=
 */
router.get("/:id/comments", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const cursor =
    typeof req.query.cursor === "string" ? req.query.cursor : undefined;

  const comments = await commentService.getComments(
    req.params.id,
    req.user.uid,
    limit,
    cursor,
  );

  res.json(comments);
});

/**
 * Post a comment (or a reply, via body.parentId)
 * POST /api/video/:id/comments
 */
router.post("/:id/comments", async (req, res) => {
  const comment = await commentService.addComment(
    req.params.id,
    req.user.uid,
    {
      text: req.body?.text,
      parentId:
        typeof req.body?.parentId === "string" ? req.body.parentId : undefined,
    },
  );

  res.status(201).json(comment);
});

export default router;
