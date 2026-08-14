import { prisma } from "../config/db.js";
import type { VideoVisibility } from "../generated/prisma/client.js";

class VideoRepository {
  private prismaClient = prisma;

  async create(data: {
    channelId: string;
    title: string;
    description?: string | undefined;
    thumbnailUrl?: string | undefined;
    videoUrl: string;
    durationSeconds: number;
    visibility: VideoVisibility;
  }) {
    return this.prismaClient.video.create({
      data: {
        ...data,
        description: data.description ?? null,
        thumbnailUrl: data.thumbnailUrl ?? null,
      },
    });
  }

  async findById(id: string) {
    return this.prismaClient.video.findUnique({
      where: { id },
      include: { _count: { select: { comments: true } } },
    });
  }

  async findPublicFeed(limit: number, cursor?: string, channelId?: string) {
    return this.prismaClient.video.findMany({
      where: {
        visibility: "PUBLIC",
        ...(channelId ? { channelId } : {}),
      },
      orderBy: { uploadedAt: "desc" },
      take: limit,
      ...(cursor
        ? { skip: 1, cursor: { id: cursor } }
        : {}),
      include: { _count: { select: { comments: true } } },
    });
  }

  /**
   * Case-insensitive substring match over title and description.
   *
   * MVP implementation: a LIKE scan against the videos table. Fine at this
   * scale; move to Postgres full-text (tsvector + GIN) or a dedicated search
   * service once the catalogue grows.
   */
  async search(term: string, limit: number, cursor?: string) {
    return this.prismaClient.video.findMany({
      where: {
        visibility: "PUBLIC",
        OR: [
          { title: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
        ],
      },
      orderBy: [{ viewCount: "desc" }, { uploadedAt: "desc" }],
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: { _count: { select: { comments: true } } },
    });
  }

  async findLikedByUser(userId: string) {
    return this.prismaClient.video.findMany({
      where: { reactions: { some: { userId, type: "LIKE" } } },
      orderBy: { uploadedAt: "desc" },
      include: { _count: { select: { comments: true } } },
    });
  }

  async delete(id: string) {
    return this.prismaClient.video.delete({ where: { id } });
  }

  async incrementViewCount(id: string) {
    return this.prismaClient.video.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }
}

const videoRepository = new VideoRepository();

export default videoRepository;
