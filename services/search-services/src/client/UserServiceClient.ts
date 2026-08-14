import type { AccessToken } from "@video-streaming/common";
import { env } from "../config/env.js";
import { getJson } from "./Upstream.js";

export interface ProfileResult {
  userId: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
}

export interface ChannelResult {
  id: string;
  ownerId: string;
  handle: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  subscriberCount: number;
}

export interface ChannelSummary {
  id: string;
  ownerId: string;
  handle: string;
  name: string;
  avatarUrl: string | null;
}

class UserServiceClient {
  /** GET /search — profiles and channels matching the term. */
  async search(term: string, limit: number, user: AccessToken) {
    return getJson<{
      query: string;
      profiles: ProfileResult[];
      channels: ChannelResult[];
    }>(env.USER_SERVICE_URL, "/search", { q: term, limit }, user);
  }

  /**
   * GET /channels/by-owner — resolve uploader ids to channels.
   *
   * video-service stores the uploader's userId as Video.channelId, so video hits
   * arrive without a channel name. One batch call decorates the whole page.
   */
  async channelsByOwnerIds(ownerIds: string[], user: AccessToken) {
    if (ownerIds.length === 0) return [];

    return getJson<ChannelSummary[]>(
      env.USER_SERVICE_URL,
      "/channels/by-owner",
      { ids: ownerIds.join(",") },
      user,
    );
  }
}

const userServiceClient = new UserServiceClient();

export default userServiceClient;
