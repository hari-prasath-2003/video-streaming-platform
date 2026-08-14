export interface Profile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
}

export interface Channel {
  id: string;
  ownerId: string;
  handle: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  visibility: "PUBLIC" | "PRIVATE";
}

/** GET /api/user/me */
export interface Account {
  userId: string;
  email: string;
  role: string;
  profile: Profile | null;
  channel: Channel | null;
  subscriberCount: number;
  subscriptionCount: number;
  onboarded: boolean;
}

/**
 * GET /api/user/channels/by-owner?ids=
 *
 * Also the shape search-service hangs off each video hit — see lib/search.ts.
 */
export interface ChannelSummary {
  id: string;
  ownerId: string;
  handle: string;
  name: string;
  avatarUrl: string | null;
}

export function initialsOf(name: string | null | undefined) {
  if (!name) return "??";

  return name
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}
