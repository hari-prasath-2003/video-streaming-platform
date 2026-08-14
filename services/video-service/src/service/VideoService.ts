import videoRepository from "../repository/VideoRepository.js";
import videoLikeRepository from "../repository/VideoLikeRepository.js";
import { AuthError, NotFoundError, ValidationError } from "@video-streaming/common";
import type { VideoVisibility } from "../generated/prisma/client.js";

function serialize(
  video: Awaited<ReturnType<typeof videoRepository.findById>>,
) {
  if (!video) return video;

  const { _count, ...rest } = video as typeof video & {
    _count: { likes: number };
  };

  return { ...rest, likeCount: _count.likes };
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

    return serialize(await videoRepository.findById(video.id));
  }

  async getFeed(limit: number, cursor?: string) {
    const videos = await videoRepository.findPublicFeed(limit, cursor);
    return videos.map(serialize);
  }

  async getVideoById(id: string, userId: string) {
    const video = await videoRepository.findById(id);

    if (!video) {
      throw new NotFoundError("Video not found.");
    }

    assertViewable(video, userId);

    const liked = await videoLikeRepository.find(id, userId);

    return { ...serialize(video), liked: liked !== null };
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

  async likeVideo(id: string, userId: string) {
    const video = await videoRepository.findById(id);

    if (!video) {
      throw new NotFoundError("Video not found.");
    }

    const existing = await videoLikeRepository.find(id, userId);

    if (existing) {
      return;
    }

    await videoLikeRepository.like(id, userId);
  }

  async unlikeVideo(id: string, userId: string) {
    const existing = await videoLikeRepository.find(id, userId);

    if (!existing) {
      return;
    }

    await videoLikeRepository.unlike(id, userId);
  }

  async getLikedVideos(userId: string) {
    const videos = await videoRepository.findLikedByUser(userId);
    return videos.map(serialize);
  }
}

const videoService = new VideoService();

export default videoService;
