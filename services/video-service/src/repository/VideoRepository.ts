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
      include: { _count: { select: { likes: true } } },
    });
  }

  async findPublicFeed(limit: number, cursor?: string) {
    return this.prismaClient.video.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: { uploadedAt: "desc" },
      take: limit,
      ...(cursor
        ? { skip: 1, cursor: { id: cursor } }
        : {}),
      include: { _count: { select: { likes: true } } },
    });
  }

  async findLikedByUser(userId: string) {
    return this.prismaClient.video.findMany({
      where: { likes: { some: { userId } } },
      orderBy: { uploadedAt: "desc" },
      include: { _count: { select: { likes: true } } },
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
