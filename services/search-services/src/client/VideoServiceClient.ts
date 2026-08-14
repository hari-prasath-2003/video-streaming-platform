import type { AccessToken } from "@video-streaming/common";
import { env } from "../config/env.js";
import { getJson } from "./Upstream.js";

export interface VideoResult {
  id: string;
  channelId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  videoUrl: string;
  durationSeconds: number;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  reaction: "LIKE" | "DISLIKE" | null;
  visibility: "PUBLIC" | "PRIVATE" | "UNLISTED";
  uploadedAt: string;
}

class VideoServiceClient {
  /** GET /search — public videos matching the term, cursor-paged. */
  async search(
    term: string,
    limit: number,
    user: AccessToken,
    cursor?: string,
  ) {
    return getJson<{
      query: string;
      nextCursor: string | null;
      videos: VideoResult[];
    }>(
      env.VIDEO_SERVICE_URL,
      "/search",
      { q: term, limit, cursor },
      user,
    );
  }
}

const videoServiceClient = new VideoServiceClient();

export default videoServiceClient;
