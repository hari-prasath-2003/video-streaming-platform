import videoRepository from "../repository/VideoRepository.js";
import videoReactionRepository from "../repository/VideoReactionRepository.js";
import { AuthError, NotFoundError, ValidationError } from "@video-streaming/common";
import type { ReactionType, VideoVisibility } from "../generated/prisma/client.js";

type VideoRow = NonNullable<Awaited<ReturnType<typeof videoRepository.findById>>>;

function serialize(
  video: VideoRow,
  counts: Map<string, { like: number; dislike: number }>,
  mine: Map<string, ReactionType>,
) {
  const { _count, ...rest } = video as VideoRow & {
    _count: { comments: number };
  };

  const totals = counts.get(video.id) ?? { like: 0, dislike: 0 };
  const reaction = mine.get(video.id) ?? null;

  return {
    ...rest,
    commentCount: _count.comments,
    likeCount: totals.like,
    dislikeCount: totals.dislike,
    reaction,
    // Retained so existing callers that only care about likes keep working.
    liked: reaction === "LIKE",
  };
}

/**
 * Attach reaction totals and the caller's own reaction to a page of videos.
 * Two batched queries regardless of page size.
 */
async function withReactions(videos: VideoRow[], userId: string) {
  const ids = videos.map((video) => video.id);

  const [counts, mine] = await Promise.all([
    videoReactionRepository.countsFor(ids),
    videoReactionRepository.findManyForUser(ids, userId),
  ]);

  return videos.map((video) => serialize(video, counts, mine));
}

function assertViewable(
  video: { visibility: VideoVisibility; channelId: string },
  userId: string,
) {
  if (video.visibility === "PRIVATE" && video.channelId !== userId) {
    throw new NotFoundError("Video not found.");
  }
}

class VideoService {
  async uploadVideo(
    uploaderId: string,
    data: {
      title: string;
      description?: string | undefined;
      videoUrl: string;
      thumbnailUrl?: string | undefined;
      durationSeconds?: number | undefined;
      visibility?: "PUBLIC" | "PRIVATE" | "UNLISTED" | undefined;
    },
  ) {
    if (!data.title?.trim()) {
      throw new ValidationError("Title is required.");
    }

    const video = await videoRepository.create({
      channelId: uploaderId,
      title: data.title,
      description: data.description,
      videoUrl: data.videoUrl,
      thumbnailUrl: data.thumbnailUrl,
      durationSeconds: data.durationSeconds ?? 0,
      visibility: data.visibility ?? "PUBLIC",
    });

    const [created] = await withReactions(
      [(await videoRepository.findById(video.id))!],
      uploaderId,
    );

    return created;
  }

  async getFeed(
    userId: string,
    limit: number,
    cursor?: string,
    channelId?: string,
  ) {
    const videos = await videoRepository.findPublicFeed(
      limit,
      cursor,
      channelId,
    );

    return withReactions(videos, userId);
  }

  async searchVideos(
    userId: string,
    term: string,
    limit: number,
    cursor?: string,
  ) {
    const videos = await videoRepository.search(term, limit, cursor);

    return {
      query: term,
      nextCursor: videos.length === limit ? videos[videos.length - 1]!.id : null,
      videos: await withReactions(videos, userId),
    };
  }

  async getVideoById(id: string, userId: string) {
    const video = await videoRepository.findById(id);

    if (!video) {
      throw new NotFoundError("Video not found.");
    }

    assertViewable(video, userId);

    const [decorated] = await withReactions([video], userId);

    return decorated;
  }

  async deleteVideo(id: string, userId: string) {
    const video = await videoRepository.findById(id);

    if (!video) {
      throw new NotFoundError("Video not found.");
    }

    if (video.channelId !== userId) {
      throw new AuthError("You do not own this video.");
    }

    await videoRepository.delete(id);
  }

  async recordView(id: string) {
    const video = await videoRepository.findById(id);

    if (!video) {
      throw new NotFoundError("Video not found.");
    }

    await videoRepository.incrementViewCount(id);
  }

  /**
   * Like or dislike a video. Reacting the same way twice clears the reaction,
   * which is what makes the buttons behave as toggles; reacting the other way
   * switches sides in a single write.
   */
  async reactToVideo(id: string, userId: string, type: ReactionType) {
    const video = await videoRepository.findById(id);

    if (!video) {
      throw new NotFoundError("Video not found.");
    }

    assertViewable(video, userId);

    const existing = await videoReactionRepository.find(id, userId);

    if (existing?.type === type) {
      await videoReactionRepository.clear(id, userId);
    } else {
      await videoReactionRepository.set(id, userId, type);
    }

    const [decorated] = await withReactions([video], userId);

    return decorated;
  }

  async clearReaction(id: string, userId: string) {
    const video = await videoRepository.findById(id);

    if (!video) {
      throw new NotFoundError("Video not found.");
    }

    await videoReactionRepository.clear(id, userId);

    const [decorated] = await withReactions([video], userId);

    return decorated;
  }

  async getLikedVideos(userId: string) {
    const videos = await videoRepository.findLikedByUser(userId);

    return withReactions(videos, userId);
  }
}

const videoService = new VideoService();

export default videoService;
