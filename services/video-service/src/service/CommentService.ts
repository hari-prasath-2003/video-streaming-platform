import commentRepository from "../repository/CommentRepository.js";
import videoRepository from "../repository/VideoRepository.js";
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "@video-streaming/common";

const MAX_LENGTH = 2000;

function serialize(
  comment: Awaited<ReturnType<typeof commentRepository.findById>>,
) {
  if (!comment) return comment;

  const { _count, ...rest } = comment as typeof comment & {
    _count: { replies: number };
  };

  return { ...rest, replyCount: _count.replies };
}

class CommentService {
  async addComment(
    videoId: string,
    authorId: string,
    data: { text: string; parentId?: string | undefined },
  ) {
    const text = data.text?.trim();

    if (!text) {
      throw new ValidationError("Comment text is required.");
    }

    if (text.length > MAX_LENGTH) {
      throw new ValidationError(
        `Comment must be ${MAX_LENGTH} characters or fewer.`,
      );
    }

    const video = await videoRepository.findById(videoId);

    if (!video) {
      throw new NotFoundError("Video not found.");
    }

    // Private videos are readable only by their uploader, so they must not be
    // commentable by anyone else either.
    if (video.visibility === "PRIVATE" && video.channelId !== authorId) {
      throw new NotFoundError("Video not found.");
    }

    if (data.parentId) {
      const parent = await commentRepository.findById(data.parentId);

      if (!parent || parent.videoId !== videoId) {
        throw new NotFoundError("Parent comment not found.");
      }

      // Threads stay one level deep: replying to a reply attaches to the
      // original top-level comment instead of nesting further.
      const parentId = parent.parentId ?? parent.id;

      return serialize(
        await commentRepository.create({ videoId, authorId, parentId, text }),
      );
    }

    return serialize(await commentRepository.create({ videoId, authorId, text }));
  }

  async getComments(
    videoId: string,
    userId: string,
    limit: number,
    cursor?: string,
  ) {
    const video = await videoRepository.findById(videoId);

    if (!video) {
      throw new NotFoundError("Video not found.");
    }

    if (video.visibility === "PRIVATE" && video.channelId !== userId) {
      throw new NotFoundError("Video not found.");
    }

    const [comments, total] = await Promise.all([
      commentRepository.findTopLevel(videoId, limit, cursor),
      commentRepository.countForVideo(videoId),
    ]);

    return {
      total,
      nextCursor:
        comments.length === limit ? comments[comments.length - 1]!.id : null,
      comments: comments.map(serialize),
    };
  }

  async getReplies(commentId: string, limit: number, cursor?: string) {
    const parent = await commentRepository.findById(commentId);

    if (!parent) {
      throw new NotFoundError("Comment not found.");
    }

    const replies = await commentRepository.findReplies(
      commentId,
      limit,
      cursor,
    );

    return {
      nextCursor:
        replies.length === limit ? replies[replies.length - 1]!.id : null,
      replies: replies.map(serialize),
    };
  }

  async updateComment(commentId: string, userId: string, text: string) {
    const trimmed = text?.trim();

    if (!trimmed) {
      throw new ValidationError("Comment text is required.");
    }

    if (trimmed.length > MAX_LENGTH) {
      throw new ValidationError(
        `Comment must be ${MAX_LENGTH} characters or fewer.`,
      );
    }

    const comment = await commentRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundError("Comment not found.");
    }

    if (comment.authorId !== userId) {
      throw new AuthError("You can only edit your own comments.");
    }

    return serialize(await commentRepository.update(commentId, trimmed));
  }

  /**
   * Authors can delete their own comments; the video's uploader can delete any
   * comment on their video (basic moderation). Replies cascade.
   */
  async deleteComment(commentId: string, userId: string) {
    const comment = await commentRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundError("Comment not found.");
    }

    if (comment.authorId !== userId) {
      const video = await videoRepository.findById(comment.videoId);

      if (!video || video.channelId !== userId) {
        throw new AuthError("You cannot delete this comment.");
      }
    }

    await commentRepository.delete(commentId);
  }
}

const commentService = new CommentService();

export default commentService;
