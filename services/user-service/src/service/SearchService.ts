import profileRepository from "../repository/ProfileRepository.js";
import channelRepository from "../repository/ChannelRepository.js";

class SearchService {
  /**
   * Search people and channels in one pass.
   *
   * MVP implementation: case-insensitive substring matching straight off the
   * primary tables. Good enough at this size; swap for a real index once the
   * profile/channel count makes the sequential scan hurt.
   */
  async search(term: string, limit: number) {
    const [profiles, channels] = await Promise.all([
      profileRepository.search(term, limit),
      channelRepository.search(term, limit),
    ]);

    return {
      query: term,
      profiles: profiles.map((profile) => ({
        userId: profile.userId,
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
      })),
      channels: channels.map((channel) => {
        const { _count, ...rest } = channel as typeof channel & {
          _count: { subscribers: number };
        };

        return { ...rest, subscriberCount: _count.subscribers };
      }),
    };
  }
}

const searchService = new SearchService();

export default searchService;
