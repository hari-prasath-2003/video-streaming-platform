import { prisma } from "../config/db.js";
import type { ReactionType } from "../generated/prisma/client.js";

class VideoReactionRepository {
  private prismaClient = prisma;

  /**
   * Record a reaction, replacing whichever side the user was on before.
   * A single upsert makes switching like <-> dislike atomic.
   */
  async set(videoId: string, userId: string, type: ReactionType) {
    return this.prismaClient.videoReaction.upsert({
      where: { videoId_userId: { videoId, userId } },
      create: { videoId, userId, type },
      update: { type },
    });
  }

  async clear(videoId: string, userId: string) {
    return this.prismaClient.videoReaction.deleteMany({
      where: { videoId, userId },
    });
  }

  async find(videoId: string, userId: string) {
    return this.prismaClient.videoReaction.findUnique({
      where: { videoId_userId: { videoId, userId } },
    });
  }

  /**
   * Like/dislike totals for a batch of videos in one grouped query, so a feed
   * of N cards still costs one round trip rather than N.
   */
  async countsFor(videoIds: string[]) {
    const totals = new Map<string, { like: number; dislike: number }>();

    if (videoIds.length === 0) return totals;

    const rows = await this.prismaClient.videoReaction.groupBy({
      by: ["videoId", "type"],
      where: { videoId: { in: videoIds } },
      _count: { _all: true },
    });

    for (const row of rows) {
      const entry = totals.get(row.videoId) ?? { like: 0, dislike: 0 };

      if (row.type === "DISLIKE") {
        entry.dislike = row._count._all;
      } else {
        entry.like = row._count._all;
      }

      totals.set(row.videoId, entry);
    }

    return totals;
  }

  /** This user's own reaction to each of the given videos. */
  async findManyForUser(videoIds: string[], userId: string) {
    const mine = new Map<string, ReactionType>();

    if (videoIds.length === 0) return mine;

    const rows = await this.prismaClient.videoReaction.findMany({
      where: { videoId: { in: videoIds }, userId },
    });

    for (const row of rows) {
      mine.set(row.videoId, row.type);
    }

    return mine;
  }
}

const videoReactionRepository = new VideoReactionRepository();

export default videoReactionRepository;
