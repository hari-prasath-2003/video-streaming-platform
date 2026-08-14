import type { AccessToken } from "@video-streaming/common";
import logger from "@video-streaming/logger";
import userServiceClient, {
  type ChannelResult,
  type ChannelSummary,
  type ProfileResult,
} from "../client/UserServiceClient.js";
import videoServiceClient, {
  type VideoResult,
} from "../client/VideoServiceClient.js";
import type { SearchQuery } from "../validation/index.js";

export interface SearchResults {
  query: string;
  profiles: ProfileResult[];
  channels: ChannelResult[];
  videos: (VideoResult & { channel: ChannelSummary | null })[];
  /** Cursor for the next page of videos; the other sections are unpaged. */
  nextCursor: string | null;
}

/**
 * Run a promise, returning `fallback` if it rejects.
 *
 * A search that finds channels but whose video upstream is down is still a
 * useful search, so no single upstream failure is allowed to fail the request.
 */
async function optional<T>(
  label: string,
  work: Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await work;
  } catch (error) {
    logger.error({ err: error }, `search: ${label} upstream failed`);
    return fallback;
  }
}

class SearchService {
  /**
   * Fan a single term out to every searchable domain and merge the answers.
   *
   * Profiles and channels come from user-service, videos from video-service;
   * neither knows about the other, so the join (video -> owning channel) is
   * done here rather than in the browser.
   */
  async search(query: SearchQuery, user: AccessToken): Promise<SearchResults> {
    const { q, limit, cursor, type } = query;

    const wantsPeople = type === "all" || type === "profile";
    const wantsChannels = type === "all" || type === "channel";
    const wantsVideos = type === "all" || type === "video";

    const [people, videoPage] = await Promise.all([
      wantsPeople || wantsChannels
        ? optional("user", userServiceClient.search(q, limit, user), {
            query: q,
            profiles: [] as ProfileResult[],
            channels: [] as ChannelResult[],
          })
        : { query: q, profiles: [], channels: [] },

      wantsVideos
        ? optional(
            "video",
            videoServiceClient.search(q, limit, user, cursor),
            { query: q, nextCursor: null as string | null, videos: [] as VideoResult[] },
          )
        : { query: q, nextCursor: null, videos: [] },
    ]);

    return {
      query: q,
      profiles: wantsPeople ? people.profiles : [],
      channels: wantsChannels ? people.channels : [],
      videos: await this.attachChannels(videoPage.videos, user),
      nextCursor: videoPage.nextCursor,
    };
  }

  /**
   * Decorate video hits with the channel that owns them, in one batch lookup.
   * The channel is presentation sugar — if the lookup fails the videos still
   * come back, just with a null channel.
   */
  private async attachChannels(videos: VideoResult[], user: AccessToken) {
    if (videos.length === 0) return [];

    const ownerIds = [...new Set(videos.map((video) => video.channelId))];

    const channels = await optional(
      "channels-by-owner",
      userServiceClient.channelsByOwnerIds(ownerIds, user),
      [] as ChannelSummary[],
    );

    const byOwner = new Map(channels.map((channel) => [channel.ownerId, channel]));

    return videos.map((video) => ({
      ...video,
      channel: byOwner.get(video.channelId) ?? null,
    }));
  }
}

const searchService = new SearchService();

export default searchService;
