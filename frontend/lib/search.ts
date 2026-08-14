import type { Video } from "./video";
import type { Channel, ChannelSummary, Profile } from "./user";

export type SearchProfile = Pick<
  Profile,
  "userId" | "username" | "displayName" | "bio" | "avatarUrl"
>;

export type SearchChannel = Channel & { subscriberCount: number };

/**
 * search-service resolves each video's uploader to a channel before replying,
 * so cards render a real name without a second round trip.
 */
export type SearchVideo = Video & { channel: ChannelSummary | null };

/** GET /api/search?q=&limit=&cursor=&type= */
export interface SearchResults {
  query: string;
  profiles: SearchProfile[];
  channels: SearchChannel[];
  videos: SearchVideo[];
  /** Paging cursor for the video section; people and channels are unpaged. */
  nextCursor: string | null;
}
