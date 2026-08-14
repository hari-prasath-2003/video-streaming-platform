import express, { Router } from "express";
import commentService from "../service/CommentService.js";

const router: Router = express.Router();

/**
 * Replies to a comment
 * GET /api/video/comments/:commentId/replies?limit=&cursor=
 */
router.get("/:commentId/replies", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const cursor =
    typeof req.query.cursor === "string" ? req.query.cursor : undefined;

  const replies = await commentService.getReplies(
    req.params.commentId,
    limit,
    cursor,
  );

  res.json(replies);
});

/**
 * Edit my comment
 * PATCH /api/video/comments/:commentId
 */
router.patch("/:commentId", async (req, res) => {
  const comment = await commentService.updateComment(
    req.params.commentId,
    req.user.uid,
    req.body?.text,
  );

  res.json(comment);
});

/**
 * Delete a comment I wrote, or any comment on a video I own
 * DELETE /api/video/comments/:commentId
 */
router.delete("/:commentId", async (req, res) => {
  await commentService.deleteComment(req.params.commentId, req.user.uid);

  res.sendStatus(204);
});

export default router;
